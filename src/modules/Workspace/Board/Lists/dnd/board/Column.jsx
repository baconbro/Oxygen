import { useState, useRef, useEffect } from "react";
import styled from 'styled-components';
import { Draggable } from "react-beautiful-dnd";
import ItemList from "./list";
import AddItem from "../../List/AddItem";
import { useAuth } from "../../../../../auth";
import { editSpace } from "../../../../../../services/firestore";
import classNames from 'classnames';
import { useWorkspace } from "../../../../../../contexts/WorkspaceProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  // Add null checks to safely access borderColor
  const defaultBorderColor = "#FF5733";
  const [borderColor, setBorderColor] = useState(
    workspaceConfig?.issueStatus?.[index]?.borderColor ||
    (project?.config?.issueStatus?.[index]?.borderColor) ||
    defaultBorderColor
  );

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
        status.id === findIdByName(title, project.config.issueStatus)
          ? { ...status, name: currentTitle, borderColor: borderColor }
          : status
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
                style={{ "--bs-border-color": borderColor }} // Use the state variable
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

                <Dialog open={showModal} onOpenChange={(open) => !open && handleCloseModal()}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            onBlur={() => {
                              setIsEditing(false);
                            }}
                            autoFocus
                            className="bg-transparent border-none outline-none focus:ring-0 px-0 w-full text-xl"
                          />
                        ) : (
                          <span onClick={() => setIsEditing(true)} className="cursor-pointer flex items-center gap-2 text-xl">
                            {currentTitle} <i className="bi bi-pencil fs-6"></i>
                          </span>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="mb-3">
                        <label htmlFor="borderColorPicker" className="form-label">Column Border Color</label>
                        <div className="d-flex align-items-center mb-2">
                          <input
                            type="color"
                            className="form-control form-control-color me-2"
                            id="borderColorPicker"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            title="Choose border color"
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            placeholder="Color hex code"
                          />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          {['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'].map((color) => (
                            <div
                              key={color}
                              onClick={() => setBorderColor(color)}
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: color,
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: borderColor === color ? '2px solid #000' : '1px solid #ddd'
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <button className="btn btn-danger" onClick={props.onDelete}>
                        Delete status
                      </button>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button className="btn btn-secondary" onClick={handleCloseModal}>
                        Close
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          // Save both title and color changes when clicking Save
                          const reorderedIssueStatus = project.config.issueStatus.map((status) =>
                            status.id === findIdByName(title, project.config.issueStatus)
                              ? { ...status, name: currentTitle, borderColor: borderColor }
                              : status
                          );
                          const newConfig = { ...project.config, issueStatus: reorderedIssueStatus };
                          editSpace({ config: newConfig }, project.spaceId, project.org);
                          handleCloseModal();
                        }}
                      >
                        Save changes
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
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
