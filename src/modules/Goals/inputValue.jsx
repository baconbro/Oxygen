import { useState } from 'react';
import PropTypes from 'prop-types';


import { Input, TextEditedContent, Button } from '../../components/common';

import { EmptyLabel, Actions } from '../IssueDetails/Description/Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const InputValue = ({ issue, updateIssue, fieldName }) => {
  const [fieldNameValue, setFieldNameValue] = useState(issue[fieldName]);
  const [isEditing, setEditing] = useState(false);

  const handleUpdate = () => {
    setEditing(false);
    updateIssue({ [fieldName]: fieldNameValue });
  };

  const isValueEmpty = (fieldNameValue || '').trim().length === 0;

  return (
    <>
      <h3 className="fw-bold mb-1"></h3>
      {isEditing ? (
        <>
          <Input
            placeholder=""
            defaultValue={fieldNameValue}
            onChange={setFieldNameValue}
            classeName="fs-2 fw-bold counted"
          />
          <Actions>
            <Button variant="primary" onClick={handleUpdate} className="btn">
              Save
            </Button>
            <Button variant="empty" onClick={() => setEditing(false)} className="btn">
              Cancel
            </Button>
          </Actions>
        </>
      ) : (
        <>
          {isValueEmpty ? (
            <EmptyLabel onClick={() => setEditing(true)}>Add a value </EmptyLabel>
          ) : (
            <TextEditedContent content={fieldNameValue} onClick={() => setEditing(true)} className="fs-2 fw-bold" />
          )}
        </>
      )}
    </>
  );
};

InputValue.propTypes = propTypes;

export default InputValue;
