import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { KeyCodes } from '../../../constants/keyCodes';
import { is, generateErrors } from '../../../utils/validation';

import { Textarea } from '../../../components/common';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsTitle = ({ issue, updateIssue, InStyle }) => {
  const $titleInputRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    if ($titleInputRef.current) {
      $titleInputRef.current.value = issue.title;
    }
  }, [issue]);

  const handleTitleChange = () => {
    setError(null);

    const title = $titleInputRef.current.value;
    if (title === issue.title) return;

    const errors = generateErrors({ title }, { title: [is.required(), is.maxLength(200)] });

    if (errors.title) {
      setError(errors.title);
    } else {
      updateIssue({ title });
    }
  };

  return (
    <>
      <Textarea style={InStyle}
        className="ml-[-8px] h-[44px] w-full p-[7px_7px_8px] leading-[1.28] border-none resize-none bg-white shadow-none transition-colors text-[24px] font-medium hover:not(:focus):bg-gray-100 outline-none"
        minRows={1}
        placeholder="Short summary"
        defaultValue={issue.title}
        ref={$titleInputRef}
        onBlur={handleTitleChange}
        onKeyDown={event => {
          if (event.keyCode === KeyCodes.ENTER) {
            event.target.blur();
          }
        }}
      />
      {error && <div className="pt-1 text-red-500 text-[13px] font-medium">{error}</div>}
    </>
  );
};

ProjectBoardIssueDetailsTitle.propTypes = propTypes;

export default ProjectBoardIssueDetailsTitle;
