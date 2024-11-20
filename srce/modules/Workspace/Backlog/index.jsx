import { useEffect } from 'react';
import Filters from '../Board/Filters/filter';
import Lists from './Lists';
import { getAnalytics, logEvent } from "firebase/analytics";
import { useWorkspace } from '../../../contexts/WorkspaceProvider';


const Backlog = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {
  const analytics = getAnalytics();
  logEvent(analytics, 'screen_view', {
    firebase_screen: project.title + " - workspace - backlog",
    firebase_screen_class: "screenClass"
  });
  const { projectUsers, defaultFilters, filters, mergeFilters } = useWorkspace()

  useEffect(() => {
    refreshData()
  }, []);

  return (
    <>
      <div className="d-flex align-items-center py-2 py-md-1">
        <Filters
          projectUsers={projectUsers}
          defaultFilters={defaultFilters}
          filters={filters}
          mergeFilters={mergeFilters}
        />
      </div>

      <Lists
        project={project}
        filters={filters}
        updateLocalProjectIssues={updateLocalProjectIssues}
      />

    </>
  );
};

export default Backlog;
