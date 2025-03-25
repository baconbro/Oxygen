import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useGetAssignedTasks } from "../../../services/dashboardServices";
import GenericList from "../../../components/common/List/GenericList";
import { createColumnHelper } from "@tanstack/react-table";
import { 
  TruncatedCellRenderer, 
  StatusCellRenderer, 
  DateCellRenderer, 
  PriorityCellRenderer 
} from "../../../components/common/List/CellRenderers";
import { IssueStatusCopy, IssuePriorityCopy } from "../../../constants/issues";

export const MyWork = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg || currentUser?.orgs[0];
  
  const { data: assignedTasks, isLoading } = useGetAssignedTasks(userId, orgId);
  
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('title', {
      header: () => 'Task',
      cell: value => <TruncatedCellRenderer value={value.getValue()} />,
      width: 300,
    }),
    columnHelper.accessor('projectDetails.name', {
      id: 'project',
      header: () => 'Project',
      cell: info => (
        <span 
          className="text-primary fw-semibold cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/workspace/${info.row.original.projectId}`);
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => <StatusCellRenderer value={info.getValue()} statusMapping={IssueStatusCopy} />,
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityCellRenderer value={info.getValue()} priorityMapping={IssuePriorityCopy} />,
    }),
    columnHelper.accessor('dueDate', {
      header: 'Due date',
      cell: info => {
        const dueDate = info.getValue();
        if (!dueDate) return '';
        
        const isOverdue = new Date(dueDate) < new Date();
        return (
          <span className={isOverdue ? 'text-danger' : ''}>
            <DateCellRenderer value={dueDate} />
          </span>
        );
      },
    }),
  ];
  
  const handleRowClick = (row) => {
    navigate(`/workspace/${row.original.projectId}/issues/${row.original.id}`);
  };
  
  const EmptyAssignedTasks = () => (
    <div className="text-center py-10">
      <h3 className="fs-2 fw-bold mb-2">No tasks assigned to you</h3>
      <p className="text-gray-600 fs-6">
        When you're assigned tasks, they'll appear here.
      </p>
    </div>
  );
  
  return (
    <div className="card mb-5">
      <div className="card-header pt-7">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">My Work</span>
          <span className="text-gray-400 mt-1 fw-semibold fs-6">Tasks assigned to you</span>
        </h3>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="d-flex justify-content-center py-10">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <GenericList
            data={assignedTasks || []}
            columns={columns}
            onRowClick={handleRowClick}
            emptyComponent={EmptyAssignedTasks}
          />
        )}
      </div>
    </div>
  );
};
