import { useState } from 'react';
import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';
import BodyForm from '../BodyForm';
import { Avatar } from '../../../../components/common';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';


const DetailsComment = ({ comment, issue, updateIssue, object }) => {
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
      console.error('Error deleting comment:', error);
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
      console.error('Error updating comment:', error);
    }
  };

  return (
    <div className="relative mt-[25px] text-[15px]" data-testid="issue-comment">
      <div className="mb-7">
        <div className="d-flex mb-5">
          <div className="avatar avatar-45px me-5">
            <Avatar className="relative top-0 left-0" name={user?.name} avatarUrl={user?.avatarUrl} />
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
                    title="Are you sure you want to delete this comment?"
                    message="Once you delete, it's gone for good."
                    confirmText="Delete comment"
                    onConfirm={handleCommentDelete}
                    className="card card-flush border-0 h-md-100"
                    renderLink={modal => <div className="inline-block py-[2px] text-gray-500 text-[14.5px] cursor-pointer hover:underline pl-[10px]" onClick={modal.open}>Delete</div>}
                  />
                  {' - '}
                  <div className="mr-[12px] inline-block py-[2px] text-gray-500 text-[14.5px] cursor-pointer hover:underline" onClick={() => setFormOpen(true)}>Edit</div>
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
                <p className="pb-[10px] whitespace-pre-wrap">{comment.body}</p>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsComment;
