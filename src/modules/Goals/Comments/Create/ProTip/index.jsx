import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { KeyCodes } from '../../../../../../../constants/keyCodes';
import { isFocusedElementEditable } from '../../../../../../../utils/browser';



const propTypes = {
  setFormOpen: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsCommentsCreateProTip = ({ setFormOpen }) => {
  useEffect(() => {
    const handleKeyDown = event => {
      if (!isFocusedElementEditable() && event.keyCode === KeyCodes.M) {
        event.preventDefault();
        setFormOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setFormOpen]);

  return (
    <div className="flex items-center pt-[8px] text-gray-500 text-[13px] [&>strong]:pr-[4px]">
      <strong>Pro tip:</strong>press<span className="relative top-[1px] inline-block mx-[4px] px-[4px] rounded-[2px] text-gray-800 bg-gray-200 font-bold text-[12px]">M</span>to comment
    </div>
  );
};

ProjectBoardIssueDetailsCommentsCreateProTip.propTypes = propTypes;

export default ProjectBoardIssueDetailsCommentsCreateProTip;
