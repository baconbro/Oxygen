import React, {useState} from 'react';
import { NavLink, useMatch } from 'react-router-dom';


import FeedbackForm from '../../../shared/components/Feedbackform';



const ProjectSidebar = () => {
  const match = useMatch();
 

  return (
    <div id="xgn_aside" className="aside card" data-xgn-drawer="true" data-xgn-drawer-name="aside" data-xgn-drawer-activate="{default: true, lg: false}" data-xgn-drawer-overlay="true" data-xgn-drawer-width="{default:'200px', '300px': '250px'}" data-xgn-drawer-direction="start" data-xgn-drawer-toggle="#xgn_aside_toggle">
          
            <div className="aside-menu flex-column-fluid px-5">
             
                <div className="hover-scroll-overlay-y my-5 pe-4 me-n4" id="xgn_aside_menu_wrapper" data-xgn-scroll="true" data-xgn-scroll-activate="{default: false, lg: true}" data-xgn-scroll-height="auto" data-xgn-scroll-dependencies="#xgn_header, #xgn_aside_footer" data-xgn-scroll-wrappers="#xgn_aside, #xgn_aside_menu" data-xgn-scroll-offset="{lg: '75px'}">
               
                    <div className="menu menu-column menu-rounded fw-bold fs-6" id="#xgn_aside_menu" data-xgn-menu="true">
                        <div data-xgn-menu-trigger="click" className="menu-item here show menu-accordion">
                            <span className="menu-link">
                                <span className="menu-icon">
                                    <span className="svg-icon svg-icon-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <rect x="2" y="2" width="9" height="9" rx="2" fill="black" />
                                            <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="black" />
                                            <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="black" />
                                            <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="black" />
                                        </svg>
                                    </span>
                                 
                                </span>
                                <span className="menu-title">Profile</span>
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



export default ProjectSidebar;
