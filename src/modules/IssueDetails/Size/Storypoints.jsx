import { InputDebounced } from '../../../components/common';
import { isNil } from 'lodash';

const StoryPointInput = ({ issue, updateIssue }) => {
  return (
    <div className="mt-5">
      <div className="mb-3">
        <label className="form-label">
          Storypoints
          {renderNumberInput('storypoint', issue, updateIssue)}
        </label>
      </div>
    </div>
  );
};

const renderNumberInput = (fieldName, issue, updateIssue) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
  <InputDebounced
    placeholder="1, 2, 3, 5, 8, 13, 21, 34,..."
    filter={/^\d{0,4}$/} //allow up to 4 digits
    value={isNil(issue[fieldName]) ? '' : issue[fieldName]}
    onChange={stringValue => {
      const value = stringValue.trim() ? Number(stringValue) : null;
      updateIssue({ [fieldName]: value });
    }}
    className="form-control form-control-solid "
  />
  </div>
);


export default StoryPointInput;
