import { useState } from 'react';
import BodyForm from '../BodyForm';
import { Create, UserAvatar, Right, FakeTextarea } from './Styles';
import { useAuth } from "../../../auth"

const UpdatesCreate = ({ issue, updateIssue, object }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');
  const [score, setScore] = useState('');
  const [newStatus, setNewStatus] = useState(issue.status);
  const [date, setDate] = useState('');

  //const {currentUser} = useAuth();
  const { currentUser } = useAuth()

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
        //if issue.status is not equal to newStatus, then add old status
        oldStatus: issue.status !== newStatus ? issue.status : null,
        //if issue.score is not equal to score, then add old score
        oldScore: issue.score !== score ? issue.score : null,
      };

      // Update the issue with the new comment
      const updatedComments = issue[object] ? [...issue[object], comment] : [comment];
      await updateIssue({ [object]: updatedComments, status: newStatus, score: newScore });
      setScore('');
      setNewStatus('');
      setDate('');
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {

    }
  };

  return (
    <Create>
      {currentUser && <UserAvatar name={currentUser.all.fName} avatarUrl={currentUser.all.photoURL} />}
      <Right>
        {isFormOpen ? (
          <BodyForm
            body={body}
            score={score}
            newStatus={newStatus}
            date={date}
            isWorking={isCreating}
            onSubmit={handleCommentCreate}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <>
            <FakeTextarea onClick={() => setFormOpen(true)}>Add an update</FakeTextarea>
          </>
        )}
      </Right>
    </Create>
  );
};

export default UpdatesCreate;
