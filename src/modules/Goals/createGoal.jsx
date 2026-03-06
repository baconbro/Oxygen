import { Form } from '../../components/common';
import { FormElement, FormHeading } from '../Workspace/WorkspaceSettings/Styles';
import { useAuth } from '../auth';
import { useAddOKR } from '../../services/okrServices';
import { useWorkspace } from '../../contexts/WorkspaceProvider';

const CreateGoal = ({ modalClose, parent }) => {
    const addOKRMutation = useAddOKR();
    const { currentUser } = useAuth();
    const { goals, setGoals } = useWorkspace();

    const isKeyResult = !!parent;

    return (
        <Form
            enableReinitialize
            initialValues={{
                title: '',
                description: '',
            }}
            validations={{
                title: [Form.is.required(), Form.is.maxLength(200)],
                description: [Form.is.maxLength(500)],
            }}
            onSubmit={async (values, form) => {
                try {
                    const clientId = Math.floor(Math.random() * 1000000000000) + 1;
                    const now = Math.floor(Date.now());

                    const newOkr = {
                        id: clientId,
                        title: values.title,
                        description: values.description || '',
                        score: 0,
                        status: 'pending',
                        reporterId: currentUser.all.uid,
                        createdAt: now,
                        updatedAt: now,
                        ...(parent ? { parent, type: 'kr' } : { type: 'objective' }),
                    };

                    // Optimistic update
                    setGoals([...(goals || []), newOkr]);

                    addOKRMutation(
                        {
                            okr: newOkr,
                            orgId: currentUser.all.currentOrg,
                        },
                        {
                            onError: () => {
                                setGoals((prev) => (prev || []).filter(g => g.id !== clientId));
                            },
                        }
                    );

                    modalClose();
                } catch (error) {
                    console.error('Error creating goal:', error);
                }
            }}
        >
            <FormElement>
                <FormHeading>{isKeyResult ? 'New Key Result' : 'New Goal'}</FormHeading>
                <Form.Field.Input
                    name="title"
                    label="Title"
                    className="form-control mb-3"
                />
                <Form.Field.Textarea
                    name="description"
                    label="Description (optional)"
                    className="form-control mb-3"
                    rows={3}
                />
                <div className="text-center pt-8">
                    <button type="button" onClick={modalClose} className="btn btn-light me-3">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isKeyResult ? 'Create Key Result' : 'Create Goal'}
                    </button>
                </div>
            </FormElement>
        </Form>
    );
};

export default CreateGoal;
