import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useGetWaitingForReview } from "../../../services/dashboardServices";
import { IssuePriorityCopy } from "../../../constants/issues";

/**
 * WaitingForReview Widget
 * Shows items in review status that need attention from others
 */
export const WaitingForReview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg;

  const { data: reviewItems = [], isLoading } = useGetWaitingForReview(orgId, userId);

  const handleItemClick = (item) => {
    navigate(`/workspace/${item.projectId}/board/issues/${item.id}`);
  };

  const getDaysColor = (days) => {
    if (days >= 5) return "danger";
    if (days >= 3) return "warning";
    return "muted";
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      highest: "danger",
      high: "warning",
      medium: "info",
      low: "secondary",
      lowest: "light",
    };
    return colors[priority] || "secondary";
  };

  const formatDays = (days) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Waiting for Review</span>
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

  if (!reviewItems || reviewItems.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Waiting for Review</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-hourglass text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No items in review</p>
            <p className="text-muted fs-7">Items awaiting review will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5 pb-3">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">
            Waiting for Review
            <span className="badge badge-circle badge-warning ms-2">{reviewItems.length}</span>
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">Items pending others' review</span>
        </h3>
      </div>

      <div className="card-body pt-0">
        {reviewItems.slice(0, 5).map((item, index) => (
          <div
            key={item.id || index}
            className="d-flex align-items-start py-3 border-bottom cursor-pointer bg-hover-light rounded px-2 mx-n2"
            onClick={() => handleItemClick(item)}
            style={{ transition: "background-color 0.15s ease" }}
          >
            <div className="symbol symbol-35px me-3 mt-1">
              <span className="symbol-label bg-light-warning">
                <i className="bi bi-hourglass-split text-warning fs-5"></i>
              </span>
            </div>
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span
                  className="text-gray-800 fw-semibold text-truncate me-2"
                  title={item.title}
                >
                  {item.title}
                </span>
                <span className={`badge badge-light-${getPriorityBadge(item.priority)} fs-8`}>
                  {IssuePriorityCopy[item.priority] || item.priority}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted fs-8">{item.projectName}</span>
                <span className="badge badge-light-primary fs-8">
                  <i className="bi bi-eye me-1"></i>
                  In Review
                </span>
                <span className={`text-${getDaysColor(item.daysInReview)} fs-8 fw-semibold`}>
                  <i className="bi bi-clock me-1"></i>
                  {formatDays(item.daysInReview)}
                </span>
              </div>
              {item.isReporter && !item.isAssigned && (
                <span className="text-muted fs-8 mt-1">
                  <i className="bi bi-person me-1"></i>
                  You reported this
                </span>
              )}
            </div>
          </div>
        ))}

        {reviewItems.length > 5 && (
          <div className="text-center mt-3">
            <span className="text-muted fs-7">+{reviewItems.length - 5} more items in review</span>
          </div>
        )}
      </div>
    </div>
  );
};
