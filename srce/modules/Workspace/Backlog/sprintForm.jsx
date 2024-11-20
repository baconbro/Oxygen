import { Form } from '../../../components/common';
import { FormElement, FormHeading } from '../WorkspaceSettings/Styles';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useAddSprint, useUpdateSprint, useDeleteSprint } from '../../../services/sprintServices';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useAuth } from '../../auth';




const CreateSprint = ({ modalClose, sprintData }) => {
    const addSprintMutation = useAddSprint();
    const updateSprintMutation = useUpdateSprint();
    const deleteSprint = useDeleteSprint();
    const { project } = useWorkspace();
    const { currentUser } = useAuth();


    const renderType = (option) => (
        <>
            {option.label}
        </>
    );

    const FormikDatePickerField = ({ name, label, disabled }) => {
        const { setFieldValue, values } = useFormikContext();

        useEffect(() => {
            if (name === 'startDate' && values.startDate && values.duration !== '5') {
                const durationInWeeks = parseInt(values.duration, 10);
                const endDate = new Date(values.startDate);
                endDate.setDate(endDate.getDate() + durationInWeeks * 7);
                setFieldValue('endDate', endDate.toISOString());
            }
        }, [values.startDate, values.duration, setFieldValue, name]);

        return (
            <Form.Field.DatePicker
                name={name}
                label={label}
                selected={values[name]}
                onChange={date => setFieldValue(name, date)}
                disabled={values.duration !== '5' && name === 'endDate'}
            />
        );
    };

    const generateRandomId = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    };
    const handleDelete = async () => {
        try {
            deleteSprint({
                sprintId: sprintData.id,
                spaceId: project.spaceId,
                orgId: currentUser?.all?.currentOrg
            });
            modalClose();
        } catch (error) {
            console.log('error.message', error.message);
        }

    }


    return (
        <>
            <Form
                enableReinitialize
                initialValues={{
                    name: sprintData?.name || '',
                    sprintGoal: sprintData?.sprintGoal || '',
                    duration: sprintData?.duration || '2',
                    startDate: sprintData?.startDate || new Date().toISOString(),
                    endDate: sprintData?.endDate || null,
                    id: sprintData?.id || generateRandomId(),
                }}
                validations={{
                    startDate: Form.is.required(),
                    name: [Form.is.required(), Form.is.maxLength(200)],
                }}
                onSubmit={async (values, form) => {
                    try {
                        if (sprintData) {
                            // Update existing sprint
                            updateSprintMutation({
                                values: values,
                                sprintId: sprintData.id,
                                spaceId: project.spaceId,
                                orgId: currentUser?.all?.currentOrg,
                            });
                        } else {
                            // Create new sprint
                            addSprintMutation({
                                values: values,
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
                    <FormHeading>{sprintData ? 'Edit Sprint' : 'Create a Sprint'}</FormHeading>
                    <Form.Field.Input
                        name="name"
                        label="Sprint name"
                        className="form-control"
                    />
                    <Form.Field.Input
                        name="sprintGoal"
                        label="Sprint goal"
                        tip="What do you want to achieve during the sprint?"
                        className="form-control form-control-solid"
                    />
                    <Form.Field.Select
                        name="duration"
                        label="Select sprint duration"
                        options={[
                            { value: '1', label: '1 week' },
                            { value: '2', label: '2 weeks' },
                            { value: '3', label: '3 weeks' },
                            { value: '4', label: '4 weeks' },
                            { value: '5', label: 'Custom' },
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
                        <button type="submit" variant="primary" className='btn btn-primary me-3'>{sprintData ? 'Update Sprint' : 'Create Sprint'}</button>

                        {sprintData && (
                            <button onClick={handleDelete} className="btn btn-danger">
                                Delete sprint
                            </button>
                        )}


                    </div>

                </FormElement>
            </Form>
        </>
    );

};

export default CreateSprint;
