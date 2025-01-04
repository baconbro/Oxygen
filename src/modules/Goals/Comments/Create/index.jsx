import { Fragment, useState } from 'react';


import BodyForm from '../BodyForm';

import { Create, UserAvatar, Right, FakeTextarea } from './Styles';

import * as FirestoreService from '../../../../services/firestore';
import { useAuth } from "../../../auth"


const CommentsCreate = ({ issue, updateIssue, object }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');

  //const {currentUser} = useAuth();
  const { currentUser } = useAuth()

  const handleCommentCreate = async () => {
    try {
      setCreating(true);
      const comment = {
        body: body,
        issueId: issue.id,
        id: Math.floor(Math.random() * 1000000000000) + 1, // unique Id for the comment
        createdAt: Math.floor(Date.now()),
        user: currentUser.email
      };

      // Update the issue with the new comment
      const updatedComments = issue[object] ? [...issue[object], comment] : [comment];
      updateIssue({ [object]: updatedComments });
      //await FirestoreService.addComment(currentUser?.all?.currentOrg,body,issueId,currentUser); 
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {

    }
  };

  return (
    <Create>
      {currentUser && <UserAvatar name={currentUser.first_name} avatarUrl={currentUser.photoURL} />}
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
          <Fragment>
            <FakeTextarea onClick={() => setFormOpen(true)}>Add a comment...</FakeTextarea>
          </Fragment>
        )}
      </Right>
    </Create>
  );
};

export default CommentsCreate;
