import { Fragment, useState } from 'react';

import { getTextContentsFromHtmlString } from '../../../utils/browser';
import { TextEditor, TextEditedContent, Button } from '../../../components/common';
import { Title, EmptyLabel, Actions } from './Styles';



const DepDescription = ({ issue, updateIssue }) => {
  const [description, setDescription] = useState(issue.description);
  const [isEditing, setEditing] = useState(false);

  const handleUpdate = () => {
    setEditing(false);
    updateIssue({ description },{ id :issue.id});
  };

  const isDescriptionEmpty = getTextContentsFromHtmlString(description).trim().length === 0;

  return (
    <Fragment>
      <Title>Description</Title>
      {isEditing ? (
        <Fragment>
          <TextEditor
            placeholder="Describe the issue"
            defaultValue={description}
            onChange={setDescription}
          />
          <Actions>
            <Button variant="primary" onClick={handleUpdate} className="btn">
              Save
            </Button>
            <Button variant="empty" onClick={() => setEditing(false)} className="btn">
              Cancel
            </Button>
          </Actions>
        </Fragment>
      ) : (
        <Fragment>
          {isDescriptionEmpty ? (
            <EmptyLabel onClick={() => setEditing(true)}>Add a description...</EmptyLabel>
          ) : (
            <TextEditedContent content={description} onClick={() => setEditing(true)} />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};


export default DepDescription;
