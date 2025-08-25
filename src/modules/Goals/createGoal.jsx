import { Form } from '../../components/common';
import { FormElement, FormHeading } from '../Workspace/WorkspaceSettings/Styles';
import { useAuth } from '../auth';
import { useAddOKR } from '../../services/okrServices';
import { useWorkspace } from '../../contexts/WorkspaceProvider';

const CreateGoal = ({ modalClose, parent }) => {
    const addOKRMutation = useAddOKR();
    const { currentUser } = useAuth();
    const { goals, setGoals } = useWorkspace();

    return (
        <>
            <Form
                enableReinitialize
                initialValues={{
                    title: '',
                }}
                validations={{
                    title: [Form.is.required(), Form.is.maxLength(200)],
                }}
                onSubmit={async (values, form) => {
                    try {
                        // Create a client id for optimistic insert; service will reuse it
                        const clientId = Math.floor(Math.random() * 1000000000000) + 1;
                        const now = Math.floor(Date.now());

                        const newOkr = {
                            id: clientId,
                            title: values.title,
                            description: "",
                            score: 0,
                            status: "pending",
                            reporterId: currentUser.all.uid,
                            createdAt: now,
                            updatedAt: now,
                            ...(parent ? { parent, type: 'kr' } : { type: 'objective' }),
                        };

                        // Optimistic update so KR shows immediately
                        setGoals([...(goals || []), newOkr]);

                        addOKRMutation(
                            {
                                okr: newOkr,
                                orgId: currentUser.all.currentOrg,
                            },
                            {
                                onError: () => {
                                    // Rollback optimistic insert
                                    setGoals((prev) => (prev || []).filter(g => g.id !== clientId));
                                },
                            }
                        );

                        modalClose();
                    } catch (error) {
                        console.log('error.message', error.message);
                    }
                }}
            >
                <FormElement>
                    <FormHeading>Create</FormHeading>
                    <Form.Field.Input
                        name="title"
                        label="Title"
                        className="form-control"
                    />
                    <div className='text-center pt-15' >
                        <button type="button" variant="empty" onClick={modalClose} className='btn btn-light me-3'>
                            Cancel
                        </button>
                        <button type="submit" variant="primary" className='btn btn-primary me-3'>Create</button>

                    </div>
                </FormElement>
            </Form>
        </>
    );
};

export default CreateGoal;