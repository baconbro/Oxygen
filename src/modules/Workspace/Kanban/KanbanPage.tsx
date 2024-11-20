import KanbanProvider, { useKanbanContext } from './KanbanProvider';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import KanbanDroppable from './KanbanDroppable';
import KanbanList from './KanbanList';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';


interface KanbanPageProps {
  project: any; // Replace 'any' with the appropriate type
  fetchProject: () => void;
  updateLocalProjectIssues: () => void;
  refreshData: () => void;
}

const KanbanPage: React.FC<KanbanPageProps> = ({ project, fetchProject, updateLocalProjectIssues, refreshData }) => {
  //          setContentClass('kanban-content');
  return (
    <KanbanProvider>
      <KanbanContent />
    </KanbanProvider>
  );
};

const KanbanContent = () => {
  const { boardLists, kanbanDispatch } = useKanbanContext();
  const { project } = useWorkspace();
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (destination) {
      kanbanDispatch({
        type: 'MOVE_ITEMS',
        payload: { source, destination }
      });
    }
  };

  const transformIssuesToLists = (issues: any[]) => {
    const groupedIssues = issues.reduce((acc, issue) => {
      if (!acc[issue.status]) {
        acc[issue.status] = [];
      }
      acc[issue.status].push(issue);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(groupedIssues).map(status => ({
      id: status,
      title: getStatusTitle(status, project.config.issueStatus),
      borderColor: getStatusBorderColor(status),
      isCollapsed: false,
      tasks: groupedIssues[status].map((issue: any) => ({
        id: issue.id.toString(),
        status: {
          label: getStatusLabel(issue.type),
          icon: getStatusIcon(issue.type),
          color: getStatusColor(issue.type)
        },
        title: issue.title,
        priority: getPriorityLabel(issue.priority),
        listPosition: issue.listPosition,
        type: issue.type,
        dueDate: issue.dueDate,
        storypoint: issue.storypoint,
        tsize: issue.tsize,
        tags: issue.tags,
        coverImage: issue.coverImage,
        
      }))
      .sort((a: { listPosition: number }, b: { listPosition: number }) => a.listPosition - b.listPosition) // Sort tasks by listPosition
    }));
  };

  const getStatusTitle = (status: string, issueStatus: any[]) => {
    const statusObj = issueStatus.find(s => s.id === status);
    return statusObj ? statusObj.name : 'Unknown';
  };

  const getStatusBorderColor = (status: string) => {
    // Implement this function to return the border color based on the status
    return '#e5780b';
  };

  const getStatusLabel = (type: string) => {
    // Implement this function to return the label based on the type
    return 'Issue';
  };

  const getStatusIcon = (type: string) => {
    // Implement this function to return the icon based on the type
    return 'faTriangleExclamation';
  };

  const getStatusColor = (type: string) => {
    // Implement this function to return the color based on the type
    return 'warning';
  };

  const getPriorityLabel = (priority: string) => {
    // Implement this function to return the priority label
    return priority || 'Low';
  };

  const lists = transformIssuesToLists(project.issues);

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container scrollbar">
            {lists.map(list => (
            <KanbanDroppable key={list.id} droppableId={list.id}>
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <KanbanList list={list} key={list.id} />
                  {provided.placeholder}
                </div>
              )}
            </KanbanDroppable>
          ))}

          <div className="kanban-column scrollbar position-relative bg-transparent d-flex flex-column h-100 flex-center bg-body-hover">
            <a className="btn stretched-link btn-icon btn-icon bg-body-secondary rounded-circle mb-1">
              <i className="bi bi-plus fs-5"></i>
            </a>
            <h5 className="text-body-secondary">Add another list</h5>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;
