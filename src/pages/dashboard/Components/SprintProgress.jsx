import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

/**
 * SprintProgress Widget
 * Shows current sprint status at a glance with progress bar
 */
export const SprintProgress = ({ tasks = [], sprints = [], workspaceId = null, isLoading = false }) => {
  const navigate = useNavigate();

  // Find the active sprint
  const activeSprint = useMemo(() => {
    if (!sprints || sprints.length === 0) return null;

    const now = new Date();

    // Find sprint that is currently active (started and not ended)
    const active = sprints.find(sprint => {
      if (!sprint.startDate || !sprint.endDate) return false;
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      return now >= start && now <= end;
    });

    return active || sprints.find(s => s.status === 'active') || null;
  }, [sprints]);

  // Calculate sprint statistics
  const sprintStats = useMemo(() => {
    if (!activeSprint || !tasks) {
      return { total: 0, done: 0, inProgress: 0, toDo: 0, blocked: 0, percentComplete: 0 };
    }

    // Filter tasks that belong to the active sprint
    const sprintTasks = tasks.filter(task => task.sprintId === activeSprint.id);

    const done = sprintTasks.filter(t => t.status === 'done' || t.status === 'closed').length;
    const inProgress = sprintTasks.filter(t =>
      t.status === 'inprogress' || t.status === 'in_progress' || t.status === 'inProgress'
    ).length;
    const blocked = sprintTasks.filter(t => t.status === 'blocked').length;
    const toDo = sprintTasks.length - done - inProgress - blocked;

    const percentComplete = sprintTasks.length > 0
      ? Math.round((done / sprintTasks.length) * 100)
      : 0;

    return {
      total: sprintTasks.length,
      done,
      inProgress,
      toDo: Math.max(0, toDo),
      blocked,
      percentComplete
    };
  }, [activeSprint, tasks]);

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    if (!activeSprint?.endDate) return null;
    const end = new Date(activeSprint.endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [activeSprint]);

  const handleSprintClick = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/sprints`);
    }
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Sprint Progress</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSprint) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Sprint Progress</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-calendar-x text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No active sprint</p>
          </div>
        </div>
      </div>
    );
  }

  const getProgressColor = () => {
    if (sprintStats.percentComplete >= 80) return 'success';
    if (sprintStats.percentComplete >= 50) return 'primary';
    if (sprintStats.percentComplete >= 25) return 'warning';
    return 'danger';
  };

  const getDaysRemainingColor = () => {
    if (daysRemaining === null) return 'muted';
    if (daysRemaining <= 0) return 'danger';
    if (daysRemaining <= 2) return 'warning';
    return 'muted';
  };

  return (
    <div className="card h-100 cursor-pointer" onClick={handleSprintClick}>
      <div className="card-header border-0 pt-5 pb-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Sprint Progress</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            {activeSprint.name || 'Current Sprint'}
          </span>
        </h3>
        {daysRemaining !== null && (
          <div className="card-toolbar">
            <span className={`badge badge-light-${getDaysRemainingColor()}`}>
              {daysRemaining <= 0
                ? 'Sprint ended'
                : daysRemaining === 1
                  ? '1 day left'
                  : `${daysRemaining} days left`}
            </span>
          </div>
        )}
      </div>

      <div className="card-body pt-4">
        {/* Progress Bar */}
        <div className="mb-5">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted fs-7">Progress</span>
            <span className={`fw-bold text-${getProgressColor()}`}>
              {sprintStats.percentComplete}%
            </span>
          </div>
          <div className="progress h-8px">
            <div
              className={`progress-bar bg-${getProgressColor()}`}
              role="progressbar"
              style={{ width: `${sprintStats.percentComplete}%` }}
              aria-valuenow={sprintStats.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-3">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="bullet bullet-vertical h-30px bg-success me-3"></span>
              <div>
                <span className="text-gray-800 fw-bold fs-5 d-block">{sprintStats.done}</span>
                <span className="text-muted fs-7">Done</span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="bullet bullet-vertical h-30px bg-primary me-3"></span>
              <div>
                <span className="text-gray-800 fw-bold fs-5 d-block">{sprintStats.inProgress}</span>
                <span className="text-muted fs-7">In Progress</span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="bullet bullet-vertical h-30px bg-secondary me-3"></span>
              <div>
                <span className="text-gray-800 fw-bold fs-5 d-block">{sprintStats.toDo}</span>
                <span className="text-muted fs-7">To Do</span>
              </div>
            </div>
          </div>
          {sprintStats.blocked > 0 && (
            <div className="col-6">
              <div className="d-flex align-items-center">
                <span className="bullet bullet-vertical h-30px bg-danger me-3"></span>
                <div>
                  <span className="text-gray-800 fw-bold fs-5 d-block">{sprintStats.blocked}</span>
                  <span className="text-muted fs-7">Blocked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
