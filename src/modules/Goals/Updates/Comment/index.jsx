import { useState } from 'react';
import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';
import BodyForm from '../BodyForm';
import {
  Comment,
  UserAvatar,
  DeleteLink,
} from './Styles';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';
import { customStatus, getScoreColor } from '../../../../constants/custom';
import { Status } from '../../../IssueDetails/Status/Styles';


const DetailsUpdate = ({ comment, issue, updateIssue, object }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const [body, setBody] = useState(comment.body);
  const { orgUsers } = useWorkspace();

  // Find the user in orgUsers - orgUsers has a .users property that is an object
  const findUser = () => {
    if (orgUsers?.users) {
      return Object.values(orgUsers.users).find(u => u.email === comment.user);
    }
    return null;
  };
  const user = findUser();
  const displayName = user?.name || user?.displayName || user?.fName || comment.user || 'Unknown';

  const handleCommentDelete = async () => {
    try {
      const updatedComments = issue[object].filter(c => c.id !== comment.id);
      updateIssue({ [object]: updatedComments });
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  const handleCommentUpdate = async () => {
    try {
      setUpdating(true);
      const updatedComments = issue[object].map(c =>
        c.id === comment.id ? { ...c, body } : c
      );
      updateIssue({ [object]: updatedComments });
      setUpdating(false);
      setFormOpen(false);
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  return (
    <Comment>
      <div className="mb-7">
        <div className="d-flex mb-5">
          <div className="avatar avatar-45px me-5">
            <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} />
          </div>
          <div className="d-flex flex-column flex-row-fluid">
            <div className="d-flex align-items-center flex-wrap mb-1">
              <span className="text-gray-800 fw-bold me-2">{displayName}</span>
              <span className="text-gray-400 fw-semibold fs-7">
                {formatDateTimeConversational(comment.createdAt)}
                {comment.editedAt && <span> - edited</span>}
              </span>
              {!isFormOpen && (
                <span className="ms-auto text-gray-400 text-hover-primary fw-semibold fs-7">
                  <ConfirmModal
                    title="Are you sure you want to delete this update?"
                    message="Once you delete, it's gone for good."
                    confirmText="Delete update"
                    onConfirm={handleCommentDelete}
                    className="card card-flush border-0 h-md-100"
                    renderLink={modal => <DeleteLink onClick={modal.open}>Delete</DeleteLink>}
                  />
                </span>
              )}
            </div>

            <span className="text-gray-800 fs-7 fw-normal pt-1">
              {isFormOpen ? (
                <BodyForm
                  value={body}
                  onChange={setBody}
                  isWorking={isUpdating}
                  onSubmit={handleCommentUpdate}
                  onCancel={() => setFormOpen(false)}
                />
              ) : (
                <div className="timeline-item">
                  <div className="timeline-content mb-10 mt-n1">
                    {comment.body && (
                      <div className="pe-3 mb-5">
                        <div className="fs-5 fw-semibold mb-2">{comment.body}</div>
                      </div>
                    )}
                    <div className="overflow-auto pb-5">
                      <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3 mb-5">
                        {(comment.oldScore !== null || comment.newScore) && (
                          <div className="min-w-175px pe-2">
                            <span className={`badge badge-light-${getScoreColor(comment.oldScore)} fs-base me-2`}>
                              {comment.oldScore ?? '-'}
                            </span>
                            <i className="bi bi-arrow-right fs-2 text-muted me-2"></i>
                            <span className={`badge badge-light-${getScoreColor(comment.newScore)} fs-base me-2`}>
                              {comment.newScore}
                            </span>
                          </div>
                        )}
                        {(comment.oldStatus || comment.newStatus) && (
                          <div className="min-w-125px pe-2">
                            {comment.oldStatus && (
                              <>
                                <Status className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.oldStatus]} me-2`} color={comment.oldStatus}>
                                  {customStatus.IssueStatusCopy[comment.oldStatus]}
                                </Status>
                                <i className="bi bi-arrow-right fs-2 text-muted me-2"></i>
                              </>
                            )}
                            <Status className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.newStatus]} me-2`} color={comment.newStatus}>
                              {customStatus.IssueStatusCopy[comment.newStatus]}
                            </Status>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </span>
          </div>
        </div>
      </div>
    </Comment>
  );
};

export default DetailsUpdate;
