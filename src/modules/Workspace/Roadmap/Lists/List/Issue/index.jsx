import React from 'react';
import PropTypes from 'prop-types';
import { useMatch } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

import { IssueTypeIcon, IssuePriorityIcon } from '../../../components/common';

import { IssueLink, Issue, Assignees, AssigneeAvatar } from './Styles';

const propTypes = {
  projectUsers: PropTypes.array.isRequired,
  issue: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const ProjectBoardListIssue = ({ projectUsers, issue, index }) => {
  const match = useMatch();
  const anonymousUser = {
    avatarUrl: "",
    email: "anonymous@oxgneap.com",
    id: 69420,
    name: "Anonymous",
    role: "member"
  }

  const assig = issue.userIds.map(userId => projectUsers.find(user => user.id === userId));
  //const assignees = issue.userIds.map(userId => projectUsers.find(user => user.id === userId));

  const assignees = Array.from(assig, v => v === undefined ? anonymousUser : v);

  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <IssueLink
          to={`${match.url}/issues/${issue.id}`}
          ref={provided.innerRef}
          data-testid="list-issue"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Issue isBeingDragged={snapshot.isDragging && !snapshot.isDropAnimating}>
            <div className="card" style={{ boxShadow: " 0px 1px 2px 0px rgba(9, 30, 66, 0.25)" }}>
              <div className="card-body" style={{ padding: "0.5rem 1rem" }}>

                {/* <div className="fs-6 fw-bold text-gray-600 mb-5"></div> content for image per exemple */}

                <div className="d-flex align-items-sm-center">
                  <div className="d-flex align-items-center flex-row-fluid flex-wrap">
                    <div className="flex-grow-1 me-2">
                    <span className="fs-4  mb-1 text-gray-900">{issue.title}</span>
                    
                      <span className="text-muted fw-bold d-block fs-7">{issue.tags && issue.tags.map(tag => (
                    <div className="badge badge-light me-2">{Object.values(tag).toString()}</div>
                  ))}</span>
                    </div>
                    <Assignees>
                      {assignees.map(user => (

                        <AssigneeAvatar
                          key={user.id}
                          size={24}
                          avatarUrl={user.avatarUrl}
                          name={user.name}
                        />

                      ))}
                    </Assignees>
                    <span className='text-gray-600 fw-bold me-2'>#{(issue.id.toString().slice(-5)).substring(0, 2)}-{issue.id.toString().slice(-3)}</span>
                  <IssueTypeIcon type={issue.type} />
                  <IssuePriorityIcon priority={issue.priority} top={-1} left={4} />
                  </div>

                </div>



              </div>

            </div>


          </Issue>
        </IssueLink>
      )}
    </Draggable>
  );
};

ProjectBoardListIssue.propTypes = propTypes;

export default ProjectBoardListIssue;
