import { useState } from 'react';
import BodyForm from '../BodyForm';
import { Create, UserAvatar, Right, FakeTextarea } from './Styles';
import * as FirestoreService from '../../../../services/firestore';
import { useAuth } from "../../../auth"


const ProjectBoardIssueDetailsCommentsCreate = ({ issueId, fetchIssue }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');

  //const {currentUser} = useAuth();
  const {currentUser} = useAuth()

  const handleCommentCreate = async () => {
    try {
      setCreating(true);
      await FirestoreService.addComment(currentUser?.all?.currentOrg,body,issueId,currentUser); 
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
            value={body}
            onChange={setBody}
            isWorking={isCreating}
            onSubmit={handleCommentCreate}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <>
            <FakeTextarea onClick={() => setFormOpen(true)}>Add a comment...</FakeTextarea>
          </>
        )}
      </Right>
    </Create>
  );
};

export default ProjectBoardIssueDetailsCommentsCreate;
