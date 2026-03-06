import { useAuth } from "../../../modules/auth";
import { useGetWorkload } from "../../../services/dashboardServices";

/**
 * WorkloadIndicator Widget
 * Shows user's current workload and capacity
 */
export const WorkloadIndicator = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg;

  const { data: workload, isLoading } = useGetWorkload(orgId, userId);

  const getStatusColor = (status) => {
    switch (status) {
      case "overloaded":
        return "danger";
      case "high":
        return "warning";
      case "moderate":
        return "primary";
      case "light":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "overloaded":
        return "Overloaded";
      case "high":
        return "High Load";
      case "moderate":
        return "Moderate";
      case "light":
        return "Light";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "overloaded":
        return "bi-exclamation-triangle-fill";
      case "high":
        return "bi-speedometer";
      case "moderate":
        return "bi-speedometer2";
      case "light":
        return "bi-check-circle";
      default:
        return "bi-question-circle";
    }
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Workload</span>
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

  if (!workload) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Workload</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-speedometer text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No workload data</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(workload.status);
  const statusText = getStatusText(workload.status);
  const statusIcon = getStatusIcon(workload.status);

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5 pb-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Workload</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Your current capacity</span>
        </h3>
        <div className="card-toolbar">
          <span className={`badge badge-light-${statusColor}`}>
            <i className={`bi ${statusIcon} me-1`}></i>
            {statusText}
          </span>
        </div>
      </div>

      <div className="card-body pt-4">
        {/* Main Progress Circle */}
        <div className="d-flex justify-content-center mb-5">
          <div className="position-relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#f1f1f4"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={`var(--bs-${statusColor})`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(workload.workloadPercent / 100) * 327} 327`}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <div
              className="position-absolute top-50 start-50 translate-middle text-center"
              style={{ width: "80px" }}
            >
              <span className={`fs-2x fw-bolder text-${statusColor}`}>
                {workload.workloadPercent}%
              </span>
              <span className="text-muted fs-8 d-block">Capacity</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-3">
          <div className="col-6">
            <div className="bg-light-primary rounded p-3 text-center">
              <span className="text-primary fw-bold fs-4 d-block">{workload.activeItems}</span>
              <span className="text-muted fs-7">Active</span>
            </div>
          </div>
          <div className="col-6">
            <div className="bg-light-info rounded p-3 text-center">
              <span className="text-info fw-bold fs-4 d-block">{workload.inProgress}</span>
              <span className="text-muted fs-7">In Progress</span>
            </div>
          </div>
          <div className="col-6">
            <div className="bg-light-warning rounded p-3 text-center">
              <span className="text-warning fw-bold fs-4 d-block">{workload.highPriority}</span>
              <span className="text-muted fs-7">High Priority</span>
            </div>
          </div>
          <div className="col-6">
            <div className={`bg-light-${workload.overdue > 0 ? 'danger' : 'success'} rounded p-3 text-center`}>
              <span className={`text-${workload.overdue > 0 ? 'danger' : 'success'} fw-bold fs-4 d-block`}>
                {workload.overdue}
              </span>
              <span className="text-muted fs-7">Overdue</span>
            </div>
          </div>
        </div>

        {/* Story Points (if available) */}
        {workload.storyPoints > 0 && (
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fs-7">Story Points</span>
              <span className="fw-bold">{workload.storyPoints} pts</span>
            </div>
            {workload.storyPointPercent && (
              <div className="progress h-6px">
                <div
                  className={`progress-bar bg-${statusColor}`}
                  role="progressbar"
                  style={{ width: `${workload.storyPointPercent}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
