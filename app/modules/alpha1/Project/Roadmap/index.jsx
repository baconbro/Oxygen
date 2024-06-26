import React, { Fragment, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import useMergeState from '../../shared/hooks/mergeState';
import { Breadcrumbs, Modal } from '../../shared/components';
import Filters from '../Board/Filters';
import Lists from './Lists';
import IssueDetails from './IssueDetails';
import { getAnalytics, logEvent } from "firebase/analytics";


const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
  groupBy: 'None',
  viewType: [],
  viewStatus: [],
};

const Roadmap = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {
  const analytics = getAnalytics();
  logEvent(analytics, 'screen_view', {
    firebase_screen: project.title + " - workspace - backlog",
    firebase_screen_class: "screenClass"
  });
  const match = useLocation();
  const history = useNavigate();

  const [filters, mergeFilters] = useMergeState(defaultFilters);
  const projectUsers = (project.members ? project.users.concat(project.members) : project.users)

  useEffect(() => {
    refreshData()


  }, []);

  return (
    <Fragment>
     <div className="d-flex align-items-center py-2 py-md-1">
        <Filters
          projectUsers={projectUsers}
          defaultFilters={defaultFilters}
          filters={filters}
          mergeFilters={mergeFilters}
        />

      </div>

      <div className='card kanban' >
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <Lists
            project={project}
            filters={filters}
            updateLocalProjectIssues={updateLocalProjectIssues}
          />
          <Routes>
          <Route
            path={`${match.path}/issues/:issueId`}
            render={routeProps => (
              <Modal
                isOpen
                testid="modal:issue-details"
                width={1040}
                withCloseIcon={false}
                onClose={() => history.push(match.url)}
                renderContent={modal => (
                  <IssueDetails
                    issueId={routeProps.match.params.issueId}
                    projectUsers={projectUsers}
                    //fetchProject={fetchProject}
                    updateLocalProjectIssues={updateLocalProjectIssues}
                    modalClose={modal.close}
                    issueProps={project.issues}
                  />
                )}
              />
            )}
          />
          </Routes>
        </div>
      </div>
    </Fragment>
  );
};

export default Roadmap;
