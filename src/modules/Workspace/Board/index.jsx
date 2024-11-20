import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Filters from './Filters/filter';
import * as FirestoreService from '../../../services/firestore';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import Dnd from './Lists/dnd';
import { useAuth } from '../../auth';

const propTypes = {
  updateLocalProjectIssues: PropTypes.func.isRequired,
};

const ProjectBoard = ({ fetchProject, updateLocalProjectIssues, refreshData }) => {

  const { projectUsers, setProjectUsers, defaultFilters, filters, mergeFilters, project } = useWorkspace()

  var id = useParams()

  //if id.id is different from project.id then refresh the data
  useEffect(() => {
    const projectUsers = (project.members ? project.users.concat(project.members) : project.users)
    setProjectUsers(projectUsers)
  }, [id.id]);

  //update the user to add the workspace id to his lastWorkspace 
  const { currentUser } = useAuth()
  const who = { email: currentUser?.email }
  FirestoreService.editUser(who, { lastWorkspace: project.spaceId })

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
      <Dnd
        project={project}
        filters={filters}
        updateLocalProjectIssues={updateLocalProjectIssues}
        projectUsers={projectUsers} />
    </>
  );
};

ProjectBoard.propTypes = propTypes;

export default ProjectBoard;
