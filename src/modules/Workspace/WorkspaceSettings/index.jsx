import toast from '../../../utils/toast';
import { Form } from '../../../components/common';

import { FormCont, FormElement, ActionButton } from './Styles';
import ProjectMembers from './Members'

import * as FirestoreService from '../../../services/firestore';
import Delete from './Delete';
import { getAnalytics, logEvent } from "firebase/analytics";
import CustomObject from './CustomObject';
import BoardSettings from './BoardSettings';
import { useAuth } from '../../auth';
import { isAcronymAvailable } from '../../../services/workspaceServices';


const ProjectSettings = ({ project, spaceId, updateLocalProjectConfig }) => {
  const { currentUser } = useAuth();
  const analytics = getAnalytics();
  logEvent(analytics, 'screen_view', {
    firebase_screen: project.spaceId + " - settings",
    firebase_screen_class: "screenClass"
  });

  return (
    <>
      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Issue Key (Acronym)</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>
          <Form
            initialValues={{
              acronym: project.acronym || '',
            }}
            validations={{
              acronym: value => {
                if (!value) return undefined; // optional until first set
                const v = value.toUpperCase().trim();
                const re = /^[A-Z]{2,5}$/;
                if (!re.test(v)) return 'Use 2-5 uppercase letters (A-Z).';
                return undefined;
              }
            }}
            onSubmit={async (values, form) => {
              try {
                const raw = values.acronym ? values.acronym.toUpperCase().trim() : '';
                if (!project.acronym && raw) {
                  // Only allow setting once
                  const available = await isAcronymAvailable(raw);
                  if (!available) {
                    toast.error('This acronym is already in use.');
                    return;
                  }
                  await FirestoreService.editSpace({ acronym: raw, issueCounter: 0 }, project.spaceId, currentUser?.all?.currentOrg);
                  toast.success('Acronym saved.');
                  // local update
                  updateLocalProjectConfig({ acronym: raw, issueCounter: 0 });
                } else {
                  toast.error('Acronym cannot be changed once set.');
                }
              } catch (e) {
                toast.error(e.message || 'Failed to save acronym');
              }
            }}
          >
            <FormCont>
              <FormElement>
                <Form.Field.Input name="acronym" label="Workspace acronym"
                  tip="Will prefix new issues, e.g. ABC-123. Permanent once saved."
                  disabled={!!project.acronym}
                  className="form-control"
                />
                <ActionButton type="submit" variant="primary" className="form-control btn btn-primary">
                  {project.acronym ? 'Locked' : 'Save acronym'}
                </ActionButton>
              </FormElement>
            </FormCont>
          </Form>
        </div>
      </div>
      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Workspace Details</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>
          <Form
            initialValues={{
              title: project.title,
              url: (project.url ? project.url : ''),
              description: (project.description ? project.description : ''),
            }}
            validations={{
              title: [Form.is.required(), Form.is.maxLength(100)],
              url: Form.is.url(),
            }}
            onSubmit={async (values, form) => {
              try {
                FirestoreService.editSpace(values, project.spaceId);
                toast.success('Changes have been saved successfully.');
                updateLocalProjectConfig(values)
              } catch (error) {
                toast.error(error.message)
              }
            }}
          >
            <FormCont>
              <FormElement>
                <Form.Field.Input name="title" label="Title" className="form-control" />
                <Form.Field.TextEditor
                  name="description"
                  label="Description"
                  tip="Describe the workspace in as much detail as you'd like."
                />
                <ActionButton type="submit" variant="primary" className="form-control btn btn-primary">
                  Save changes
                </ActionButton>
              </FormElement>
            </FormCont>
          </Form>
        </div>
      </div>

      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Workspace Members</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>

          <ProjectMembers project={project} spaceId={spaceId} />
        </div>
      </div>

      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Workspace objects</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>

          <CustomObject project={project} />
        </div>
      </div>

      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Board Settings</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>
          <BoardSettings />
        </div>
      </div>


      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Delete Workspace</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>

          <Delete project={project} />
        </div>
      </div>
    </>
  );
};


export default ProjectSettings;
