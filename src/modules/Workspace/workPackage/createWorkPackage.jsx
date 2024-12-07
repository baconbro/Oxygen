import { Form } from '../../../components/common';
import { FormElement, FormHeading } from '../WorkspaceSettings/Styles';
import { useFormikContext } from 'formik';
import { useAddWorkPackage, useUpdateWorkPackage, useDeleteWorkPackage } from '../../../services/workPackageServices';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useAuth } from '../../auth';

const CreateWorkPackage = ({ modalClose, wpgData }) => {
    const addWPMutation = useAddWorkPackage();
    const updateWPMutation = useUpdateWorkPackage();
    const deleteWP = useDeleteWorkPackage();
    const { project } = useWorkspace();
    const { currentUser } = useAuth();

    const handleDelete = async () => {
        try {
            deleteWP({
                wpgId: wpgData.id,
                orgId: currentUser?.all?.currentOrg
            });
            modalClose();
        } catch (error) {
            console.log('error.message', error.message);
        }
    }

    const generateRandomId = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    };


    const FormikDatePickerField = ({ name, label, disabled }) => {
        const { setFieldValue, values } = useFormikContext();
        return (
            <Form.Field.DatePicker
                name={name}
                label={label}
                selected={values[name]}
                onChange={date => setFieldValue(name, date)}
            />
        );
    };

    const renderType = (option) => (
        <>
            {option.label}
        </>
    );

    return (
        <>
            <Form
                enableReinitialize
                initialValues={{
                    title: wpgData?.title || '',
                    desc: wpgData?.desc || '',
                    status: wpgData?.status || '',
                    startDate: wpgData?.startDate || new Date().toISOString(),
                    endDate: wpgData?.endDate || new Date().toISOString(),
                    id: wpgData?.id || generateRandomId(),
                    wpId: project.spaceId
                }}
                validations={{
                    startDate: Form.is.required(),
                    title: [Form.is.required(), Form.is.maxLength(200)],
                }}
                onSubmit={async (values, form) => {
                    try {
                        if (wpgData) {
                            // Update existing sprint
                            updateWPMutation({
                                values: values,
                                wpgId: wpgData.id,
                                wpId: project.spaceId,
                                orgId: currentUser?.all?.currentOrg,
                            });
                        } else {
                            // Create new sprint
                            addWPMutation({
                                item: values,
                                spaceId: project.spaceId,
                                orgId: currentUser?.all?.currentOrg,

                            });
                        }
                        modalClose();
                    } catch (error) {
                        console.log('error.message', error.message);
                    }
                }}
            >
                <FormElement>
                    <FormHeading>{wpgData ? 'Edit ' : 'Create'}</FormHeading>
                    <Form.Field.Input
                        name="title"
                        label="Work package name"
                        className="form-control"
                    />
                    <Form.Field.Input
                        name="desc"
                        label="Description"
                        tip="What is this work package about?"
                        className="form-control form-control-solid"
                    />
                    <Form.Field.Select
                        name="status"
                        label="Select package status"
                        options={[
                            { value: 'Notstarted', label: 'Not started' },
                            { value: 'Inprogress', label: 'In progress' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'Released', label: 'Released' },

                        ]}
                        renderOption={renderType}
                        renderLabel={renderType}
                    />


                    <FormikDatePickerField name="startDate" label="Start date" />
                    <FormikDatePickerField
                        name="endDate"
                        label="End date"

                    />
                    <div className='text-center pt-15' >
                        <button type="button" variant="empty" onClick={modalClose} className='btn btn-light me-3'>
                            Cancel
                        </button>
                        <button type="submit" variant="primary" className='btn btn-primary me-3'>{wpgData ? 'Update ' : 'Create '}</button>

                        {wpgData && (
                            <button onClick={handleDelete} className="btn btn-danger">
                                Delete package
                            </button>
                        )}
                    </div>
                </FormElement>
            </Form>
        </>
    );
};

export default CreateWorkPackage;