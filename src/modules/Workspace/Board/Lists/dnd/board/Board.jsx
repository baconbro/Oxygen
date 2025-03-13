import { useState, useEffect } from "react";
import styled from 'styled-components';
import PropTypes from "prop-types";
import Column from "./Column";
import reorder, { reorderQuoteMap } from "../reorder";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { editSpace } from "../../../../../../services/firestore";
import { filterIssues } from "../../../../../../utils/issueFilterUtils";
import { useUpdateItem } from "../../../../../../services/itemServices";
import { useUpdateWorkspace } from "../../../../../../services/workspaceServices";
import calculateIssueListPosition, { findIdByName } from "../../../../../../utils/calculateIssueListPosition";
import clickSound from '../../../../../../assets/sounds/click.mp3';
import SprintToolBar from "./sprint";
import { useGetSprints } from "../../../../../../services/sprintServices";

const Container = styled.div`
  //min-height: 100vh;
  /* like display:flex but will allow bleeding over the window width */
  //min-width: 100vw;
  display: inline-flex;
  gap: 1rem;
`;

const Board = ({
  isCombineEnabled,
  initial,
  useClone,
  containerHeight,
  withScrollableColumns,
  project,
  filters,
}) => {
  const [columns, setColumns] = useState(initial);
  const [ordered, setOrdered] = useState(Object.keys(initial));
  const [issueStatus, setIssueStatus] = useState(project.config.issueStatus)
  const initialFilteredColumns = Object.keys(columns).reduce((acc, curr) => {
    acc[curr] = [];
    return acc;
  }, {});
  const [filteredColumns, setFilteredColumns] = useState(initialFilteredColumns);
  const editItemMutation = useUpdateItem();
  const updateSpace = useUpdateWorkspace();
  const [sprints, setSprints] = useState(null);
  const [sprint, setSprint] = useState(null);

  const { data } = useGetSprints(project.spaceId, project.org);

  useEffect(() => {
    setSprints(data)
  }, [data])

  useEffect(() => {
    //with sprint id in filter set the sprint data
    if (filters.sprint && sprints) {
      setSprint(sprints.find(sprint => sprint.id === Number(filters.sprint)))
    }
    if (filters.sprint == '') {
      setSprint(null)
    }
  }, [filters.sprint, sprints])



  useEffect(() => {
    let newFilteredColumns = {};
    for (let column in columns) {
      newFilteredColumns[column] = filterIssues(columns[column], filters);
    }
    setFilteredColumns(newFilteredColumns);
  }, [columns, filters]);

  useEffect(() => {
    setColumns(initial);
    setOrdered(Object.keys(initial))
  }, [initial]);

  const activeJoy = (movedCardId) => {
    if (movedCardId) {
      const cardElement = document.getElementById(movedCardId);
      if (cardElement) {
        // Play sound
        const audio = new Audio(clickSound);
        audio.play();

        // Update progress bar to 100%
        const progressBar = cardElement.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.transition = 'width 0.5s ease-in-out';
          progressBar.style.width = '100%';
        }
      }
    }
  };



  const onDragEnd = (result) => {
    if (result.combine) {
      if (result.type === "COLUMN") {
        const shallow = [...ordered];
        shallow.splice(result.source.index, 1);
        setOrdered(shallow);
        return;
      }

      const column = columns[result.source.droppableId];
      const withQuoteRemoved = [...column];

      withQuoteRemoved.splice(result.source.index, 1);

      const orderedColumns = {
        ...columns,
        [result.source.droppableId]: withQuoteRemoved
      };
      setColumns(orderedColumns);
      return;
    }

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering column
    if (result.type === "COLUMN") {
      const reorderedorder = reorder(ordered, source.index, destination.index);

      setOrdered(reorderedorder);

      const reorderedIssueStatus = reorder(issueStatus, source.index, destination.index);

      setIssueStatus(reorderedIssueStatus); // Update the local state if needed

      // Update the Firestore
      const newConfig = { ...project.config, issueStatus: reorderedIssueStatus };
      editSpace({ config: newConfig }, project.spaceId, project.org);

      return;
    }


    const current = [...columns[source.droppableId]];
    const target = current[source.index];
    const issueId = Number(result.draggableId);
    
    // Get the doneColumn ID with null checks
    const doneColumnId = project.config?.workspaceConfig?.board?.doneColumn;
    
    const updatedFields = {
      status: findIdByName(destination.droppableId, issueStatus),
      listPosition: calculateIssueListPosition(project.issues, destination, source, issueId, issueStatus),
      ...(doneColumnId && findIdByName(destination.droppableId, issueStatus) === doneColumnId && 
          { progress: 100, end: new Date().getTime() }),
    }
    const mutateItem = editItemMutation({
      orgId: project.org,
      field: updatedFields,
      itemId: target.id,
      workspaceId: project.spaceId,
    });

    const data = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination
    });
    setColumns(data.quoteMap);

    // Validate if status is equal to doneColumn in config with null check
    if (doneColumnId && updatedFields.status === doneColumnId) {
      activeJoy(target.id);
    }

  };

  const handleAddColumn = () => {
    // Define a new column name 
    const newColumnName = `Column ${ordered.length + 1}`;

    // Find the maximum ID in issueStatus
    const maxId = Math.max(...issueStatus.map(status => parseInt(status.id, 10)));

    // Generate a new ID by adding one to the maximum ID
    const newColumnId = `${maxId + 1}`;

    // Update the ordered state to include the new column
    setOrdered(prevOrdered => [...prevOrdered, newColumnName]);

    // Update the columns state to have an empty array for the new column 
    setColumns(prevColumns => ({ ...prevColumns, [newColumnName]: [] }));

    // Update the issueStatus to include the new column's name and ID
    setIssueStatus(prevIssueStatus => [...prevIssueStatus, { id: newColumnId, name: newColumnName }]);
    // Update the store with the new issueStatus
    const newConfig = { ...project.config, issueStatus: [...issueStatus, { id: newColumnId, name: newColumnName }] };
    updateSpace({
      values: { config: newConfig },
      workspaceId: project.spaceId,
      orgId: project.org
    });
  };

  const handleDeleteColumn = (columnName) => {
    // Check if the column has no issues
    if (columns[columnName].length > 0) {
      alert('You cannot delete a column that has issues in it.');
      return;
    }

    // Remove the column from the columns state
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      delete newColumns[columnName];
      return newColumns;
    });

    // Remove the column's name from the ordered state
    setOrdered(prevOrdered => prevOrdered.filter(name => name !== columnName));

    // Remove the column's corresponding entry in the issueStatus
    setIssueStatus(prevIssueStatus => {
      const newIssueStatus = prevIssueStatus.filter(status => status.name !== columnName);

      // Update the Firestore with the new issueStatus
      const newConfig = { ...project.config, issueStatus: newIssueStatus };
      editSpace({ config: newConfig }, project.spaceId, project.org);

      return newIssueStatus;
    });

  };

  return (
    <>
      {sprint ? <SprintToolBar sprint={sprint} /> : null}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board"
          type="COLUMN"
          direction="horizontal"
          ignoreContainerClipping={Boolean(containerHeight)}
          isCombineEnabled={isCombineEnabled}
        >
          {(provided) => (
            <div className="kanban-container scrollbar"
              style={sprint ? { border: '15px solid #003049' } : null}
            >
              <Container ref={provided.innerRef} {...provided.droppableProps} className="" >
                {ordered.map((key, index) => (
                  index !== 0 && (
                    <Column
                      key={key}
                      index={index}
                      title={key}
                      items={filteredColumns[key] ? filteredColumns[key] : []}
                      isScrollable={withScrollableColumns}
                      isCombineEnabled={isCombineEnabled}
                      useClone={useClone}
                      project={project}
                      onDelete={() => handleDeleteColumn(key)}
                      isCollapsed={false}
                      className="bg-secondary"
                      sprint={sprint}
                    />
                  )
                ))} {provided.placeholder}
                <div className="kanban-column scrollbar position-relative bg-transparent d-flex flex-column h-100 flex-center bg-body-hover">
                  <button className="btn stretched-link btn-icon btn-icon bg-body-secondary rounded-circle mb-1" onClick={handleAddColumn}>
                    <i className="bi bi-plus fs-3x"></i><i className="bi bi-kanban-fill fs-3x"></i>
                  </button>
                </div>


              </Container>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

Board.defaultProps = {
  isCombineEnabled: false
};

Board.propTypes = {
  isCombineEnabled: PropTypes.bool
};

export default Board;
