import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { KeyCodes } from '../../../../../constants/keyCodes';
import { is, generateErrors } from '../../../../../utils/validation';

import { TitleTextarea, ErrorText } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsTitle = ({ issue, updateIssue }) => {
  const $titleInputRef = useRef();
  const [error, setError] = useState(null);

  const handleTitleChange = () => {
    setError(null);

    const name = $titleInputRef.current.value;
    if (name === issue.title) return;

    const errors = generateErrors({ name }, { name: [is.required(), is.maxLength(200)] });

    if (errors.name) {
      setError(errors.name);
    } else {
      updateIssue({ name });
    }
  };

  return (
    <Fragment>
      <TitleTextarea
        minRows={1}
        placeholder="Organisation name"
        defaultValue={issue.name}
        ref={$titleInputRef}
        onBlur={handleTitleChange}
        onKeyDown={event => {
          if (event.keyCode === KeyCodes.ENTER) {
            event.target.blur();
          }
        }}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Fragment>
  );
};

ProjectBoardIssueDetailsTitle.propTypes = propTypes;

export default ProjectBoardIssueDetailsTitle;
