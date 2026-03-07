import { Form, Button } from '../../../../components/common';
import { customStatus } from '../../../../constants/custom';

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
        newScore: [Form.is.required()],
        newStatus: [Form.is.required()],
      }}
      onSubmit={async (values, form) => {
        try {
          values.date = new Date(values.date).getTime();
          onSubmit(values);
        } catch (error) {
          // Error handled silently
        }
      }}
    >
      <div className="mt-4">
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-graph-up-arrow fs-4 text-primary me-2"></i>
          <h5 className="fw-bold text-gray-800 m-0">New Check-in</h5>
        </div>
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <label className="required fs-7 fw-semibold mb-2 text-gray-700">New Value</label>
            <Form.Field.Input
              name="newScore"
              tip="The current measured value for this key result"
              className="form-control form-control-solid"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter current value"
            />
          </div>
          <div className="col-md-6">
            <label className="required fs-7 fw-semibold mb-2 text-gray-700">Status</label>
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
                <div className={`btn btn-${customStatus.IssueStatusClass[newStatus]}`}>
                  <div>{customStatus.IssueStatusCopy[newStatus]}</div>
                  <i className='bi bi-chevron-down'></i>
                </div>
              )}
              renderOption={({ value: statusVal }) => (
                <div className={`btn btn-${customStatus.IssueStatusClass[statusVal]}`}>{customStatus.IssueStatusCopy[statusVal]}</div>
              )}
            />
          </div>
        </div>
        <div className="mb-4">
          <Form.Field.Input
            name="body"
            label="What changed? (optional)"
            tip="Brief context about this update"
            className="form-control form-control-solid"
            placeholder="e.g., Closed 3 new deals this week..."
          />
        </div>
        <div className="mb-4">
          <FormikDatePickerField name="date" label="Date" />
        </div>
        <div className="flex pt-[10px]">
          <Button variant="primary" isWorking={isWorking} type="submit" className="btn btn-primary btn-sm mr-[6px]">
            <i className="bi bi-check2 me-1"></i> Save Check-in
          </Button>
          <Button variant="empty" onClick={onCancel} className="btn btn-light btn-sm mr-[6px]">
            Cancel
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default UpdatesBodyForm;
