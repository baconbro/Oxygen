import { useEffect, useState } from 'react';

import { Modal } from 'react-bootstrap'
import { Avatar } from '../../../components/common';
import { formatDateTime } from '../../../utils/dateTime';

// Import services from userServices
import { 
  getOrgUsers, 
  inviteUserToOrganization, 
  removeUserFromOrganization 
} from '../../../services/userServices';

import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import toast from '../../../utils/toast';

import Plan from './Plan';
import Accountpage from './Account';
import { useAuth } from '../../auth';

const AdminOverview = () => {

    const { currentUser } = useAuth()
    const [orgId, setOrgId] = useState(currentUser?.all?.currentOrg);
    const [org, setOrg] = useState();
    const [users, setUsers] = useState([]);
    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        getOrgUsers(orgId)
            .then(response => {
                setUsers(response.users);
                setOrg({ users: response.users });
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
            sendInvite(values.email);
        },
    })

    const sendInvite = (email) => {
        if (email) {
            inviteUserToOrganization(email, orgId)
                .then((result) => {
                    handleClose()
                    setLoading(false)
                    toast.success(result.message);
                    refreshData()
                })
                .catch((error) => {
                    handleClose()
                    toast.error(error.message);
                    setLoading(false)
                })
        }
    }

    const removeUser = (user) => {
        removeUserFromOrganization(user, orgId)
            .then((result) => {
                toast.success(result.message);
                refreshData();
            })
            .catch((error) => {
                toast.error(error.message);
            });
    }

    //test if org.users is not empty
    const usersArray = org?.users && Object.keys(org.users).map((key) => {
        return { uid: key, ...org.users[key] };
    });

    return (
        <>
            <Accountpage org={org} orgId={orgId} />
            <Plan users={Object.keys(users).length} />
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title">
                        <div className=" d-flex align-items-center p-5 mb-10">
                            <div className="d-flex flex-column">
                                <h5 className="mb-1">Manage users in your organization</h5>
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
                                    <th className="min-w-125px">Status</th>

                                    <th className="min-w-125px">Joined Date</th>

                                    <th className="text-end min-w-100px">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 fw-bold">
                                {org && usersArray.map((user, index) => (
                                    <tr key={user.uid}>
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
                                        <td>
                                            <div className={`badge fw-bolder ${user.status === "unregistered" ? "badge-danger" : user.status === "registered" ? "badge-success" : ""}`}>
                                                {user.status}
                                            </div>
                                        </td>

                                        <td>{formatDateTime(user.joined)}</td>
                                        <td className="text-end">

                                            {user.role === 'owner' ? null : <button className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary" >
                                                <i className="bi bi-trash fs-3" onClick={() => removeUser(user)}></i>
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
        </>


    );
};



export default AdminOverview
