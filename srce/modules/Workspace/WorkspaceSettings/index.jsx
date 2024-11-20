import React from 'react';

import toast from '../../../utils/toast';
import { Form, Breadcrumbs, Select, Avatar } from '../../../components/common';

import { FormCont, FormHeading, FormElement, ActionButton } from './Styles';
import ProjectMembers from './Members'

import * as FirestoreService from '../../../services/firestore';
import Delete from './Delete';
import { getAnalytics, logEvent } from "firebase/analytics";
import CustomObject from './CustomObject';
import BoardSettings from './BoardSettings';


const ProjectSettings = ({ project, spaceId, updateLocalProjectConfig }) => {
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
            <h3 className="fw-bolder m-0">Project Details</h3>
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
                  tip="Describe the project in as much detail as you'd like."
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
            <h3 className="fw-bolder m-0">Project Members</h3>
          </div>
        </div>
        <div className='card-body border-top p-9'>

          <ProjectMembers project={project} spaceId={spaceId} />
        </div>
      </div>

      <div className='card mb-5 mb-xl-10'>
        <div className="card-header border-0 ">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Objects</h3>
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
            <h3 className="fw-bolder m-0">Delete space</h3>
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
