import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { IssuePriorityIcon } from '../../../../../../components/common';
import { IssueLink, Issue, Assignees, AssigneeAvatar } from './Styles';
import { useWorkspace } from '../../../../../../contexts/WorkspaceProvider';

const propTypes = {
  projectUsers: PropTypes.array.isRequired,
  issue: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const ProjectBoardListIssue = ({ projectUsers, issue, index }) => {
  const anonymousUser = {
    avatarUrl: "",
    email: "anonymous@oxgneap.com",
    id: 69420,
    name: "Anonymous",
    role: "member"
  }
  const { project } = useWorkspace()

  const assig = issue.userIds.map(userId => projectUsers.find(user => user.id === userId));
  //const assignees = issue.userIds.map(userId => projectUsers.find(user => user.id === userId));

  const assignees = Array.from(assig, v => v === undefined ? anonymousUser : v);

  const getIssueTypeDetails = (typeId) => {
    return Object.values(project.config.issueType).find(issueType => issueType.id === typeId);
  };

  const IconComponent = ({ typeId }) => {
    const issueTypeDetails = getIssueTypeDetails(typeId);

    if (!issueTypeDetails) return null; // Or some default icon

    const { icon, color } = issueTypeDetails;
    const iconClass = `bi bi-${icon}`;

    return (
      <i className={iconClass}
        style={{
          color: color,
          display: 'inline-block',
          fontSize: '18px'
        }}></i>
    );
  };

  return (
    <Draggable draggableId={issue.id.toString()} index={index} >
      {(provided, snapshot) => (
        <IssueLink
          to={`issues/${issue.id}`}
          ref={provided.innerRef}
          data-testid="list-issue"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          key={issue.id}

        >
          <Issue isBeingDragged={snapshot.isDragging && !snapshot.isDropAnimating}>
            <div className="card" style={{ boxShadow: " 0px 1px 2px 0px rgba(9, 30, 66, 0.25)" }} key={issue.id}>
              <div className="card-body" style={{ padding: "0.5rem 1rem" }}>
                {/* <div className="fs-6 fw-bold text-gray-600 mb-5"></div> content for image per exemple */}
                <div className="d-flex align-items-sm-center">
                  <div className="d-flex align-items-center flex-row-fluid flex-wrap">
                    <div className="flex-grow-1 me-2 text-truncate">
                      <span className="fs-4  mb-1 text-gray-900">{issue.title}</span>

                      <span className="text-muted fw-bold d-block fs-7">
                        {issue.tags && issue.tags.map((tag, tagIndex) => (
                          <div key={tagIndex} className="badge badge-light me-2">
                            {Object.values(tag).toString()}
                          </div>
                        ))}
                      </span>
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
                    <span className='text-gray-600 fw-bold me-2'>#{issue.id}</span>
                    <IconComponent typeId={issue.type} />
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
