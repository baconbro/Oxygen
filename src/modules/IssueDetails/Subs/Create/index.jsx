import { useState } from 'react';
import BodyForm from '../BodyForm';
import { Create, FakeTextarea } from './Styles';
import { useAuth } from "../../../auth";
import { SearchReturn } from '../../../../components/partials/layout/search/SearchReturn';
import { useUpdateItem, useAddItem } from '../../../../services/itemServices';  


const ProjectBoardIssueDetailsCommentsCreate = ({ issueId, issue, fetchIssue }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');
  const {currentUser} = useAuth();
  const editItemMutation = useUpdateItem();
  const addItemMutation = useAddItem();

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

  const searchAction = async (childIssue) => {
    //save parent issue in the child issue
    try{
    setCreating(true);
    const mutation = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: { parent: issue.id },
      itemId: childIssue.id,
      workspaceId: issue.projectId,
    });
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {
      
    }
      }

  const handleCommentCreate = async () => {
    try {
      setCreating(true);
      addItemMutation({
        orgId: currentUser?.all?.currentOrg,
        item: {
          description: '',
          status: '1', //first one in wokflow
          projectId: issue.projectId,
          listPosition: 50, //need to be dynamic
          type: 'type1',
          title: body,
          reporterId: 0,
          userIds: [],
          priority: '',
          users: [],
          parent: issue.id,
        },
        userId: 'userId'
      });
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {
      
    }
  };

  return (
    <Create>
      <div className="d-flex align-items-center mb-8">
        <div className="form-check form-check-custom form-check-solid mx-5">
          <input className="form-check-input" type="checkbox" value="" disabled />
        </div>
        <div className="flex-grow-1">

          {isFormOpen ? (
            <>
            <BodyForm
              value={body}
              onChange={setBody}
              isWorking={isCreating}
              onSubmit={handleCommentCreate}
              onCancel={() => setFormOpen(false)}
            /> Or add existing work item
            <SearchReturn orgId={currentUser?.all?.currentOrg} scope={'project'} onAction={searchAction}/>
            </>
          ) : (
            <>
              <FakeTextarea onClick={() => setFormOpen(true)}>Add a sub item...</FakeTextarea>
            </>
          )}

        </div>


      </div>



    </Create>
  );
};

export default ProjectBoardIssueDetailsCommentsCreate;
