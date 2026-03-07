import { useState } from 'react';
import PropTypes from 'prop-types';

import { getTextContentsFromHtmlString } from '../../../utils/browser';
import { TextEditor, TextEditedContent, Button } from '../../../components/common';



const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsDescription = ({ issue, updateIssue }) => {
  const [description, setDescription] = useState(issue.description);
  const [isEditing, setEditing] = useState(false);

  const handleUpdate = () => {
    setEditing(false);
    updateIssue({ description });
  };

  const isDescriptionEmpty = getTextContentsFromHtmlString(description).trim().length === 0;

  return (
    <>
      {isEditing ? (
        <>
          <TextEditor
            placeholder="Describe the issue"
            defaultValue={description}
            onChange={setDescription}
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
          {isDescriptionEmpty ? (
            <div
              className="ml-[-7px] p-[7px] rounded-[3px] text-gray-500 transition-colors duration-100 text-[15px] cursor-pointer hover:bg-gray-100"
              onClick={() => setEditing(true)}
            >
              Add a description...
            </div>
          ) : (
            <TextEditedContent content={description} onClick={() => setEditing(true)} />
          )}
        </>
      )}
    </>
  );
};

ProjectBoardIssueDetailsDescription.propTypes = propTypes;

export default ProjectBoardIssueDetailsDescription;
