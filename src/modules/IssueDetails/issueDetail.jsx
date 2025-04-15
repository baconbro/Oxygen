import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import IssueDetails from '.';

const propTypes = {
  project: PropTypes.object.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
};

const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
};

const IssueDetailsPage = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {

  var id = useParams()

  const projectUsers = (project.members ? project.users.concat(project.members) : project.users)
  const [showCreateAppModal, setShowCreateAppModal] = useState(true)


  useEffect(() => {
    refreshData()
  }, []);

  return (
    <>

      <IssueDetails
        issueId={id.issueId}
        projectUsers={projectUsers}
        updateLocalProjectIssues={updateLocalProjectIssues}
        modalClose={() => setShowCreateAppModal(false)}
        issueProps={project.issues}
      />

    </>
  );
};

IssueDetailsPage.propTypes = propTypes;

export default IssueDetailsPage;
