import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { grid } from '../styles/constants';
import { IssuePriorityIcon } from '../../../../../../components/common';
import { useWorkspace } from '../../../../../../contexts/WorkspaceProvider';
import { Assignees, AssigneeAvatar } from '../../List/Issue/Styles';
import { Link } from 'react-router-dom';
import { IconComponent } from '../../../../../../components/common/IssueIconComponent';

const getBackgroundColor = (isDragging, isGroupedOver, authorColors) => {
  if (isDragging) {
    return authorColors.soft;
  }
  if (isGroupedOver) {
    return '#EBECF0';
  }
  return '#FFFFFF';
};

const getBorderColor = (isDragging, authorColors) =>
  isDragging ? authorColors.hard : 'transparent';

const imageSize = 40;

const Container = styled(Link)`
  border-color: ${(props) => getBorderColor(props.isDragging, props.colors)};
  //background-color: ${(props) => getBackgroundColor(props.isDragging, props.isGroupedOver, props.colors)};
  box-shadow: ${({ isDragging }) => (isDragging ? `2px 2px 1px #A5ADBA` : 'none')};
  box-sizing: border-box;
  padding: 1px;
  min-height: ${imageSize}px;
  margin-bottom: ${grid}px;
  user-select: none;



  &:hover,
  &:active {
    color: #091e42;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.colors.hard};
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
`;

function getStyle(provided, style) {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  };
}

function Item(props) {
  const { item, isDragging, isGroupedOver, provided, style, isClone, index } = props;

  const [assig, setAssig] = useState([]);
  const { projectUsers, project, orgUsers } = useWorkspace();
  const [parentIssue, setParentIssue] = useState(null);
  const [enhancedUsers, setEnhancedUsers] = useState([]);

  // Enhanced logic to map orgUsers data with projectUsers
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
            name: orgUserData.name || orgUserData.displayName || orgUserData.email,
            photoURL: orgUserData.photoURL || orgUserData.avatarUrl
          };
        } else {
          return {
            ...projectUser,
            id: userId
          };
        }
      });
      
      setEnhancedUsers(mappedUsers);
    }
  }, [orgUsers, projectUsers]);

  // Watch for changes in enhancedUsers and update assignees
  useEffect(() => {
    if (enhancedUsers.length > 0 && item.userIds) {
      const newAssig = item.userIds.map(userId => 
        enhancedUsers.find(user => user.id === userId)
      );
      setAssig(newAssig);
    }
  }, [enhancedUsers, item.userIds]);

  // Find parent issue if item has a parent
  useEffect(() => {
    if (item.parent) {
      const parent = project.issues.find(issue => issue.id === item.parent);
      setParentIssue(parent);
    }
  }, [item.parent, project.issues]);

  const anonymousUser = {
    photoURL: "",
    avatarUrl: "",
    email: "anonymous@oxgneap.com",
    id: "anonymous",
    name: "Anonymous",
    role: "member"
  };

  const assignees = Array.from(assig, v => v === undefined ? anonymousUser : v);

  // Safely format a due date coming as string, number (ms), or Firestore Timestamp
  const formatDueDate = (val) => {
    if (!val) return '';
    let dateObj = null;
    if (typeof val === 'number') {
      dateObj = new Date(val);
    } else if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d)) dateObj = d;
    } else if (typeof val === 'object' && val !== null) {
      // Firestore Timestamp-like
      if (typeof val.toDate === 'function') {
        dateObj = val.toDate();
      } else if (typeof val.seconds === 'number') {
        dateObj = new Date(val.seconds * 1000);
      }
    }
    if (!dateObj || isNaN(dateObj)) return '';
    return dateObj.toISOString().slice(0, 10);
  };

  return (
    <Container
      to={`issues/${item.id}`}
      colors='#FFFF'//{item.author.colors}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-testid={item.id}
      data-index={index}
    >
      <div className="card" style={{ width: '100%', boxShadow: " 0px 1px 2px 0px rgba(9, 30, 66, 0.25)" }} id={item.id}>
        <div className="progress h-6px " style={{ backgroundColor: 'initial' }}>
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: item.progress + '%', borderTopLeftRadius: '20px' }}></div>
        </div>
        {parentIssue && (
          <div className="card-header bg-light-primary" style={{ padding: "0.5rem 1rem", minHeight: "unset" }}>
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <span className="fs-6 fw-bold text-gray-600 ms-2"><i className='bi bi-diagram-2 fs-2x'></i> {parentIssue.title}</span>
              </div>

            </div>
          </div>
        )}
        <div className="card-body" style={{ padding: "1rem 1rem" }}>

          <div className="mb-2">
            <span className="fs-4  mb-1 text-gray-900">{item.title}</span>
          </div>
          <div className="d-flex mb-3">
            {item.tags && <i className="bi bi-tags me-2"></i>}
            {item.tags && item.tags.map(tag => (
              <div className="badge badge-light me-2" key={Object.values(tag)}>{Object.values(tag).toString()}</div>
            ))}

          </div>
          <div className="d-flex mb-3">
            {item.dueDate && (
              <div className="badge badge-light me-2">
                <i className="bi bi-calendar-event me-2"></i> {formatDueDate(item.dueDate)}
              </div>
            )}
          </div>
          <div className="d-flex mb-3">
            {item.wpkg && <div className="badge badge-light-dark me-2"> <i className="bi bi-box-seam me-2"></i> {item.wpkg}</div>}
          </div>
          <div className="d-flex mb-3">
            {item.tsize && <div className="badge badge-light me-2"><i className="bi bi-rulers me-2"></i>{item.tsize}</div>}
            {item.storypoint && <div className="badge badge-light me-2"><i className="bi bi-ticket-fill me-2"></i>{item.storypoint}</div>}
          </div>

          {/* <div className="fs-6 fw-bold text-gray-600 mb-5"></div> content for image per exemple */}

          <div className="d-flex flex-stack flex-wrapr">
            <Assignees>
              {assignees.map(user => (
                <AssigneeAvatar
                  key={user.id}
                  size={25}
                  avatarUrl={user.photoURL || user.avatarUrl || ''}
                  name={user.name}
                  className='avatar-circle'
                />

              ))}
            </Assignees>
            {item.dependencies && (
              <div className="badge badge-light me-2">
                <i className="bi bi-link-45deg me-2"></i>
                {item.dependencies.length}
              </div>
            )}
            <div className="d-flex my-1">
              <span className='text-gray-600 fw-bold me-2'>#{item.id}</span>
              <IconComponent typeId={item.type} projectConfig={project.config} />
              <IssuePriorityIcon priority={item.priority} top={-1} left={4} />
            </div>

          </div>

        </div>

      </div>
      {/*  {isClone ? <CloneBadge>Clone</CloneBadge> : null} */}
    </Container>
  );
}

export default React.memo(Item);
