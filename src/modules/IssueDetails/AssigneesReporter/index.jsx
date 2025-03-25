import { useState } from 'react';
import PropTypes from 'prop-types';

import { Avatar, Select, Icon } from '../../../components/common';

import { SectionTitle } from '../Styles';
import { User, Username } from './Styles';


const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectUsers: PropTypes.array.isRequired,
};

const ProjectBoardIssueDetailsAssigneesReporter = ({ issue, updateIssue, projectUsers}) => {
  //create a loading state
  const [loading, setLoading] = useState(true);

  // Standardize user IDs to strings
  const standardizedProjectUsers = projectUsers.map(user => ({
    ...user,
    id: typeof user.id === "number" ? user.id.toString() : user.id
  }));

  // Ensure userIds and users arrays are initialized
  if (!issue.userIds) {
    issue.userIds = [];
  }
  
  if (!issue.users) {
    issue.users = [];
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

  const handleUserChange = userIds => {
    // Filter out any null/undefined values and ensure we only include valid users
    const validUserIds = userIds.filter(userId => userId);
    const validUsers = validUserIds
      .map(getUserById)
      .filter(user => user !== null);
    
    updateIssue({ 
      userIds: validUserIds, 
      users: validUsers 
    });
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && 
      <Select
        isMulti
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        placeholder="Unassigned"
        name="assignees"
        value={issue.userIds}
        options={userOptions}
        onChange={handleUserChange}
        renderValue={({ value: userId, removeOptionValue }) =>
          renderUser(getUserById(userId), true, removeOptionValue)
        }
        renderOption={({ value: userId }) => renderUser(getUserById(userId), false)}
      />}
    </>
  );
};

const renderUser = (user, isSelectValue, removeOptionValue) => {
  // Provide a fallback user if none is found
  if(!user){  
    user = {
      avatarUrl: "",
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
      <Avatar avatarUrl={user.avatarUrl} name={user.name} size={25} />
      <Username>{user.name}</Username>
      {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue && removeOptionValue()} />}
    </User>
  );
}

ProjectBoardIssueDetailsAssigneesReporter.propTypes = propTypes;

export default ProjectBoardIssueDetailsAssigneesReporter;
