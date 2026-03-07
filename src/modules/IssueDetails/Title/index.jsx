import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { KeyCodes } from '../../../constants/keyCodes';
import { is, generateErrors } from '../../../utils/validation';

import { TitleTextarea, ErrorText } from './Styles';

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
      <TitleTextarea style={InStyle}
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
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

ProjectBoardIssueDetailsTitle.propTypes = propTypes;

export default ProjectBoardIssueDetailsTitle;
