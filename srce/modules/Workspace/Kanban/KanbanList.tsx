import classNames from 'classnames';
import { KanbanBoardItem } from './dummyData';
import { useState } from 'react';
import KanbanListItemCard from './KanbanListItemCard';
import KanbanListHeader from './KanbanListHeader';
import { Draggable } from 'react-beautiful-dnd';
import AddItem from '../Board/Lists/List/AddItem';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useAuth } from '../../auth';

interface KanbanListProps {
    list: KanbanBoardItem;
}

const KanbanList = ({ list }: KanbanListProps) => {
    const [collapsed, setCollapsed] = useState(!!list.isCollapsed);
    const findIdByName = (name: string, statusArray: { name: string; id: string }[]) => {
        const status = statusArray.find((status) => status.name === name);
        return status ? status.id : null; // Return the ID if found, otherwise return null
    };
    const firstIssue = () => {
        const listPositions = list.tasks.map(({ listPosition }) => listPosition);

        if (listPositions.length > 0) {
            return Math.min(...listPositions.filter((pos): pos is number => pos !== undefined)) - 1;
          }
          return 1;
        };
    const { project } = useWorkspace();
    const { currentUser } = useAuth();

    return (
        <div
            className={classNames('kanban-column scrollbar', {
                collapsed
            })}
        >
            <KanbanListHeader
                list={list}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />
            <div className="kanban-items-container">
                {list.tasks.map((task, index) => (
                    <div className="py-2 px-2 border-bottom border-translucent" key={task.id}>
                        <Draggable
                            key={`${list.id}-${task.id}`}
                            draggableId={`${list.id}-${task.id}`}
                            index={index}
                        >
                            {(provided, snapshot) => (
                                <>
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <KanbanListItemCard
                                            list={list}
                                            task={task}
                                            className={classNames({
                                                'bg-body-emphasis': snapshot.isDragging
                                            })}
                                        />
                                    </div>
                                </>
                            )}
                        </Draggable>
                    </div>
                ))}
            </div>
            <div className="py-3 px-4 kanban-add-task">
                <a className="btn bg-body-tertiary me-2 px-0">

                </a>
                {currentUser && (
                    <AddItem status={findIdByName(list.title, project.config.issueStatus)} currentUserId={currentUser.all.uid} spaceId={project.spaceId} lastIssue={firstIssue()} />
                )}
            </div>
        </div>
    );
};

export default KanbanList;
