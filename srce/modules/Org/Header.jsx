import React, { useState } from 'react';
import logo from '../App/assets/img/logo_oxy.png';
import { useAuth } from "../../../contexts/AuthContext"
import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/common';
import './Styles.css'


const Header = ({ issueSearchModalOpen, issueCreateModalOpen }) => {
    const { currentUser } = useAuth()

    return (
        <div id="xgn_header" className="header">
            <div className="container-fluid d-flex flex-stack">
                <div className="d-flex align-items-center me-5">

                    <Link to={`/dashboard/`}>
                        <img alt="Logo" src={logo} className="h-25px h-lg-30px" /> Oxygen <span className="badge badge-light-primary me-auto">Alpha V2.0</span>
                    </Link>
                    <div className="ms-5 ms-md-10">              </div>

                </div>


                <div className="d-flex align-items-center flex-shrink-0">


                    <div className="d-flex align-items-center ms-1">
                        <Link to={`/manage-profile/`}>

                            <div className="btn btn-flex align-items-center bg-hover-white bg-hover-opacity-10 py-2 px-2 px-md-3" data-xgn-menu-trigger="click" data-xgn-menu-attach="parent" data-xgn-menu-placement="bottom-end">

                                <div className="d-none d-md-flex flex-column align-items-end justify-content-center me-2 me-md-4">
                                    <span className="text-muted fs-8 fw-bold lh-1 mb-1">{currentUser.fName}</span>
                                    <span className="text-white fs-8 fw-bolder lh-1">{currentUser.email}</span>
                                </div>

                                <div className="avatar avatar-30px avatar-md-40px">
                                    <Avatar avatarUrl={currentUser.photoURL} name={currentUser.fName} size={40} />
                                </div>

                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default Header;
