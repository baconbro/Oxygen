import React, { Fragment, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import useMergeState from '../../hooks/mergeState';
//import { Breadcrumbs, Modal } from '../../../../components/common';
import IssueDetails from '.';
import { getAnalytics, logEvent } from "firebase/analytics";


const propTypes = {
  project: PropTypes.object.isRequired,
  //fetchProject: PropTypes.func.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
};

const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
};

const IssueDetailsPage = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {
  const analytics = getAnalytics();
  logEvent(analytics, 'screen_view', {
    firebase_screen: project.title + " - workspace - kanban board",
    firebase_screen_class: "screenClass"
  });
  
  const match = useLocation();
  const history = useNavigate();
  var id = useParams()

  const [filters, mergeFilters] = useMergeState(defaultFilters);
  const projectUsers = (project.members ? project.users.concat(project.members) : project.users)
  const [showCreateAppModal, setShowCreateAppModal] = useState(true)
  const closeModal = () =>{
    setShowCreateAppModal(false)
    history(-1)
  }

  useEffect(() => {
    refreshData()


  }, []);

  return (
    <Fragment>

                  <IssueDetails
                    issueId={id.issueId}
                    projectUsers={projectUsers}
                    //fetchProject={fetchProject}
                    updateLocalProjectIssues={updateLocalProjectIssues}
                    modalClose={() => setShowCreateAppModal(false)}
                    issueProps={project.issues}
                  />
 
    </Fragment>
  );
};

IssueDetailsPage.propTypes = propTypes;

export default IssueDetailsPage;
