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

const ProjectBoardIssueDetailsAssigneesReporter = ({ issue, updateIssue, projectUsers}) => {
  //const {projectUsers}=useWorkspace()

//create a loading state
const [loading, setLoading] = useState(true);

  //In projectUsers, transform user.id in text if it is a number
projectUsers.forEach(user => {
  if(typeof user.id === "number"){
    user.id = user.id.toString()
  }
})
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
      <h3 className="fw-bold mb-1">Assignees</h3>
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
        onChange={userIds => {
          updateIssue({ userIds, users: userIds.map(getUserById) });
        }}
        renderValue={({ value: userId, removeOptionValue }) =>
          renderUser(getUserById(userId), true, removeOptionValue)
        }
        renderOption={({ value: userId }) => renderUser(getUserById(userId), false)}
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

ProjectBoardIssueDetailsAssigneesReporter.propTypes = propTypes;

export default ProjectBoardIssueDetailsAssigneesReporter;
