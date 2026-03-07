import { useRef } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../../../components/common';

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
  const $textareaRef = useRef();

  const handleSubmit = () => {
    if ($textareaRef.current.value.trim()) {
      onSubmit();
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        placeholder="Add a new..."
        value={value}
        onChange={onChange}
        ref={$textareaRef}
      />
      <div className="flex pt-[10px]">
        <Button variant="primary" isWorking={isWorking} onClick={handleSubmit} className="btn mr-[6px]">
          Save
        </Button>
        <Button variant="empty" onClick={onCancel} className="btn mr-[6px]">
          Cancel
        </Button>
      </div>
    </>
  );
};

ProjectBoardIssueDetailsCommentsBodyForm.propTypes = propTypes;

export default ProjectBoardIssueDetailsCommentsBodyForm;
