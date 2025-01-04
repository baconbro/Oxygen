import { Actions, FormButton } from './Styles';
import { Form } from '../../../../components/common';
import { FormElement, FormHeading } from '../../../Workspace/WorkspaceSettings/Styles';
import { useFormikContext } from 'formik';
import { customStatus } from '../../../../constants/custom';
import { Status } from '../../../IssueDetails/Status/Styles';

const UpdatesBodyForm = ({
  newStatus,
  isWorking,
  onSubmit,
  onCancel,
}) => {

  const FormikDatePickerField = ({ name, label }) => {
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

  const generateRandomId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  };

  return (
    <>
      <Form
        enableReinitialize
        initialValues={{
          body: '',
          newStatus: newStatus,
          newScore: '',
          date: new Date().toISOString(),
          id: generateRandomId(),
        }}
        validations={{
          date: Form.is.required(),
          body: [Form.is.maxLength(200)],
          newScore: [Form.is.required()],
          newStatus: [Form.is.required()],
        }}
        onSubmit={async (values, form) => {
          try {
            console.log('values', values);
            values.date = new Date(values.date).getTime();
            onSubmit(values);
          } catch (error) {
            console.log('error.message', error.message);
          }
        }}
      >
        <FormElement>
          <FormHeading>Update</FormHeading>
          <div className="row g-9 mb-8">
            <div className="col-md-6 fv-row fv-plugins-icon-container">
              <label className="required fs-6 fw-semibold mb-2">New value</label>
              <Form.Field.Input
                name="newScore"
                tip="Score will be automaticaly calculate on the basis of update value"
                className="form-control form-control-solid"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div className="col-md-6 fv-row">
              <label className="required fs-6 fw-semibold mb-2">New Status</label>
              <Form.Field.Select
                name="newStatus"
                variant="empty"
                dropdownWidth={343}
                with00ClearValue={false}
                options={Object.values(customStatus.IssueStatus).map(newStatus => ({
                  value: newStatus,
                  label: customStatus.IssueStatusCopy[newStatus],
                }))}
                renderValue={({ value: newStatus }) => (
                  <Status isValue color={newStatus} className={`btn btn-${customStatus.IssueStatusClass[newStatus]}`}>
                    <div>{customStatus.IssueStatusCopy[newStatus]}</div>
                    <i className='bi bi-chevron-down'></i>
                  </Status>
                )}
                renderOption={({ value: Status }) => (
                  <Status className={`btn btn-${customStatus.IssueStatusClass[Status]}`} color={Status}>{customStatus.IssueStatusCopy[Status]}</Status>
                )}
              />
            </div>
          </div>
          <Form.Field.Input
            name="body"
            label="Comment"
            tip="Add a comment to explain the update"
            className="form-control"
          />
          <FormikDatePickerField name="date" label="Date" />
          <Actions>
            <FormButton variant="primary" isWorking={isWorking} type="submit" className="btn">
              Save
            </FormButton>
            <FormButton variant="empty" onClick={onCancel} className="btn">
              Cancel
            </FormButton>
          </Actions>
        </FormElement>
      </Form>
    </>
  );
};

export default UpdatesBodyForm;