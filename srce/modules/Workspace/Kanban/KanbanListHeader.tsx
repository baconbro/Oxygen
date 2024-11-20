import React, {
    CSSProperties,
    Dispatch,
    Fragment,
    SetStateAction
  } from 'react';

  import { Button } from '../../../components/common';
  import { KanbanBoardItem } from './dummyData';
  import { Dropdown } from 'react-bootstrap';
  
  interface KanbanListHeaderProps {
    list: KanbanBoardItem;
    collapsed: boolean;
    setCollapsed: Dispatch<SetStateAction<boolean>>;
  }
  
  const kanbanHeaderActions = [
    {
      id: 1,
      label: 'Sort tasks',
      isNested: true
    },
    {
      id: 2,
      label: 'Sort all tasks'
    },
    {
      id: 3,
      label: 'Move all tasks',
      isNested: true
    },
    {
      id: 4,
      label: 'Remove all tasks'
    },
    {
      id: 5,
      hr: true
    },
    {
      id: 6,
      label: 'Import'
    },
    {
      id: 7,
      label: 'Export',
      isNested: true
    },
    {
      id: 8,
      hr: true
    },
    {
      id: 9,
      label: 'Move column',
      isNested: true
    },
    {
      id: 10,
      label: 'Duplicate column'
    },
    {
      id: 11,
      label: 'Delete column'
    },
    {
      id: 12,
      label: 'Archive column'
    },
    {
      id: 13,
      hr: true
    },
    {
      id: 14,
      label: 'Edit title & description'
    },
    {
      id: 15,
      label: 'Edit colour',
      isNested: true
    }
  ];
  
  const KanbanListHeader = ({
    list,
    collapsed,
    setCollapsed
  }: KanbanListHeaderProps) => {
    return (
      <div className="kanban-column-header px-4 hover-actions-trigger">
        <div
          className={`d-flex align-items-center border-bottom border-3 py-3`}
          style={
            {
              '--phoenix-border-color': list.borderColor
            } as CSSProperties
          }
        >
          <h5 className="mb-0 kanban-column-title">
            {list.title}
            <span className="kanban-title-badge">{list.tasks.length}</span>
          </h5>
          <Dropdown autoClose="outside">
            <Dropdown.Toggle
              variant=""
              size="sm"
              className="hover-actions dropdown-caret-none kanban-header-dropdown-btn"
            >
                <i className="bi bi-three-dots"></i>
            </Dropdown.Toggle>
  
            <Dropdown.Menu
              className="py-2 border-translucent"
              style={{ width: '15rem' }}
            >
              {kanbanHeaderActions.map(action => (
                <Fragment key={action.id}>
                  {action.hr ? (
                    <hr className="my-2" />
                  ) : (
                    <Dropdown.Item
                      href="#!"
                      key={action.label}
                      className="d-flex flex-between-center"
                    >
                      {action.label}
                      {action.isNested && (
                        <i className="bi bi-chevron-right ms-2 fs-6 text-body-secondary"></i>
                      )}
                    </Dropdown.Item>
                  )}
                </Fragment>
              ))}
            </Dropdown.Menu>
          </Dropdown>
  
          <a
            className="btn ms-auto kanban-collapse-icon p-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
                <i className="bi bi-arrow-bar-right"></i>
            ) : (
                <i className="bi bi-arrow-bar-left"></i>
            )}
          </a>
        </div>
      </div>
    );
  };
  
  export default KanbanListHeader;
  