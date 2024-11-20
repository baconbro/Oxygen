import React from 'react';
import FeedbackForm from '../shared/components/Feedbackform';
import { Link } from "react-router-dom";


const Sidebar = () => {
    return (

        <div id="xgn_aside" className="aside card" data-xgn-drawer="true" data-xgn-drawer-name="aside" data-xgn-drawer-activate="{default: true, lg: false}" data-xgn-drawer-overlay="true" data-xgn-drawer-width="{default:'200px', '300px': '250px'}" data-xgn-drawer-direction="start" data-xgn-drawer-toggle="#xgn_aside_toggle">

            <div className="aside-menu flex-column-fluid px-5">

                <div className="hover-scroll-overlay-y my-5 pe-4 me-n4" id="xgn_aside_menu_wrapper" data-xgn-scroll="true" data-xgn-scroll-activate="{default: false, lg: true}" data-xgn-scroll-height="auto" data-xgn-scroll-dependencies="#xgn_header, #xgn_aside_footer" data-xgn-scroll-wrappers="#xgn_aside, #xgn_aside_menu" data-xgn-scroll-offset="{lg: '75px'}">

                    <div className="menu menu-column menu-rounded fw-bold fs-6" >
                        <div className="menu-item">
                            <Link to={`/dashboard`} >
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="bi bi-grid-1x2 fs-2x"></i>

                                    </span>
                                    <span className="menu-title">Dashboards</span>
                                </span>
                            </Link>
                        </div>
                        <div className="menu-item">
                            <div className="menu-content pt-8 pb-0">
                                <span className="menu-section text-muted text-uppercase fs-8 ls-1">Admin</span>
                            </div>
                        </div>

                        <div className="menu-item">

                            <span className="menu-link active">
                                <span className="menu-icon">
                                    <i className="bi bi-person-badge fs-2x"></i>
                                </span>
                                <span className="menu-title">Manage Account and users</span>
                            </span>

                        </div>

                    </div>

                </div>
            </div>

            <div className="aside-footer flex-column-auto pt-5 pb-7 px-5" id="xgn_aside_footer">
                <FeedbackForm />
            </div>

        </div>

    );
};



export default Sidebar;
