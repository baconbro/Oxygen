import { useState, useRef, useEffect } from "react";
import styled from 'styled-components';
import { Draggable } from "react-beautiful-dnd";
import ItemList from "./list";
import AddItem from "../../List/AddItem";
import { useAuth } from "../../../../../auth";
import { editSpace } from "../../../../../../services/firestore";
import classNames from 'classnames';
import { useWorkspace } from "../../../../../../contexts/WorkspaceProvider";
import { Modal, Button } from 'react-bootstrap';
import { findIdByName } from "../../../../../../utils/calculateIssueListPosition";
import { Header } from "../styles/title";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 2%;
`;



const Column = (props) => {
  const title = props.title;
  const items = props.items;
  const index = props.index;
  const project = props.project
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const inputRef = useRef(null);
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(!!props.isCollapsed);
  const { workspaceConfig } = useWorkspace();
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const firstIssue = (allListIssues) => {
    const listPositions = allListIssues.map(({ listPosition }) => listPosition);

    if (listPositions.length > 0) {
      return Math.min(...listPositions) - 1;
    }
    return 1000;
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsEditing(false);
      // Save the changes
      // Find and update the status object with the matching ID
      const reorderedIssueStatus = project.config.issueStatus.map((status) =>
        status.id === findIdByName(title, project.config.issueStatus) ? { ...status, name: currentTitle } : status
      );

      // Update the config object with the new issueStatus array
      const newConfig = { ...project.config, issueStatus: reorderedIssueStatus };
      // Update the Firestore
      editSpace({ config: newConfig }, project.spaceId, project.org);
    }
  };


  useEffect(() => {
    // Add an event listener to detect clicks outside the input
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentTitle]);

  return (
    <div
      className={classNames('kanban-column scrollbar', {
        collapsed
      })}
    >

      <Draggable draggableId={title} index={index} >
        {(provided, snapshot) => (
          <Container ref={provided.innerRef} {...provided.draggableProps} className="d-flex flex-row-auto ">
            <div className="kanban-column-header px-4 hover-actions-trigger">
              <div
                className={`d-flex align-items-center border-bottom border-3 py-3 mb-3`}
                style={{ "--bs-border-color": "#FF5733" }} // Apply dynamic border color
              >
                <Header isDragging={snapshot.isDragging} className="mb-0 kanban-column-title">
                  <div {...provided.dragHandleProps}>
                    <>
                      <span>
                        {currentTitle}
                        <span className="kanban-title-badge badge badge-circle badge-secondary">
                          {workspaceConfig?.workspaceConfig?.board?.columnHeaderBadge === 'storypoint' ? (
                            <>
                              {items.reduce((sum, item) => sum + (item.storypoint || 0), 0)}
                            </>
                          ) : (
                            <>
                              {formatIssuesCount(items)}
                            </>
                          )}
                        </span>
                      </span>
                    </>
                  </div>
                </Header>
                {collapsed ? (
                  <></>
                ) : (
                  <button className="hover-actions  btn btn-sm" onClick={handleShowModal}>
                    <i className="bi bi-three-dots"></i>
                  </button>
                )}

                <Modal show={showModal} onHide={handleCloseModal} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          onBlur={() => {
                            // Handle saving the new title here
                            setIsEditing(false);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => setIsEditing(true)}>
                          {currentTitle}  <i className="bi bi-pencil"></i>
                        </span>
                      )}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <button className="flex-stack px-3 btn btn-danger" onClick={props.onDelete}>
                      Delete status
                    </button>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseModal}>
                      Save changes
                    </Button>
                  </Modal.Footer>
                </Modal>
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
            <div className="kanban-items-container">
              {!props.sprint && (
                <AddItem status={findIdByName(title, project.config.issueStatus)} currentUserId={currentUser.all.uid} spaceId={project.spaceId} lastIssue={firstIssue(items)} />
              )}
              <ItemList
                listId={title}
                listType="Item"
                style={{
                  backgroundColor: snapshot.isDragging ? '#AAAA' : null
                }}
                items={items}
                internalScroll={props.isScrollable}
                isCombineEnabled={Boolean(props.isCombineEnabled)}
                useClone={Boolean(props.useClone)}
              />
            </div>
          </Container>
        )}
      </Draggable>
    </div>
  );
};

const formatIssuesCount = (allListIssues) => {
  return allListIssues.length;
};

export default Column;
