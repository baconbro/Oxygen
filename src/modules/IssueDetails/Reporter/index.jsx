import React, { Fragment,useState } from 'react';
import PropTypes from 'prop-types';

import { Avatar, Select, Icon } from '../../../components/common';

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

  //In projectUsers, transform user.id in text if it is a number
projectUsers.forEach(user => {
  if(typeof user.id === "number"){
    user.id = user.id.toString()
  }
})
// Ensure that issue.userIds is an array
if (!issue.userIds) {
  issue.userIds = [];
}
//in issue.users, update data with projectUsers data based on issue.usersId
issue.userIds.forEach(userId => {
  const user = projectUsers.find(user => user.id === userId)
  if(user){
    issue.users.push(user)
  }
})
//wait 5 seconds to set loading to false
setTimeout(() => {
setLoading(false)
}, 500);

// Ensure that issue.userIds is an array
if (!issue.users) {
  issue.users = [];
}
//make sure that name and avatarUrl are the one from projectUsers
issue.users.forEach(user => {
  const user2 = projectUsers.find(user2 => user2.id === user.id)
  if(user2){
    user.name = user2.name
    user.avatarUrl = user2.avatarUrl
  }
})

  const getUserById = userId => {
  return projectUsers.find(user => user.id === userId)}
  
  const userOptions = projectUsers.map(user => ({ value: user.id, label: user.name }));

  return (
    <Fragment>
      <h3 className="fw-bold mb-1">Reporter</h3>
      {loading && <p>Loading...</p>}
      {!loading && 
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="reporter"
        value={issue.reporterId}
        options={userOptions}
        onChange={userId => updateIssue({ reporterId: userId })}
        renderValue={({ value: userId }) => renderUser(getUserById(userId), true)}
        renderOption={({ value: userId }) => renderUser(getUserById(userId))}
      />}
    </Fragment>
  );
};

const renderUser = (user, isSelectValue, removeOptionValue) => {

  //if user is undefined, set it to anonymous user  
  if(!user){  
    user = {
      avatarUrl: "",
      email: "anonymous@oxgneap.com",
      id: 69420,
      name: "Anonymous",
      role: "member"
    }
  }

  return (
    <>
      <User
        key={user.id}
        isSelectValue={isSelectValue}
        withBottomMargin={!!removeOptionValue} 
      >
        <Avatar avatarUrl={user.avatarUrl} name={user.name} size={25} />
        <Username>{user.name}</Username>
        {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue && removeOptionValue()} />}
      </User>
    </>
  );
}

ProjectBoardIssueDetailsReporter.propTypes = propTypes;

export default ProjectBoardIssueDetailsReporter;
