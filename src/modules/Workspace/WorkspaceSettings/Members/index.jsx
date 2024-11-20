import React, { useEffect, useState } from 'react';
import { Select, Avatar, Icon } from '../../../../components/common';

import { SectionTitle } from '../../../IssueDetails/Styles';
import { User, Username } from '../../../IssueDetails/AssigneesReporter/Styles';
import * as FirestoreService from '../../../../services/firestore';
import { useGetOrgUsers } from '../../../../services/userServices';

const SpaceMembers = ({ project, spaceId }) => {

  const projectUsers = (project.members ? project.users.concat(project.members) : project.users)
  const owner = project.users.find(user => user.role === 'owner');
  const filteredProjectUsers = projectUsers.filter(user => user.status !== 'unregistered');
  const [orgUser, setOrgUser] = useState(filteredProjectUsers);
  const [spaceMembers, setSpaceMembers] = useState((project.members ? project.members : []));

  const orgUsers = useGetOrgUsers(project.org);

  useEffect(() => {
    if (orgUsers.data.users) {
      Object.values(orgUsers.data.users).forEach(async (user) => {
        getUserInfo(user.email);
      });
    } else {
      console.log("No such document!");
    }
  }, [orgUsers.data.users]);

  const getUserInfo = (userEmail) => {
    FirestoreService.getUserInfo(userEmail)
      .then(userInfo => {
        userInfo.forEach(async (doc) => {
          let updatedOrgUser = [...orgUser];
          let updatedSpaceMembers = [...spaceMembers];
          updatedOrgUser = updatedOrgUser.map(user => {
            if (user.id === doc.id && user.avatarUrl === "") {
              return { ...user, avatarUrl: doc.data().photoURL || "" };
            }
            return user;
          });

          updatedSpaceMembers = updatedSpaceMembers.map(member => {
            if (member.id === doc.id && member.avatarUrl === "") {
              return { ...member, avatarUrl: doc.data().photoURL || "" };
            }
            return member;
          });

          setOrgUser(updatedOrgUser);
          setSpaceMembers(updatedSpaceMembers);

          if (
            doc.data().name &&
            !orgUser.find(user => user.id === doc.id) &&
            !spaceMembers.find(user => user.id === doc.id) &&
            doc.id !== owner.id &&
            doc.data().status !== 'unregistered' &&
            doc.data().email !== owner.email
          ) {
            setOrgUser(prevOrgUser => [...prevOrgUser, {
              id: doc.data().uid,
              name: doc.data().name,
              avatarUrl: doc.data().avatarUrl || ""
            }]);
          }
        });
      })
      .catch((error) => console.log(error));
  }

  const getUserById = userId => orgUser.find(user => user.id === userId);


  const allUsers = orgUser.map(user => ({ value: user.id, label: user.name }));
  const userOptions = spaceMembers.map(({ id }) => id);
  //filter out the owner from the allUsers and then filter out the spaceMembers from the allUsers
  const allUser = allUsers.filter(user => user.value !== owner.id).filter(user => !userOptions.includes(user.value));



  const updateIssue = (members, spaceId) => {
    //if their is a member in the members array, then for each member, if the avatarUrl is undefined, then change it for a space 
    if (members.members.length > 0) {
      members.members.forEach(member => {
        if (member.avatarUrl === undefined) {
          member.avatarUrl = ""
        }
      })
    }



    FirestoreService.addUserToSpace(members, project.org)
      .then(userInfo => {
        setSpaceMembers(members.members)
        //remove or add the user to userOptions
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <SectionTitle>Owner</SectionTitle>
      <span disabled>
        <Select
          variant="empty"
          dropdownWidth={343}
          withClearValue={false}
          name="reporter"
          value={owner.id}
          options={[owner].map(user => ({ value: user.id, label: user.name }))}
          onChange={userId => updateIssue({ reporterId: userId })}
          renderValue={({ value: userId }) => renderUser(getUserById(userId), true)}
          renderOption={({ value: userId }) => renderUser(getUserById(userId))}
        /></span>
      <SectionTitle>Members</SectionTitle>
      {/* if there is a minimum of one user in OrgUser   */}
      {orgUser.length > 1 && <Select
        isMulti
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        placeholder="Unassigned"
        name="assignees"
        value={userOptions}
        options={allUser}
        onChange={userIds => {
          updateIssue({ members: userIds.map(getUserById), spaceId });
        }}
        renderValue={({ value: userId, removeOptionValue }) =>
          renderUser(getUserById(userId), true, removeOptionValue)
        }
        renderOption={({ value: userId }) => renderUser(getUserById(userId), false)}
      />
      }
    </>
  )
};

const renderUser = (user, isSelectValue, removeOptionValue) => {
  return (
    <User
      key={user.id}
      isSelectValue={isSelectValue}
      withBottomMargin={!!removeOptionValue}
      onClick={() => removeOptionValue && removeOptionValue()}
    >
      <Avatar avatarUrl={user.avatarUrl} name={user.name} size={25} />
      <Username>{user.name}</Username>
      {removeOptionValue && <Icon type="close" top={1} />}
    </User>
  );
}


export default SpaceMembers;