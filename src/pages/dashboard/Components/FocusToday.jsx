import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { IssuePriorityCopy } from "../../../constants/issues";

/**
 * FocusToday Widget
 * Shows items requiring immediate attention: overdue, due today, and due this week
 */
export const FocusToday = ({ tasks = [], isLoading = false }) => {
  const navigate = useNavigate();

  const categorizedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { overdue: [], dueToday: [], dueThisWeek: [] };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const overdue = [];
    const dueToday = [];
    const dueThisWeek = [];

    tasks.forEach(task => {
      // Skip completed tasks
      if (task.status === 'done' || task.status === 'closed') return;

      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDateNormalized < today) {
        overdue.push(task);
      } else if (dueDateNormalized.getTime() === today.getTime()) {
        dueToday.push(task);
      } else if (dueDateNormalized < nextWeek) {
        dueThisWeek.push(task);
      }
    });

    // Sort each category by priority (highest first)
    const priorityOrder = { highest: 0, high: 1, medium: 2, low: 3, lowest: 4 };
    const sortByPriority = (a, b) => (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5);

    return {
      overdue: overdue.sort(sortByPriority),
      dueToday: dueToday.sort(sortByPriority),
      dueThisWeek: dueThisWeek.sort(sortByPriority),
    };
  }, [tasks]);

  const totalFocusItems = categorizedTasks.overdue.length +
                          categorizedTasks.dueToday.length +
                          categorizedTasks.dueThisWeek.length;

  const handleTaskClick = (task) => {
    navigate(`/workspace/${task.projectId}/board/issues/${task.id}`);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      highest: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
      lowest: 'light'
    };
    return colors[priority] || 'secondary';
  };

  const TaskRow = ({ task, isOverdue = false }) => (
    <div
      className={`d-flex align-items-center justify-content-between py-2 px-3 rounded mb-2 cursor-pointer ${
        isOverdue ? 'bg-light-danger' : 'bg-hover-light'
      }`}
      onClick={() => handleTaskClick(task)}
      style={{ transition: 'background-color 0.15s ease' }}
    >
      <div className="d-flex align-items-center flex-grow-1 me-3">
        <div className="d-flex flex-column">
          <span className={`fw-semibold ${isOverdue ? 'text-danger' : 'text-gray-800'}`}>
            {task.title}
          </span>
          <span className="text-muted fs-7">
            {task.projectDetails?.name || 'Unknown Project'}
          </span>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className={`badge badge-light-${getPriorityBadge(task.priority)}`}>
          {IssuePriorityCopy[task.priority] || task.priority}
        </span>
        <span className={`fs-7 ${isOverdue ? 'text-danger fw-bold' : 'text-muted'}`}>
          {formatDueDate(task.dueDate, isOverdue)}
        </span>
      </div>
    </div>
  );

  const formatDueDate = (dateStr, isOverdue) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (isOverdue) {
      const daysOverdue = Math.abs(diffDays);
      return daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="card mb-5">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Focus Today</span>
          </h3>
        </div>
        <div className="card-body pt-0">
          <div className="d-flex justify-content-center py-10">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-5">
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Focus Today</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            {totalFocusItems} items requiring attention
          </span>
        </h3>
      </div>

      {/* Summary badges */}
      <div className="card-body pt-0 pb-3">
        <div className="d-flex gap-3 flex-wrap">
          {categorizedTasks.overdue.length > 0 && (
            <div className="d-flex align-items-center bg-light-danger rounded px-3 py-2">
              <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
              <span className="fw-bold text-danger">{categorizedTasks.overdue.length}</span>
              <span className="text-danger ms-1">Overdue</span>
            </div>
          )}
          {categorizedTasks.dueToday.length > 0 && (
            <div className="d-flex align-items-center bg-light-warning rounded px-3 py-2">
              <i className="bi bi-clock-fill text-warning me-2"></i>
              <span className="fw-bold text-warning">{categorizedTasks.dueToday.length}</span>
              <span className="text-warning ms-1">Due Today</span>
            </div>
          )}
          {categorizedTasks.dueThisWeek.length > 0 && (
            <div className="d-flex align-items-center bg-light-success rounded px-3 py-2">
              <i className="bi bi-calendar-check text-success me-2"></i>
              <span className="fw-bold text-success">{categorizedTasks.dueThisWeek.length}</span>
              <span className="text-success ms-1">This Week</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-body pt-0">
        {totalFocusItems === 0 ? (
          <div className="text-center py-8">
            <i className="bi bi-check-circle-fill text-success fs-2x mb-3 d-block"></i>
            <h4 className="fw-bold text-gray-800">You're all caught up!</h4>
            <p className="text-muted">No urgent items requiring your attention.</p>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {categorizedTasks.overdue.length > 0 && (
              <div className="mb-5">
                <h6 className="text-danger fw-bold mb-3 text-uppercase fs-7">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Overdue
                </h6>
                {categorizedTasks.overdue.slice(0, 5).map(task => (
                  <TaskRow key={task.id} task={task} isOverdue={true} />
                ))}
                {categorizedTasks.overdue.length > 5 && (
                  <div className="text-center mt-2">
                    <span className="text-muted fs-7">
                      +{categorizedTasks.overdue.length - 5} more overdue items
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Due Today Section */}
            {categorizedTasks.dueToday.length > 0 && (
              <div className="mb-5">
                <h6 className="text-warning fw-bold mb-3 text-uppercase fs-7">
                  <i className="bi bi-clock-fill me-2"></i>
                  Due Today
                </h6>
                {categorizedTasks.dueToday.slice(0, 5).map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {categorizedTasks.dueToday.length > 5 && (
                  <div className="text-center mt-2">
                    <span className="text-muted fs-7">
                      +{categorizedTasks.dueToday.length - 5} more items due today
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Due This Week Section */}
            {categorizedTasks.dueThisWeek.length > 0 && (
              <div>
                <h6 className="text-success fw-bold mb-3 text-uppercase fs-7">
                  <i className="bi bi-calendar-check me-2"></i>
                  Due This Week
                </h6>
                {categorizedTasks.dueThisWeek.slice(0, 5).map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {categorizedTasks.dueThisWeek.length > 5 && (
                  <div className="text-center mt-2">
                    <span className="text-muted fs-7">
                      +{categorizedTasks.dueThisWeek.length - 5} more items this week
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
