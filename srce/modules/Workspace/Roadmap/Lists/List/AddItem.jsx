import React, { useState, useRef } from 'react';
import { Textarea } from '../../../components/common';
import { Actions, FormButton } from './Styles';
import * as FirestoreService from '../../../../App/services/firestore';
import toast from '../shared/utils/toast';
import { KeyCodes } from 'shared/constants/keyCodes';



const AddItem = ({ status, currentUserId, spaceId, lastIssue }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [isCreating, setCreating] = useState(false);
    const [body, setBody] = useState('');
    const $textareaRef = useRef();


    const handleSubmit = async () => {
        if ($textareaRef.current.value.trim()) {
            await FirestoreService.addItem({
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
            }, 'userId')
                .then(() => {
                    setFormOpen(false)
                    setBody('')
                }).catch((error) => {
                    toast.error(error.message)
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
                        
                        <FormButton variant="primary" isWorking={isCreating} onClick={handleSubmit}>
                            Save
                        </FormButton>
                        <FormButton variant="empty" onClick={() => setFormOpen(false)}>
                            Cancel
                        </FormButton>
                        
                    </Actions>
                    </div>
            ) : (
                <>
                    <button className='btn btn-light btn-outline btn-outline-dashed btn-outline-default me-2 mb-2 ms-2' onClick={() => setFormOpen(true)}><i className='bi bi-plus'></i></button>
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
