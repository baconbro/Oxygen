import React, { useState } from 'react';
import * as FirestoreService from '../../App/services/firestore'


const SuperAdmin = () => {
    FirestoreService.adminStats()
        .then(s => { 
    return (

        <div className="col-md-6 col-xxl-12">

            <div className="card card-flush border-0 h-md-100" style={{ backgroundColor: "#22232B" }}>

                <div className="card-header pt-2">

                    <h3 className="card-title">
                        <span className="text-white fs-3 fw-bolder me-2">Instance stats</span>
                        <span className="badge badge-success">Active</span>
                    </h3>
                    <div className="card-toolbar">
                    </div>
                </div>
                <div className="card-body d-flex justify-content-between flex-column pt-1 px-0 pb-0">
                    <div className="d-flex flex-wrap px-9 mb-5">
                        <div className="rounded min-w-125px py-3 px-4 my-1 me-6" style={{ border: "1px dashed rgba(255, 255, 255, 0.15)" }}>

                            <div className="d-flex align-items-center">
                                <div className="text-white fs-2 fw-bolder" data-xgn-countup="true" data-xgn-countup-value="4368" data-xgn-countup-prefix="$">{s.users}</div>
                            </div>
                            <div className="fw-bold fs-6 text-white opacity-50">Users</div>

                        </div>
                        <div className="rounded min-w-125px py-3 px-4 my-1" style={{ border: "1px dashed rgba(255, 255, 255, 0.15)" }}>

                            <div className="d-flex align-items-center">
                                <div className="text-white fs-2 fw-bolder" data-xgn-countup="true" data-xgn-countup-value="120,000">{s.items}</div>
                            </div>
                            <div className="fw-bold fs-6 text-white opacity-50">Items</div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>

    )
})
return(
    <></>
)
}


export default SuperAdmin;