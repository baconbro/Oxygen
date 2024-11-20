import React from 'react';
import PropTypes from 'prop-types';


import toast from '../../../../utils/toast';
import { Form, IssueTypeIcon, Icon, Avatar, IssuePriorityIcon } from '../../../../components/common';

import {
  FormHeading,
  FormElement,
  SelectItem,
  SelectItemLabel,
  Divider,
  Actions,
  ActionButton,
} from './Styles';

//firebase
import * as FirestoreService from '../../App/services/firestore';
import { useAuth } from "../../../../contexts/AuthContext"

const propTypes = {
 
};

const CreateOrg = ({ project, onCreate, modalClose }) => {
  //const [{ isCreating }, createIssue] = useApi.post('/issues');

  const { currentUser } = useAuth()

  return (
    <Form
      enableReinitialize
      initialValues={{
        title: '',
      }}
      validations={{
        title: [Form.is.required(), Form.is.maxLength(200)],
      }}
      onSubmit={async (values, form) => {
        try {
          await FirestoreService.createOrg(values,currentUser);
          toast.success('Issue has been successfully created.');
          modalClose();
        } catch (error) {
          console.log(error)
        }
      }}
    >
      <FormElement>
        <FormHeading>Create organisation</FormHeading>

        <Form.Field.Input
          name="title"
          label="Organisation name"
          tip="This is the public name for your organisation"
        />
        <Actions>
          <ActionButton type="submit" variant="primary" >
            Create Organisation
          </ActionButton>
          <ActionButton type="button" variant="empty" onClick={modalClose}>
            Cancel
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );

};

CreateOrg.propTypes = propTypes;

export default CreateOrg;
