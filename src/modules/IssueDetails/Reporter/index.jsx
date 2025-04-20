import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Select, Icon } from '../../../components/common';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { SectionTitle } from '../Styles';
import { User, Username } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectUsers: PropTypes.array.isRequired,
};

const ProjectBoardIssueDetailsReporter = ({ issue, updateIssue, projectUsers }) => {
  //create a loading state
  const [loading, setLoading] = useState(true);
  const { orgUsers } = useWorkspace();
  const [standardizedProjectUsers, setStandardizedProjectUsers] = useState([]);
  
  useEffect(() => {
    if (orgUsers && orgUsers.users && projectUsers) {
      // Map project users to full user data from orgUsers
      const mappedUsers = projectUsers.map(projectUser => {
        const userId = typeof projectUser.id === "number" ? projectUser.id.toString() : projectUser.id;
        // Find matching user in orgUsers by uid
        const orgUserData = orgUsers.users[userId];
        
        if (orgUserData) {
          return {
            ...projectUser,
            ...orgUserData,
            id: userId,
            name: orgUserData.name || orgUserData.displayName || orgUserData.email
          };
        } else {
          // Fallback to project user data if not found in orgUsers
          console.warn(`User with ID ${userId} not found in organization users`);
          return {
            ...projectUser,
            id: userId
          };
        }
      });
      
      setStandardizedProjectUsers(mappedUsers);
    }
  }, [orgUsers, projectUsers]);

  // Ensure reporterId is initialized
  if (!issue.reporterId) {
    issue.reporterId = '';
  }
  
  // Ensure reporter object is initialized
  if (!issue.reporter) {
    issue.reporter = null;
  }

  // Wait for component to load
  setTimeout(() => {
    setLoading(false)
  }, 500);

  // Safe getUserById function that never returns undefined
  const getUserById = userId => {
    const user = standardizedProjectUsers.find(user => user.id === userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return null;
    }
    return user;
  };
  
  const userOptions = standardizedProjectUsers.map(user => ({ value: user.id, label: user.name }));

  const handleReporterChange = reporterId => {
    if (!reporterId) return;
    
    const reporterUser = getUserById(reporterId);
    updateIssue({ 
      reporterId, 
      reporter: reporterUser 
    });
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && 
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="reporter"
        value={issue.reporterId}
        options={userOptions}
        onChange={handleReporterChange}
        renderValue={({ value: userId }) => renderUser(getUserById(userId), true)}
        renderOption={({ value: userId }) => renderUser(getUserById(userId))}
      />}
    </>
  );
};

const renderUser = (user, isSelectValue, removeOptionValue) => {
  // Provide a fallback user if none is found
  if(!user){  
    user = {
      avatarUrl: "",
      photoURL: "",
      email: "anonymous@oxgneap.com",
      id: "anonymous",
      name: "Anonymous",
      role: "member"
    }
  }

  return (
    <User
      key={user.id}
      isSelectValue={isSelectValue}
      withBottomMargin={!!removeOptionValue} 
    >
      <Avatar avatarUrl={user.photoURL || user.avatarUrl} name={user.name} size={25} />
      <Username>{user.name}</Username>
      {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue && removeOptionValue()} />}
    </User>
  );
}

ProjectBoardIssueDetailsReporter.propTypes = propTypes;

export default ProjectBoardIssueDetailsReporter;
