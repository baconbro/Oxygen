import { useState } from 'react';
import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';
import BodyForm from '../BodyForm';
import {
  Comment,
  UserAvatar,
  Content,
  Username,
  CreatedAt,
  Body,
  EditLink,
  DeleteLink,
} from './Styles';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';


const DetailsComment = ({ comment, issue, updateIssue, object }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const initComment = comment;
  const [body, setBody] = useState(initComment.body);
  const { orgUsers } = useWorkspace();

  // Find the user in orgUsers
  const user = orgUsers.find(user => user.email === comment.user);

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
    <Comment data-testid="issue-comment">
      <div className="mb-7">

        <div className="d-flex mb-5">

          <div className="avatar avatar-45px me-5">
            <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} />
          </div>

          <div className="d-flex flex-column flex-row-fluid">

            <div className="d-flex align-items-center flex-wrap mb-1">
              <a href="#" className="text-gray-800 text-hover-primary fw-bold me-2">{comment.user.name}</a>

              <span className="text-gray-400 fw-semibold fs-7">
                {formatDateTimeConversational(comment.createdAt)}
                {comment.editedAt ? (<span> - edited</span>) : (<span></span>)}
              </span>

              {isFormOpen ? (<span></span>) : (<span className="ms-auto text-gray-400 text-hover-primary fw-semibold fs-7"><ConfirmModal
                title="Are you sure you want to delete this comment?"
                message="Once you delete, it's gone for good."
                confirmText="Delete comment"
                onConfirm={handleCommentDelete}
                className="card card-flush border-0 h-md-100"
                renderLink={modal => <DeleteLink onClick={modal.open}>Delete</DeleteLink>}
              /> -  <EditLink onClick={() => setFormOpen(true)}>Edit</EditLink> </span>)}
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
                <>
                  {comment.body}
                </>
              )}

            </span>

          </div>
        </div>

      </div>

      <Content>
        <Username></Username>
        <CreatedAt></CreatedAt>


      </Content>
    </Comment>
  );
};

export default DetailsComment;
