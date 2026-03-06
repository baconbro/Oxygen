import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useGetBlockedItems } from "../../../services/dashboardServices";
import { IssuePriorityCopy } from "../../../constants/issues";

/**
 * BlockedItems Widget
 * Shows items that are blocked and can't progress
 */
export const BlockedItems = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg;

  const { data: blockedItems = [], isLoading } = useGetBlockedItems(orgId, userId);

  const handleItemClick = (item) => {
    navigate(`/workspace/${item.projectId}/board/issues/${item.id}`);
  };

  const getBlockReasonBadge = (item) => {
    if (item.blockReason === "dependency") {
      return (
        <span className="badge badge-light-warning fs-8">
          <i className="bi bi-link-45deg me-1"></i>
          Dependency
        </span>
      );
    }
    return (
      <span className="badge badge-light-danger fs-8">
        <i className="bi bi-x-octagon me-1"></i>
        Blocked
      </span>
    );
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

  const formatBlockedDuration = (item) => {
    // Calculate how long the item has been blocked
    const updatedAt = item.updatedAt || item.createdAt;
    if (!updatedAt) return "";

    const now = Date.now();
    const diff = now - updatedAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Since today";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Blocked Items</span>
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

  if (!blockedItems || blockedItems.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Blocked Items</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-check-circle text-success fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No blocked items</p>
            <p className="text-muted fs-7">All your work is progressing smoothly</p>
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
            Blocked Items
            <span className="badge badge-circle badge-danger ms-2">{blockedItems.length}</span>
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">Items that need attention</span>
        </h3>
      </div>

      <div className="card-body pt-0">
        {blockedItems.slice(0, 5).map((item, index) => (
          <div
            key={item.id || index}
            className="d-flex align-items-start py-3 border-bottom cursor-pointer bg-hover-light-danger rounded px-2 mx-n2"
            onClick={() => handleItemClick(item)}
            style={{ transition: "background-color 0.15s ease" }}
          >
            <div className="symbol symbol-35px me-3 mt-1">
              <span className="symbol-label bg-light-danger">
                <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
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
                {getBlockReasonBadge(item)}
                {formatBlockedDuration(item) && (
                  <span className="text-danger fs-8 fw-semibold">
                    <i className="bi bi-clock me-1"></i>
                    {formatBlockedDuration(item)}
                  </span>
                )}
              </div>
              {item.blockedBy && item.blockedBy.length > 0 && (
                <div className="mt-2">
                  <span className="text-muted fs-8">
                    <i className="bi bi-link-45deg me-1"></i>
                    Waiting on {item.blockedBy.length} item(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {blockedItems.length > 5 && (
          <div className="text-center mt-3">
            <span className="text-muted fs-7">+{blockedItems.length - 5} more blocked items</span>
          </div>
        )}
      </div>
    </div>
  );
};
