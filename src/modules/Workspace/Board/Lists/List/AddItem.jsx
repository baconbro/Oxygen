import { useState, useRef } from 'react';
import { Textarea } from '../../../../../components/common';
import { Actions, FormButton } from './Styles';
import toast from '../../../../../utils/toast';
import { KeyCodes } from '../../../../../constants/keyCodes';
import { useAuth } from '../../../../auth';
import { useAddItem } from '../../../../../services/itemServices';
import { useWorkspace } from '../../../../../contexts/WorkspaceProvider';



const AddItem = ({ status, currentUserId, spaceId, lastIssue }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [isCreating, setCreating] = useState(false);
    const [body, setBody] = useState('');
    const $textareaRef = useRef();

    const { currentUser } = useAuth();
    const {project, setProject} = useWorkspace()
    const addItemMutation = useAddItem();

    const handleSubmit = () => {
        if ($textareaRef.current.value.trim()) {
            const newItem = {
                description: '',
                status: status,
                projectId: spaceId,
                listPosition: lastIssue,
                type: 'task',
                title: body,
                reporterId: currentUserId,
                userIds: [],
                priority: '',
                users: [],
              }

          addItemMutation({
            orgId: currentUser?.all?.currentOrg,
            item: newItem,
            userId: 'userId'
          }, {
            onSuccess: () => {
              setFormOpen(false);
              
                            // Add the new item to project.issues and update the project context
                            const updatedProject = { ...project, issues: [...project.issues, newItem] };
                            setProject(updatedProject);
                            setBody('');
            },
            onError: (error) => {
              toast.error(error.message);
            },
          });
        }
      }


    return (
        <>
            {isFormOpen ? (
                <div className='me-2 mb-2 ms-2'>
                    <Textarea
                        autoFocus
                        placeholder="Add a title..."
                        value={body}
                        onChange={setBody}
                        ref={$textareaRef}
                        onKeyDown={event => {
                            if (event.keyCode === KeyCodes.ENTER) {
                                event.target.blur();
                                handleSubmit()
                            }
                        }}
                    />
                    <Actions>

                        <FormButton variant="primary" isWorking={isCreating} onClick={handleSubmit} className="btn">
                            Save
                        </FormButton>
                        <FormButton variant="empty" onClick={() => setFormOpen(false)} className="btn">
                            Cancel
                        </FormButton>

                    </Actions>
                </div>
            ) : (
                <>
                    <button className='btn btn-primary me-2 mb-2 ms-2' onClick={() => setFormOpen(true)}><i className='bi bi-plus'></i>Add item</button>
                </>
            )}
        </>
    );
};

const calculateListPosition = async ({ issues }) => {


    const listPositions = issues.map(({ listPosition }) => listPosition);

    if (listPositions.length > 0) {
        return Math.min(...listPositions) - 1;
    }
    return 1;
};

export default AddItem;
