
import { Avatar } from '../../../components/common';
import { KanbanBoardItem, KanbanBoardTask } from './dummyData';
import { Card, Dropdown } from 'react-bootstrap';
import { Fragment, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Assignees, AssigneeAvatar } from '../Board/Lists/List/Issue/Styles';
import { IconComponent } from '../../../components/common/IssueIconComponent';
import { IssuePriorityIcon } from '../../../components/common/';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
const actions = [
    {
        id: 1,
        label: 'Move',
        isNested: true
    },
    {
        id: 2,
        label: 'Duplicate'
    },
    {
        id: 3,
        label: 'Jump to top'
    },
    {
        id: 4,
        label: 'Jump to bottom'
    },
    {
        id: 5,
        hr: true
    },
    {
        id: 6,
        label: 'Print/Download'
    },
    {
        id: 7,
        label: 'Share',
        isNested: true
    },
    {
        id: 8,
        hr: true
    },
    {
        id: 9,
        label: 'Move to archive',
        isNested: true
    },
    {
        id: 10,
        label: 'Delete',
        class: 'text-danger'
    }
];
const anonymousUser = {
    avatarUrl: "",
    email: "anonymous@oxgneap.com",
    id: 69420,
    name: "Anonymous",
    role: "member"
}

const KanbanListItemCard = ({
    task,
    list,
    className
}: {
    task: KanbanBoardTask;
    list: KanbanBoardItem;
    className?: string;
}) => {
    const [assig, setAssig] = useState([]);
    const assignees = Array.from(assig, v => v === undefined ? anonymousUser : v);
    const { workspaceConfig } = useWorkspace();
    return (
        <Link to={`issues/${task.id}`} className="kanban-item" key={task.id}>
            <div className={classNames(className, 'sortable-item hover-actions-trigger card')} style={{ width: '100%', boxShadow: " 0px 1px 2px 0px rgba(9, 30, 66, 0.25)" }}>
                <div className="progress h-6px " style={{ backgroundColor: 'initial' }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: task.progress + '%', borderTopLeftRadius: '20px' }}></div>
                </div>
                <div className="card-body" style={{ padding: "1rem 1rem" }}>
                    {task.coverImage && (
                        <div
                            className="position-relative mb-2 overflow-hidden rounded w-100"
                            style={{ height: 200 }}
                        >
                            <div
                                className="bg-holder banner-bg"
                                style={{
                                    backgroundImage: `url(${task.coverImage})`,
                                    backgroundPosition: 'bottom left'
                                }}
                            />
                        </div>
                    )}
                    <div className="mb-2">
                        <span className="fs-4  mb-1 text-gray-900">{task.title}</span>
                    </div>
                    <div className="d-flex mb-3">
                        {task.tags && <i className="bi bi-tags me-2"></i>}
                        {task.tags && task.tags.map(tag => (
                            <div className="badge badge-light me-2" key={Object.values(tag).toString()}>{Object.values(tag).toString()}</div>
                        ))}

                    </div>
                    <div className="d-flex mb-3">
                        {task.dueDate && <div className="badge badge-light me-2"> <i className="bi bi-calendar-event me-2"></i> {typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate.toDateString()}</div>}
                    </div>
                    <div className="d-flex mb-3">
                        {task.tsize && <div className="badge badge-light me-2"><i className="bi bi-rulers me-2"></i>{task.tsize}</div>}
                        {task.storypoint && <div className="badge badge-light me-2"><i className="bi bi-ticket-fill me-2"></i>{task.storypoint}</div>}
                        {task.listPosition}
                    </div>
                    <div className="d-flex flex-stack flex-wrapr">
                        <Assignees>
                            {assignees.map(user => (

                                <AssigneeAvatar
                                    key={user.id}
                                    size={25}
                                    avatarUrl={user.avatarUrl}
                                    name={user.name}
                                />

                            ))}
                        </Assignees>

                        <div className="d-flex my-1">
                            <span className='text-gray-600 fw-bold me-2'>#{task.id}</span>
                            <IconComponent typeId={task.type} projectConfig={workspaceConfig    } />
                            <IssuePriorityIcon priority={task.priority} top={-1} left={4} />
                        </div>

                    </div>

                </div>

            </div>
        </Link>
    );
};

export default KanbanListItemCard;
