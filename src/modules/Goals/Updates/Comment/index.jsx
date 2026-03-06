import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';
import {
  Comment,
  UserAvatar,
  DeleteLink,
} from './Styles';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';
import { customStatus, getScoreColor } from '../../../../constants/custom';
import { Status } from '../../../IssueDetails/Status/Styles';


const DetailsUpdate = ({ comment, issue, updateIssue, object }) => {
  const { orgUsers } = useWorkspace();

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

  const hasScoreChange = comment.oldScore !== null && comment.oldScore !== undefined;
  const hasStatusChange = comment.oldStatus && comment.oldStatus !== comment.newStatus;

  return (
    <Comment>
      <div className="d-flex mb-6">
        <div className="me-4">
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} />
        </div>
        <div className="flex-fill">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <span className="text-gray-800 fw-bold me-2">{displayName}</span>
              <span className="text-gray-400 fw-semibold fs-7">
                {formatDateTimeConversational(comment.createdAt)}
              </span>
            </div>
            <ConfirmModal
              title="Delete this check-in?"
              message="This will remove the check-in record. The goal's current score and status won't be affected."
              confirmText="Delete"
              onConfirm={handleCommentDelete}
              className="card card-flush border-0 h-md-100"
              renderLink={modal => (
                <DeleteLink onClick={modal.open} className="text-gray-400 text-hover-danger">
                  <i className="bi bi-trash fs-7"></i>
                </DeleteLink>
              )}
            />
          </div>

          {/* Changes */}
          <div className="border border-gray-200 rounded p-3">
            <div className="d-flex flex-wrap gap-4 align-items-center">
              {/* Score change */}
              {comment.newScore !== null && comment.newScore !== undefined && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-gray-500 fs-7 fw-semibold">Value:</span>
                  {hasScoreChange && (
                    <>
                      <span className={`badge badge-light-${getScoreColor(comment.oldScore)} fs-7`}>
                        {comment.oldScore}
                      </span>
                      <i className="bi bi-arrow-right text-gray-400 fs-8"></i>
                    </>
                  )}
                  <span className={`badge badge-light-${getScoreColor(comment.newScore)} fs-7`}>
                    {comment.newScore}
                  </span>
                </div>
              )}

              {/* Status change */}
              {comment.newStatus && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-gray-500 fs-7 fw-semibold">Status:</span>
                  {hasStatusChange && (
                    <>
                      <Status
                        className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.oldStatus]}`}
                        color={comment.oldStatus}
                        style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                      >
                        {customStatus.IssueStatusCopy[comment.oldStatus]}
                      </Status>
                      <i className="bi bi-arrow-right text-gray-400 fs-8"></i>
                    </>
                  )}
                  <Status
                    className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.newStatus]}`}
                    color={comment.newStatus}
                    style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                  >
                    {customStatus.IssueStatusCopy[comment.newStatus]}
                  </Status>
                </div>
              )}
            </div>

            {/* Comment body */}
            {comment.body && (
              <div className="mt-3 pt-3 border-top border-gray-200">
                <span className="text-gray-700 fs-7">{comment.body}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Comment>
  );
};

export default DetailsUpdate;
