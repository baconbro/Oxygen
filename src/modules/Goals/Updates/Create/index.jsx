import { useState } from 'react';
import BodyForm from '../BodyForm';
import { Create, UserAvatar, Right } from './Styles';
import { useAuth } from "../../../auth"

const UpdatesCreate = ({ issue, updateIssue, object }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const { currentUser } = useAuth();

  const handleCommentCreate = async ({ body, newStatus, newScore, date, id }) => {
    try {
      setCreating(true);
      const comment = {
        body: body,
        issueId: issue.id,
        id: id,
        createdAt: date,
        user: currentUser.all.email,
        newScore: newScore,
        newStatus: newStatus,
        oldStatus: issue.status !== newStatus ? issue.status : null,
        oldScore: issue.score !== newScore ? issue.score : null,
      };

      const updatedComments = issue[object] ? [...issue[object], comment] : [comment];
      await updateIssue({ [object]: updatedComments, status: newStatus, score: newScore });
      setFormOpen(false);
      setCreating(false);
    } catch (error) {
      setCreating(false);
    }
  };

  return (
    <Create>
      {currentUser && <UserAvatar name={currentUser.all.fName} avatarUrl={currentUser.all.photoURL} />}
      <Right>
        {isFormOpen ? (
          <BodyForm
            newStatus={issue.status}
            isWorking={isCreating}
            onSubmit={handleCommentCreate}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="btn btn-outline btn-outline-primary btn-active-light-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3"
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add a check-in</span>
          </button>
        )}
      </Right>
    </Create>
  );
};

export default UpdatesCreate;
