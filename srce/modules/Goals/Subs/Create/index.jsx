import React, { Fragment, useState } from 'react';

import BodyForm from '../BodyForm';
import { Create, UserAvatar, Right, FakeTextarea } from './Styles';

import { useAuth } from "../../../auth";



const ProjectBoardIssueDetailsCommentsCreate = ({ issueId, issue, addItem }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');
  const {currentUser} = useAuth();

  const hierarchie = {
    task: 'task',
    bug: 'task',
    story: 'task',
    epic: 'task',
    strategy: 'theme',
    theme: 'initiative',
    initiative: 'capability',
    capability: 'epic',
  }

  const handleCommentCreate = async () => {
    try {
      addItem(body);
      setCreating(true);
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {
      
    }
  };

  return (
    <Create>
      <div className="d-flex align-items-center mb-8">
        <div className="flex-grow-1">

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
              <FakeTextarea onClick={() => setFormOpen(true)}>+ Add a Key Result</FakeTextarea>
            </Fragment>
          )}

        </div>


      </div>



    </Create>
  );
};

export default ProjectBoardIssueDetailsCommentsCreate;
