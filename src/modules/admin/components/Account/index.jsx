import React, { useEffect, useState } from 'react';


import * as FirestoreService from '../../../../services/firestore';


import Title from './Title';

const Accountpage = ({ org, orgId }) => {

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false)

    const updateIssue = (updatedFields) => {
        FirestoreService.editOrg(updatedFields, orgId);
    };
    return (
        <>
            {org &&
                <div className="card mb-5 mb-xl-10" id="xgn_profile_details_view">
                    <div className="card-header cursor-pointer">
                        <div className="card-title m-0">
                            <h3 className="fw-bolder m-0">Account details</h3>
                        </div>
                    </div>
                    <div className="card-body p-9">
                        <div className="row mb-6">
                            <label className="col-md-4 col-form-label required fw-bold fs-6">Organisation name</label>
                            <div className="col-md-8 fv-row fv-plugins-icon-container">
                                <Title issue={{ name: org.name }} updateIssue={updateIssue} />
                                <div className="fv-plugins-message-container invalid-feedback"></div></div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
};



export default Accountpage;
