////Not used

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';
import { Modal } from 'react-bootstrap'
import { Avatar } from '../../../components/common';
import { formatDateTime } from '../shared/utils/dateTime';

import * as FirestoreService from '../App/services/firestore';

import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import toast from '../shared/utils/toast';

import Plan from './Plan';
import { getAnalytics, logEvent } from "firebase/analytics";
import Accountpage from './Account';

const AdminPage = () => {
    const analytics = getAnalytics();
    logEvent(analytics, 'screen_view', {
        firebase_screen: "Manage user",
        firebase_screen_class: "screenClass"
    });
    var id = useParams()
    var idr = id[Object.keys(id)[0]]
    const [orgId, setOrgId] = useState(idr);
    const [org, setOrg] = useState();
    const [users, setUsers] = useState([]);
    useEffect(() => {
        refreshData();
        /*   const script = document.createElement('script');
          script.src = "";
          script.async = true;
          document.body.appendChild(script);
          return () => {
              document.body.removeChild(script);
          } */
        
    }, []);

    const refreshData = () =>{
        FirestoreService.getOrgUsers(orgId)
            .then(getOrg => {
                if (getOrg.exists()) {
                    setOrg(getOrg.data());
                    setUsers(getOrg.data().users);
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => console.log(error));

    }

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false)


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const initialValues = {
        email: '',
    }

    const loginSchema = Yup.object().shape({
        email: Yup.string()
            .email('Wrong email format')
            .min(3, 'Minimum 3 symbols')
            .max(50, 'Maximum 50 symbols')
            .required('Email is required'),
        email2: Yup.string()
            .email('Wrong email format')
            .min(3, 'Minimum 3 symbols')
            .max(50, 'Maximum 50 symbols'),
        email3: Yup.string()
            .email('Wrong email format')
            .min(3, 'Minimum 3 symbols')
            .max(50, 'Maximum 50 symbols'),
    })

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: (values, { setStatus, setSubmitting }) => {
            setLoading(true)
            setTimeout(() => {
                login(values.email, values.password)
            }, 1000)
        },
    })

    const login = (email) => {
        if (email) {
            FirestoreService.inviteUser(email, orgId)
                .then((userCredential) => {
                    handleClose()
                    setLoading(false)
                    refreshData()
                })
                .catch((Error) => {
                    handleClose()
                    toast.error(Error.message);
                    setLoading(false)

                })
        }
    }


const removeUser = (user) =>{
    FirestoreService.editUsers(user, orgId)
    .then((userCredential) => {
        handleClose()
        setLoading(false)
        refreshData()
    })
    .catch((Error) => {
        handleClose()
        toast.error(Error.message);
        setLoading(false)

    })
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
                                <h1 className="d-flex text-dark fw-bolder my-1 fs-3">Users</h1>
                            </div>
                            <div className="d-flex align-items-center py-2 py-md-1">
                            </div>
                        </div>
                        <div className="content flex-column-fluid" id="xgn_content">
                            <Accountpage org={org} orgId={orgId} />
                            <Plan users={Object.keys(users).length} />
                            <div className="card">
                                <div className="card-header border-0 pt-6">
                                    <div className="card-title">
                                        <div className="alert alert-light d-flex align-items-center p-5 mb-10">
                                            <div className="d-flex flex-column">
                                                <h5 className="mb-1">Manage udsfsdfsers in your organization</h5>
                                                <span>Once a user is added, you can later added them to spaces</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-toolbar">
                                        <div className="d-flex justify-content-end" data-xgn-user-table-toolbar="base">
                                            <button type="button" className="btn btn-primary" onClick={handleShow}>
                                                <span className="svg-icon svg-icon-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <rect opacity="0.5" x="11.364" y="20.364" width="16" height="2" rx="1" transform="rotate(-90 11.364 20.364)" fill="black" />
                                                        <rect x="4.36396" y="11.364" width="16" height="2" rx="1" fill="black" />
                                                    </svg>
                                                </span>Add User</button>
                                            <Modal show={show} onHide={handleClose}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Add users to your team</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <form
                                                        className='form w-100'
                                                        onSubmit={formik.handleSubmit}
                                                        noValidate
                                                        id='xgn_login_signin_form'
                                                    >
                                                        <div className='fv-row mb-10'>
                                                            <label className='form-label fs-6 fw-bolder text-dark'>Add a member</label>
                                                            <input
                                                                placeholder='Email'
                                                                {...formik.getFieldProps('email')}
                                                                className={clsx(
                                                                    'form-control form-control-lg form-control-solid',
                                                                    { 'is-invalid': formik.touched.email && formik.errors.email },
                                                                    {
                                                                        'is-valid': formik.touched.email && !formik.errors.email,
                                                                    }
                                                                )}
                                                                type='email'
                                                                name='email'
                                                                autoComplete='off'
                                                            />
                                                            {formik.touched.email && formik.errors.email && (
                                                                <div className='fv-plugins-message-container'>
                                                                    <span role='alert'>{formik.errors.email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='text-center'>
                                                            <button
                                                                type='submit'
                                                                id='xgn_sign_in_submit'
                                                                className='btn btn-lg btn-primary w-100 mb-5'
                                                                disabled={formik.isSubmitting || !formik.isValid}
                                                            >
                                                                {!loading && <span className='indicator-label'>Add member</span>}
                                                                {loading && (
                                                                    <span className='indicator-progress' style={{ display: 'block' }}>
                                                                        Please wait...
                                                                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </form>

                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <button className='btn btn-sm btn-light' onClick={handleClose}>
                                                        Close
                                                    </button>
                                                </Modal.Footer>
                                            </Modal>
                                        </div>
                                        <div className="d-flex justify-content-end align-items-center d-none" data-xgn-user-table-toolbar="selected">
                                            <div className="fw-bolder me-5">
                                                <span className="me-2" data-xgn-user-table-select="selected_count"></span>Selected</div>
                                            <button type="button" className="btn btn-danger" data-xgn-user-table-select="delete_selected">Delete Selected</button>
                                        </div>
                                        <div className="modal fade" id="xgn_modal_add_user" tabIndex="-1" aria-hidden="true">

                                            <div className="modal-dialog modal-dialog-centered mw-650px">

                                                <div className="modal-content">

                                                    <div className="modal-header" id="xgn_modal_add_user_header">

                                                        <h2 className="fw-bolder">Add User</h2>

                                                        <div className="btn btn-icon btn-sm btn-active-icon-primary" data-xgn-users-modal-action="close">

                                                            <span className="svg-icon svg-icon-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                    <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="black" />
                                                                    <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="black" />
                                                                </svg>
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="card-body py-4">
                                    <div className="table-responsive">
                                        <table className="table align-middle table-row-dashed fs-6 gy-5" id="xgn_table_users">
                                            <thead>
                                                <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">

                                                    <th className="min-w-125px">User</th>
                                                    <th className="min-w-125px">Role</th>

                                                    <th className="min-w-125px">Joined Date</th>

                                                    <th className="text-end min-w-100px">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-600 fw-bold">
                                                {org && org.users.map((user, index) => (
                                                    <tr>
                                                        <td className="d-flex align-items-center">
                                                            <div className="avatar avatar-circle avatar-50px overflow-hidden me-3">

                                                                <div className="avatar-label w-100">
                                                                    <Avatar avatarUrl="" name={user.email} size={50} />
                                                                </div>

                                                            </div>
                                                            <div className="d-flex flex-column">
                                                                <span className="text-gray-800 mb-1">{user.email}</span>
                                                                <span></span>
                                                            </div>
                                                        </td>
                                                        <td><div className="badge badge-light fw-bolder">{user.role}</div></td>

                                                        <td>{formatDateTime(user.joined)}</td>
                                                        <td className="text-end">

                                                            {user.role == 'owner' ? null : <button className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary" >
                                                                <i className="bi bi-trash fs-3" onClick={ () => removeUser(user)}></i>
                                                            </button>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer py-4 d-flex flex-column flex-md-row flex-stack" id="xgn_footer">
                            <div className="text-dark order-2 order-md-1">
                                <span className="text-muted fw-bold me-1">2022©</span>
                                <a href="" target="_blank" className="text-gray-800 text-hover-primary">Oxygen</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default AdminPage;
