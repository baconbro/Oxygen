import { useEffect } from 'react';
import Filters from '../Board/Filters/filter';
import Lists from './Lists';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';


const Roadmap = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {


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

      <div className='card kanban' >
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <Lists
            project={project}
            filters={filters}
            updateLocalProjectIssues={updateLocalProjectIssues}
          />
        </div>
      </div>
    </>
  );
};

export default Roadmap;
