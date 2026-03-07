import { useState } from 'react';


import BodyForm from '../BodyForm';

import { Avatar } from '../../../../components/common';

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
        user: currentUser.all.email
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
    <div className="relative mt-[25px] text-[15px]">
      {currentUser && <Avatar className="absolute top-0 left-0" name={currentUser.all.fName} avatarUrl={currentUser.all.photoURL} />}
      <div className="pl-[64px]">
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
            <div className="p-[12px_16px] rounded-[4px] border border-gray-200 text-gray-400 cursor-pointer hover:border-gray-300" onClick={() => setFormOpen(true)}>Add a new...</div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentsCreate;
