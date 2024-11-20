import { Droppable } from 'react-beautiful-dnd';
import Issue from './Issue';
import { List, Issues } from './Styles';
import AddItem from '../../../Board/Lists/List/AddItem';
import { Header } from '../../../Board/Lists/dnd/styles/title';
import { useState } from 'react';
import { useWorkspace } from '../../../../../contexts/WorkspaceProvider';
import classNames from 'classnames';
import { filterIssues } from '../../../../../utils/issueFilterUtils';
import CreateSprint from '../../sprintForm';
import { Modal } from 'react-bootstrap';


const ProjectBoardList = ({ status, project, filters, currentUserId, isCollapsed, color, isSprint, sprint }) => {
  const filteredIssues = filterIssues(project.issues, filters, currentUserId);
  const filteredListIssues = getSortedListIssues(filteredIssues, status, sprint?.id);
  const allListIssues = getSortedListIssues(project.issues, status, sprint?.id);
  const projectUsers = (project.members ? project.users.concat(project.members) : project.users)
  const { workspaceConfig } = useWorkspace();
  const columnName = () => {
    return isSprint ? sprint.name : workspaceConfig?.issueStatus?.find(column => column.id === status)?.name;
  };
  const [collapsed, setCollapsed] = useState(!!isCollapsed);
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const firstIssue = (allListIssues) => {
    const listPositions = allListIssues.map(({ listPosition }) => listPosition);

    if (listPositions.length > 0) {
      return Math.min(...listPositions) - 1;
    }
    return 1;
  };

  return (
    <div
      className={classNames('kanban-column scrollbar', {
        collapsed
      })}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Droppable key={status} droppableId={status}>
        {provided => (
          <List className="d-flex flex-column flex-grow-1 ">
            <div className="kanban-column-header px-4 hover-actions-trigger">
              <div
                className={`d-flex align-items-center border-bottom border-3 py-3 mb-3`}
                style={{ "--bs-border-color": color || '#FF5733' }}
              >
                <Header className="mb-0 kanban-column-title">
                  <div >
                    <>
                      <span  >
                        {columnName()}
                        <span className="kanban-title-badge badge badge-circle badge-secondary">
                          {workspaceConfig?.workspaceConfig?.board?.columnHeaderBadge === 'storypoint' ? (
                            <>
                              {filteredListIssues.reduce((sum, item) => sum + (item.storypoint || 0), 0)}
                            </>
                          ) : (
                            <>
                              {formatIssuesCount(filteredListIssues)}
                            </>
                          )}
                        </span>
                      </span>
                    </>
                  </div>
                </Header>
                {isSprint && (
                  <>
                    <button className="hover-actions  btn btn-sm" onClick={handleShowModal}>
                      <i className="bi bi-three-dots"></i>
                    </button>
                    <Modal show={showModal} onHide={handleCloseModal} centered>
                      <Modal.Header closeButton>
                        <Modal.Title>
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <CreateSprint modalClose={handleCloseModal} sprintData={sprint} />
                      </Modal.Body>
                      <Modal.Footer>
                      </Modal.Footer>
                    </Modal>
                  </>
                )}
                <a
                  className="btn ms-auto kanban-collapse-icon p-0"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <i className="bi bi-arrow-bar-right fs-2qx"></i>
                  ) : (
                    <i className="bi bi-arrow-bar-left fs-2qx"></i>
                  )}
                </a>
              </div>
            </div>
            <div className="kanban-items-container d-flex flex-column flex-grow-1">
              <AddItem status={status} currentUserId={currentUserId} spaceId={project.spaceId} lastIssue={firstIssue(allListIssues)} />
              <Issues
                {...provided.droppableProps}
                ref={provided.innerRef}
                data-testid={`board-list:${status}`}
                style={{ minHeight: '150px' }}
                className="flex-grow-1"
              >
                {filteredListIssues.map((issue, index) => (
                  <Issue key={issue.id} projectUsers={projectUsers} issue={issue} index={index} />
                ))}
                {provided.placeholder}
              </Issues>
            </div>
          </List>
        )}
      </Droppable>
    </div>
  );
};



const getSortedListIssues = (issues, status, sprintId) => {
  if (sprintId) {
    return issues
      .filter(issue => issue.sprintId === sprintId)
      .sort((a, b) => a.listPosition - b.listPosition);
  }
  return issues
    .filter(issue => issue.status === status && (!sprintId || issue.sprintId === sprintId))
    .sort((a, b) => a.listPosition - b.listPosition);
};

const formatIssuesCount = (allListIssues) => {
  return allListIssues.length;
};


export default ProjectBoardList;
