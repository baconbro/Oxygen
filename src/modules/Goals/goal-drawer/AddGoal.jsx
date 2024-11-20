import { useState, useRef } from 'react';
import { Textarea } from '../../../components/common';
import { KeyCodes } from '../../../constants/keyCodes';
import { useAuth } from '../../auth';
import { useAddOKR } from '../../../services/okrServices';



const AddGoal = ({reloadGoals}) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [isCreating, setCreating] = useState(false);
    const [body, setBody] = useState('');
    const $textareaRef = useRef();

    const { currentUser } = useAuth();
 
  const addOKRMutation = useAddOKR();
  const [newOKR, setNewOKR] = useState({ objective: '', keyResults: [] });
  

    const handleAddOKR = () => {
        addOKRMutation({
          okr: {
            title: body,
            description: "",
            score:0,
            status:"ontrack",
          },
          orgId: currentUser.all.currentOrg
        });
        setNewOKR({ objective: '', keyResults: [] });
        setFormOpen(false)
      };

    return (
        <>
        {isFormOpen ? (
            <div className='d-flex me-2 mb-2 ms-2'>
                <Textarea
                    autoFocus
                    placeholder="Add a goal"
                    value={body}
                    onChange={setBody}
                    ref={$textareaRef}
                    onKeyDown={event => {
                        if (event.keyCode === KeyCodes.ENTER) {
                            event.target.blur();
                            handleAddOKR()
                        }
                    }}
                    minRows={1}
                    className="form-control me-3 flex-grow-1 my-1 "
                />
                <>

                    <button  isWorking={isCreating} onClick={handleAddOKR} className="btn btn-primary fw-bold flex-shrink-0">
                        Save
                    </button>
                    <button  onClick={() => setFormOpen(false)}  className="btn">
                        Cancel
                    </button>

                </>
            </div>
            
            ) : (
                <>
                    <button className='btn btn-primary me-2 mb-2 ms-2' onClick={() => setFormOpen(true)}><i className='bi bi-plus'></i> Add goal</button>
                </>
            )}
        </>
    );
};


export default AddGoal;
