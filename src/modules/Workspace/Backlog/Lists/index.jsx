import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import { moveItemWithinArray, insertItemIntoArray } from '../../../../utils/javascript';
import List from './List';
import EmptyBacklog from '../../../../components/common/emptyStates/emptyBacklog';
import { Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import CreateSprint from '../sprintForm';
import { useGetSprints } from '../../../../services/sprintServices';
import { useUpdateItem } from '../../../../services/itemServices';
import { useAuth } from '../../../auth';


const propTypes = {
  project: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
};

const ProjectBoardLists = ({ project, filters, updateLocalProjectIssues }) => {
  const { data } = useGetSprints(project.spaceId, project.org);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    setSprints(data)
  }, [data])


  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const editItemMutation = useUpdateItem();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.all?.currentUserId;

  // Get the keys of the IssueStatus
  const statuses = Object.keys(project.config.issueStatus);
  const firstStatus = project.config.issueStatus[0]?.id;
  const secondStatus = project.config.issueStatus[1]?.id;

  const handleIssueDrop = ({ draggableId, destination, source }) => {
    console.log(draggableId, destination, source)
    //define sprintId based on destination.droppableId wich is the sprint.name to get the sprint.id
    const sprintId = sprints.find(sprint => sprint.name === destination.droppableId)?.id ?? 0;
    console.log(sprintId, 'sprintId')


    //if sprints then change the droppableId of destination to secondStatus
    if (sprints && sprints.length > 0) {
      console.log('sprints', sprints)
      destination.droppableId = secondStatus;
    }

    if (!isPositionChanged(source, destination)) return;

    const issueId = Number(draggableId);
    const updatedFields = {
      status: destination.droppableId,
      listPosition: calculateIssueListPosition(project.issues, destination, source, issueId),
      sprintId: sprintId,
    }
    console.log(destination, 'destination', source, 'source', issueId, 'issueId', updatedFields, 'updatedFields')
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: issueId,
      workspaceId: project.spaceId,
    }
    );
    updateLocalProjectIssues(issueId, updatedFields)

  };

  return (
    <>
      <DragDropContext onDragEnd={handleIssueDrop}>
        <div className="kanban-container scrollbar">
          <List
            key={firstStatus}
            status={firstStatus}
            project={project}
            filters={filters}
            currentUserId={currentUserId}
            isCollapsed={false}
          />
          {Array.isArray(sprints) && sprints.length === 0 ? (
            <List
              key={secondStatus}
              status={secondStatus}
              project={project}
              filters={filters}
              currentUserId={currentUserId}
              isCollapsed={true}
            />
          ) : null}
          {sprints && sprints.map((sprint) => {
            return (
              <List
                key={sprint.id}
                status={sprint.name}
                project={project}
                filters={filters}
                currentUserId={currentUserId}
                isCollapsed={false}
                color="#003049"
                isSprint={true}
                sprint={sprint}
              />
            )
          })}

          <div className="kanban-column scrollbar position-relative bg-transparent d-flex flex-column h-100 flex-center bg-body-hover">
            <button className="btn stretched-link btn-icon btn-icon bg-body-secondary rounded-circle mb-1" onClick={handleShowModal}>
              <i className="bi bi-plus fs-3x"></i><i className="bi bi-calendar2-week fs-3x">Sprint</i>
            </button>
          </div>
        </div>

      </DragDropContext>
      {(project.issues && project.issues.length > 0) ? <></> : <><EmptyBacklog /></>
      }
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateSprint modalClose={handleCloseModal} />
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </>
  )
}

const isPositionChanged = (destination, source) => {
  if (!destination) return false;
  const isSameList = destination.droppableId === source.droppableId;
  const isSamePosition = destination.index === source.index;
  return !isSameList || !isSamePosition;
};

const calculateIssueListPosition = (...args) => {
  const { prevIssue, nextIssue } = getAfterDropPrevNextIssue(...args);
  let position;

  if (!prevIssue && !nextIssue) {
    position = 12;
  } else if (!prevIssue) {
    position = nextIssue.listPosition - 1;
  } else if (!nextIssue) {
    position = prevIssue.listPosition + 1;
  } else {
    position = prevIssue.listPosition + (nextIssue.listPosition - prevIssue.listPosition) / 2;
  }
  return position;
};

const getAfterDropPrevNextIssue = (allIssues, destination, source, droppedIssueId) => {
  const beforeDropDestinationIssues = getSortedListIssues(allIssues, destination.droppableId);
  const droppedIssue = allIssues.find(issue => issue.id === droppedIssueId);
  const isSameList = destination.droppableId === source.droppableId;

  const afterDropDestinationIssues = isSameList
    ? moveItemWithinArray(beforeDropDestinationIssues, droppedIssue, destination.index)
    : insertItemIntoArray(beforeDropDestinationIssues, droppedIssue, destination.index);

  return {
    prevIssue: afterDropDestinationIssues[destination.index - 1],
    nextIssue: afterDropDestinationIssues[destination.index + 1],
  };
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

ProjectBoardLists.propTypes = propTypes;

export default ProjectBoardLists;
