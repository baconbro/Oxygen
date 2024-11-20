import toast from '../../../../utils/toast';
import { Form } from '../../../../components/common';
import {
  FormHeading,
  FormElement,
  SelectItem,
  SelectItemLabel,
  Divider,
  Actions,
  ActionButton,
} from './Styles';
import * as FirestoreService from '../../App/services/firestore';
import { useAuth } from "../../../../contexts/AuthContext"
import history from '../../../../utils/browserHistory';

const CreateSpace = ({ modalClose, orgs }) => {
  const { currentUser } = useAuth()

  const listOrg = () => {
    if (orgs) {
      return orgs.map((org, index) => ({
        value: Object.keys(org).toString(),
        label: org[Object.keys(org)].name,
      }))
    }
  }

  const typeOptions = listOrg()

  const renderType = ({ label: org }) => (
    <SelectItem>
      <div className="nav-icon">
        <div className="avatar avatar-40px me-4">
          <div className="avatar-label fs-2 fw-bold bg-danger text-inverse-danger">{org.substring(0, 1)}</div>
        </div>
      </div>
      <SelectItemLabel>{org}</SelectItemLabel>
    </SelectItem>
  );

  return (
    <Form
      enableReinitialize
      initialValues={{
        title: '',
        org: '',
      }}
      validations={{
        org: Form.is.required(),
        title: [Form.is.required(), Form.is.maxLength(200)],
      }}
      onSubmit={async (values, form) => {
        try {
          const newSpace = await FirestoreService.createSpace(values, currentUser);
          if(newSpace){history.push(`/project/${newSpace}`)
          }
        } catch (error) {
          toast.error(error.message);
        }
      }}
    >
      <FormElement>
        <FormHeading>Create a workspace</FormHeading>
        <Form.Field.Select
          name="org"
          label="Select a parent organisation"
          tip="Start typing to get a list of possible matches."
          options={typeOptions}
          renderOption={renderType}
          renderLabel={renderType}
        />
        <Divider />
        <Form.Field.Input
          name="title"
          label="Workspace name"
          tip="This is the public name for your workspace"
        />
        <Actions>
          <ActionButton type="submit" variant="primary" >
            Create Workspace
          </ActionButton>
          <ActionButton type="button" variant="empty" onClick={modalClose}>
            Cancel
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );

};

export default CreateSpace;
