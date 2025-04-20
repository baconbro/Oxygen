import { useEffect, useState } from 'react';
import { Select, Avatar, Icon } from '../../../../components/common';
import { SectionTitle } from '../../../IssueDetails/Styles';
import { User, Username } from '../../../IssueDetails/AssigneesReporter/Styles';
import * as FirestoreService from '../../../../services/firestore';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';

const SpaceMembers = ({ project, spaceId }) => {
  const { orgUsers } = useWorkspace();
  const [owner, setOwner] = useState(null);
  const [spaceMembers, setSpaceMembers] = useState((project.members ? project.members : []));

  // Transform orgUsers from object to array for usage in the component
  const [usersArray, setUsersArray] = useState([]);

  useEffect(() => {
    if (orgUsers && orgUsers.users) {
      // Convert the orgUsers.users object to an array
      const usersList = Object.keys(orgUsers.users).map(userId => {
        const userData = orgUsers.users[userId];
        return {
          uid: userId,
          value: userId,
          ...userData,
          name: userData.name || userData.displayName || userData.email
        };
      });
      setUsersArray(usersList);
      
      // Find owner in the converted array
      const foundOwner = usersList.find(user => user.role === 'owner');
      setOwner(foundOwner);
    }
  }, [orgUsers]);

  const getUserByUid = userId => usersArray.find(user => user.uid === userId);

  // Create allUsers array from the transformed usersArray
  const allUsers = usersArray.map(user => ({
    value: user.uid,
    label: user.name || user.email,
    status: user.status
  }));

  const userOptions = spaceMembers.map(({ uid }) => uid);

  // Filter out the owner and users already in the workspace
  const allUser = allUsers.filter(user =>
    owner && user.value !== owner.uid && !userOptions.includes(user.value)
  );

  const updateIssue = (members, spaceId) => {
    // Ensure all members have avatarUrl property
    if (members.members && members.members.length > 0) {
      members.members.forEach(member => {
        if (member.avatarUrl === undefined) {
          member.avatarUrl = ""
        }
      })
    }

    // This is workspace-specific so keep using FirestoreService
    FirestoreService.addUserToSpace(members, project.org)
      .then(userInfo => {
        setSpaceMembers(members.members)
      })
      .catch((error) => console.log(error));
  };

  // Custom render option that shows status indicator
  const renderOption = ({ value: userId }) => {
    const user = getUserByUid(userId);
    if (!user) return null; // Guard against undefined users

    return (
      <User>
        <Avatar avatarUrl={user.avatarUrl} name={user.name || user.email} size={25} />
        <Username>
          {user.name || user.email}
          {user.status === 'unregistered' && (
            <span className="badge badge-light-warning ms-2">Pending</span>
          )}
        </Username>
      </User>
    );
  };

  // If owner is not found yet, show loading
  if (!owner) return <div>Loading...</div>;

  return (
    <>
      <SectionTitle>Owner</SectionTitle>
      <span disabled>
        <Select
          variant="empty"
          dropdownWidth={343}
          withClearValue={false}
          name="reporter"
          value={owner.uid}
          options={[owner].map(user => ({ value: user.uid, label: user.name }))}
          onChange={userId => updateIssue({ reporterId: userId })}
          renderValue={({ value: userId }) => renderUser(getUserByUid(userId), true)}
          renderOption={({ value: userId }) => renderUser(getUserByUid(userId))}
        /></span>
      <SectionTitle>Members</SectionTitle>
      {usersArray.length > 1 && <Select
        isMulti
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        placeholder="Unassigned"
        name="assignees"
        value={userOptions}
        options={allUser}
        onChange={userIds => {
          updateIssue({ members: userIds.map(getUserByUid), spaceId });
        }}
        renderValue={({ value: userId, removeOptionValue }) =>
          renderUser(getUserByUid(userId), true, removeOptionValue)
        }
        renderOption={renderOption}
      />
      }
    </>
  )
};

const renderUser = (user, isSelectValue, removeOptionValue) => {
  if (!user) return null; // Guard against undefined users

  return (
    <User
      key={user.uid}
      isSelectValue={isSelectValue}
      withBottomMargin={!!removeOptionValue}
      onClick={() => removeOptionValue && removeOptionValue()}
    >
      <Avatar avatarUrl={user.avatarUrl} name={user.name || user.email} size={25} />
      <Username>
        {user.name || user.email}
        {user.status === 'unregistered' && isSelectValue && (
          <span className="badge badge-light-warning ms-2">Pending</span>
        )}
      </Username>
      {removeOptionValue && <Icon type="close" top={1} />}
    </User>
  );
}

export default SpaceMembers;