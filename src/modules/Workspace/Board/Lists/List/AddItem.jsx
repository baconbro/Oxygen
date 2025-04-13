import { useState, useRef } from 'react';
import { Textarea } from '../../../../../components/common';
import { Actions, FormButton } from './Styles';
import toast from '../../../../../utils/toast';
import { KeyCodes } from '../../../../../constants/keyCodes';
import { useAuth } from '../../../../auth';
import { useAddItem, useGetItems } from '../../../../../services/itemServices';
import { useWorkspace } from '../../../../../contexts/WorkspaceProvider';
import { useQueryClient } from 'react-query';



const AddItem = ({ status, currentUserId, spaceId, lastIssue, isSprint, sprintId }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [isCreating, setCreating] = useState(false);
    const [body, setBody] = useState('');
    const $textareaRef = useRef();

    const { currentUser } = useAuth();
    const { project, updateProjectContext, workspaceConfig } = useWorkspace()
    const addItemMutation = useAddItem();
    const queryClient = useQueryClient();

    // Move useGetItems to the component level
    const { data: items } = useGetItems(project.spaceId, currentUser?.all?.currentOrg);
    
    // Determine the correct status
    const getItemStatus = () => {
        if (isSprint && workspaceConfig?.issueStatus && workspaceConfig.issueStatus.length > 1) {
            // Use the second status if in a sprint
            return workspaceConfig.issueStatus[1]?.id || status;
        }
        return status;
    };

    const handleSubmit = () => {
        if ($textareaRef.current.value.trim()) {
            const newItem = {
                description: '',
                status: getItemStatus(),
                projectId: spaceId,
                listPosition: lastIssue,
                type: 'task',
                title: body,
                reporterId: currentUser.all.uid,
                userIds: [],
                priority: '',
                users: [],
                // Add sprintId if it exists
                ...(sprintId && { sprintId: sprintId }),
            }

            addItemMutation({
                orgId: currentUser?.all?.currentOrg,
                item: newItem,
                userId: 'userId'
            }, {
                onSuccess: (newItemData) => {
                    setFormOpen(false);
                    setCreating(false);

                    // Invalidate the items query to trigger a refetch with the new item
                    queryClient.invalidateQueries(['Items', project.spaceId, currentUser?.all?.currentOrg]);

                    // Optionally, you can update the context manually with the new item
                    // Make sure newItemData contains the item with ID from the server
                    if (newItemData && items) {
                        const updatedItems = [...items, newItemData];
                        const updatedProject = { ...project, issues: updatedItems };
                        updateProjectContext(updatedProject);
                    }

                    setBody('');
                },
                onError: (error) => {
                    setCreating(false);
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
