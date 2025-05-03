import { Form } from '../../components/common';
import { FormElement, FormHeading } from '../Workspace/WorkspaceSettings/Styles';
import { useAuth } from '../auth';
import { useAddOKR } from '../../services/okrServices';

const CreateGoal = ({ modalClose, parent }) => {
    const addOKRMutation = useAddOKR();
    const { currentUser } = useAuth();

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

                        addOKRMutation({
                            okr: {
                                title: values.title,
                                description: "",
                                score: 0,
                                status: "ontrack",
                                reporterId: currentUser.all.uid,
                                ...(parent && {
                                    parent: parent,
                                    type: 'kr'
                                }), // Conditionally add parent
                            },
                            orgId: currentUser.all.currentOrg
                        });

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