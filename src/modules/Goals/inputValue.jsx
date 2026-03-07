import { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, TextEditedContent, Button } from '../../components/common';


const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
};

const InputValue = ({ issue, updateIssue, fieldName }) => {
  const [fieldNameValue, setFieldNameValue] = useState(issue[fieldName]);
  const [isEditing, setEditing] = useState(false);

  const handleUpdate = () => {
    setEditing(false);
    updateIssue({ [fieldName]: fieldNameValue });
  };

  const isValueEmpty = !fieldNameValue && fieldNameValue !== 0;

  return (
    <>
      {isEditing ? (
        <>
          <Input
            placeholder="Enter value"
            defaultValue={fieldNameValue}
            onChange={setFieldNameValue}
            className="fs-2 fw-bold counted"
          />
          <div className="flex pt-3 [&>button]:mr-1.5">
            <Button variant="primary" onClick={handleUpdate} className="btn">
              Save
            </Button>
            <Button variant="empty" onClick={() => setEditing(false)} className="btn text-gray-600 hover:bg-gray-200">
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          {isValueEmpty ? (
            <div
              className="ml-[-7px] p-[7px] rounded-[3px] text-gray-500 transition-colors duration-100 text-[15px] cursor-pointer hover:bg-gray-100"
              onClick={() => setEditing(true)}
            >
              Add a value
            </div>
          ) : (
            <TextEditedContent
              content={String(fieldNameValue)}
              onClick={() => setEditing(true)}
              className="fs-2 fw-bold"
            />
          )}
        </>
      )}
    </>
  );
};

InputValue.propTypes = propTypes;

export default InputValue;
