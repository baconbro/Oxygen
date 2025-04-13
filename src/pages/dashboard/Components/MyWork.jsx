import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { TaskCalendarView } from "./TaskCalendarView";

export const MyWork = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg || (currentUser?.orgs && currentUser?.orgs[0]);
  
  const { data: assignedTasks, isLoading } = useGetAssignedTasks(
    userId || "", 
    orgId || "", 
    { enabled: !!userId && !!orgId }
  );
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    dueDate: 'all',
    project: 'all',
    priority: 'all',
    status: 'all'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Extract unique projects, priorities, and statuses for filter options
  const [filterOptions, setFilterOptions] = useState({
    projects: [],
    priorities: [],
    statuses: []
  });
  
  // Add status mapping and colors state
  const [statusMapping, setStatusMapping] = useState({});
  const [statusColors, setStatusColors] = useState({});
  
  useEffect(() => {
    if (assignedTasks && assignedTasks.length > 0) {
      // Extract unique filter options
      const projects = [...new Set(assignedTasks.map(task => task.projectDetails.name))];
      const priorities = [...new Set(assignedTasks.map(task => task.priority))];
      const statuses = [...new Set(assignedTasks.map(task => task.status))];
      
      setFilterOptions({
        projects,
        priorities,
        statuses
      });
      
      // Create status mapping and colors from task data
      const newStatusMapping = {};
      const newStatusColors = {};
      
      assignedTasks.forEach(task => {
        if (task.status && task.projectDetails?.statusConfig) {
          const statusConfig = task.projectDetails.statusConfig.find(s => s.id === task.status);
          if (statusConfig) {
            newStatusMapping[task.status] = statusConfig.name;
            newStatusColors[task.status] = statusConfig.borderColor || '#FF5733';
          }
        }
      });
      
      setStatusMapping(newStatusMapping);
      setStatusColors(newStatusColors);
      
      // Apply filters
      applyFilters(assignedTasks);
    } else {
      setFilteredTasks([]);
    }
  }, [assignedTasks, filters]);
  
  const applyFilters = (tasks) => {
    if (!tasks) return [];
    
    let result = [...tasks];
    
    // Filter by due date
    if (filters.dueDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      switch (filters.dueDate) {
        case 'today':
          result = result.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          });
          break;
        case 'thisWeek':
          result = result.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate < nextWeek;
          });
          break;
        case 'overdue':
          result = result.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
          });
          break;
        default:
          break;
      }
    }
    
    // Filter by project
    if (filters.project !== 'all') {
      result = result.filter(task => task.projectDetails.name === filters.project);
    }
    
    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    setFilteredTasks(result);
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      dueDate: 'all',
      project: 'all',
      priority: 'all',
      status: 'all'
    });
  };
  
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
      cell: info => 
      <StatusCellRenderer 
                value={info.renderValue()} 
                statusMapping={{...IssueStatusCopy, ...statusMapping}} 
                statusColors={statusColors}
              />,
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
        return <DateCellRenderer value={dueDate} />;
      },
    }),
  ];
  
  const handleRowClick = (row) => {
    navigate(`/workspace/${row.original.projectId}/board/issues/${row.original.id}`);
  };
  
  const handleTaskClick = (taskId, projectId) => {
    navigate(`/workspace/${projectId}/board/issues/${taskId}`);
  };
  
  const EmptyAssignedTasks = () => (
    <div className="text-center py-10">
      <h3 className="fs-2 fw-bold mb-2">No tasks assigned to you</h3>
      <p className="text-gray-600 fs-6">
        {Object.values(filters).some(value => value !== 'all') 
          ? "Try adjusting your filters to see more tasks."
          : "When you're assigned tasks, they'll appear here."}
      </p>
    </div>
  );
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
  };
  
  return (
    <div className="card mb-5">
      <div className="card-header pt-7">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">My Work</span>
            <span className="text-gray-400 mt-1 fw-semibold fs-6">Tasks assigned to you</span>
          </h3>
          
          <div className="d-flex align-items-center my-1">
            <div className="btn-group me-3" role="group">
              <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list-ul me-1"></i>List
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('calendar')}
              >
                <i className="bi bi-calendar3 me-1"></i>Calendar
              </button>
            </div>
            
            {Object.values(filters).some(value => value !== 'all') && (
              <button 
                className="btn btn-sm btn-light"
                onClick={clearAllFilters}
              >
                <i className="bi bi-x"></i> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-header border-top pt-5 pb-5">
        <div className="d-flex flex-wrap gap-2">
          {/* Due Date Filter */}
          <div className="w-200px">
            <select 
              className="form-select form-select-sm"
              value={filters.dueDate}
              onChange={(e) => handleFilterChange('dueDate', e.target.value)}
            >
              <option value="all">All Due Dates</option>
              <option value="today">Due Today</option>
              <option value="thisWeek">Due This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          {/* Project Filter */}
          <div className="w-200px">
            <select 
              className="form-select form-select-sm"
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
            >
              <option value="all">All Projects</option>
              {filterOptions.projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          
          {/* Priority Filter */}
          <div className="w-200px">
            <select 
              className="form-select form-select-sm"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priorities</option>
              {filterOptions.priorities.map(priority => (
                <option key={priority} value={priority}>{IssuePriorityCopy[priority]}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="w-200px">
            <select 
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>{IssueStatusCopy[status]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {isLoading ? (
          <div className="d-flex justify-content-center py-10">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <GenericList
            data={filteredTasks || []}
            columns={columns}
            onRowClick={handleRowClick}
            emptyComponent={EmptyAssignedTasks}
          />
        ) : (
          <TaskCalendarView 
            tasks={filteredTasks} 
            onTaskClick={handleTaskClick}
            emptyComponent={EmptyAssignedTasks}
          />
        )}
      </div>
    </div>
  );
};
