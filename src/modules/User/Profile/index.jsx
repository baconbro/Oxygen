import { useState } from 'react';
import { ProjectCategory, ProjectCategoryCopy } from '../../shared/constants/projects';
import toast from '../../../../utils/toast';
import { Form, Breadcrumbs } from '../../../../components/common';
import { FormCont, FormElement } from './Styles';
import { useAuth } from "../../../../contexts/AuthContext"
import Sidebar from './Sidebar';
import Header from '../../Org/Header';

import * as FirestoreService from '../../App/services/firestore';

const propTypes = {

};

const UpdateProfile = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const logout = () => {
    setLoading(true)
    setTimeout(() => {
      FirestoreService.logout()
    }, 1000)
  }

  return (
    <div className="page d-flex flex-row flex-column-fluid">
      <div className="wrapper d-flex flex-column flex-row-fluid" id="xgn_wrapper">
        <Header />
        <div className="d-flex flex-column-fluid">
          <Sidebar />
          <div className="d-flex flex-column flex-column-fluid container-fluid">
            <div className="toolbar mb-5 mb-lg-7" id="xgn_toolbar">
              <div className="page-title d-flex flex-column me-3">
                <h1 className="d-flex text-dark fw-bolder my-1 fs-3">Account Settings</h1>
                <Breadcrumbs items={['People', currentUser.fName, 'profile']} />
              </div>
              <div className="d-flex align-items-center py-2 py-md-1">
                <button className='btn btn-danger fw-bold' onClick={logout}>
                  {!loading && <span className='indicator-label'>Logout</span>}
                  {loading && (
                    <span className='indicator-progress' style={{ display: 'block' }}>
                      Please wait...
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div>

            </div>
            <div className="content flex-column-fluid" id="xgn_content">
              <div className="card mb-5 mb-xl-10">
                <Form
                  initialValues={Form.initialValues(currentUser, get => ({
                    displayName: get('fName'),
                    photoURL: get('photoURL'),
                    email: get('email'),
                  }))}
                  validations={{
                    displayName: [Form.is.required(), Form.is.maxLength(100)],

                  }}
                  onSubmit={async (values, form) => {
                    try {
                      FirestoreService.basicEditUser(values)
                        .then(() => {
                          toast.success('Changes have been saved successfully.');
                        })
                        .catch((error) => {
                          toast.error(error.message);
                        })
                    } catch (error) {
                    }
                  }}
                >
                  <FormCont>
                    <FormElement>
                      <div className="card-header border-0 cursor-pointer" role="button" data-bs-toggle="collapse" data-bs-target="#xgn_account_profile_details" aria-expanded="true" aria-controls="xgn_account_profile_details">

                        <div className="card-title m-0">
                          <h3 className="fw-bolder m-0">Profile Details</h3>
                        </div>
                      </div>
                      <div id="xgn_account_settings_profile_details" className="collapse show">
                        <div className="card-body border-top p-9">
                          <Form.Field.Input name="fName" label="Full name" />
                          <Form.Field.Input name="email" label="Email" />
                          <Form.Field.Input name="photoURL" label="Photo URL" />
                        </div>
                        <div className="card-footer d-flex justify-content-end py-6 px-9">
                          <button type="submit" className="btn btn-primary" id="xgn_account_profile_details_submit">Save Changes</button>
                        </div>

                      </div>
                    </FormElement>
                  </FormCont>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));



export default UpdateProfile;
