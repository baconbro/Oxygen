import { useRef } from 'react';
import PropTypes from 'prop-types';

import { Textarea } from '../../../../components/common';

import { Actions, FormButton } from './Styles';

const propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isWorking: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsCommentsBodyForm = ({
  value,
  onChange,
  isWorking,
  onSubmit,
  onCancel,
}) => {
  const textareaRef = useRef();

  const handleSubmit = () => {
    if (textareaRef.current.value.trim()) {
      onSubmit();
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        placeholder="Add an item..."
        value={value}
        onChange={onChange}
        ref={textareaRef}
        minRows="1"
      />
      <Actions>
        <FormButton variant="primary" isWorking={isWorking} onClick={handleSubmit} className="btn">
          Save
        </FormButton>
        <FormButton variant="empty" onClick={onCancel} className="btn">
          Cancel
        </FormButton>
      </Actions>
    </>
  );
};

ProjectBoardIssueDetailsCommentsBodyForm.propTypes = propTypes;

export default ProjectBoardIssueDetailsCommentsBodyForm;
