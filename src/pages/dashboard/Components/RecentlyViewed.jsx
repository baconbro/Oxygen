import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useGetRecentlyViewed } from "../../../services/dashboardServices";

/**
 * RecentlyViewed Widget
 * Shows items the user has recently accessed for quick navigation
 */
export const RecentlyViewed = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;

  const { data: recentItems = [], isLoading } = useGetRecentlyViewed(userId);

  const handleItemClick = (item) => {
    navigate(`/workspace/${item.projectId}/board/issues/${item.itemId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return 'bi-bug text-danger';
      case 'story':
        return 'bi-book text-success';
      case 'epic':
        return 'bi-lightning text-primary';
      case 'subtask':
        return 'bi-diagram-3 text-info';
      default:
        return 'bi-check2-square text-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Recently Viewed</span>
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

  if (!recentItems || recentItems.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Recently Viewed</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-clock-history text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No recently viewed items</p>
            <p className="text-muted fs-7">Items you view will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5 pb-3">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Recently Viewed</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            Quick access to your recent work
          </span>
        </h3>
      </div>

      <div className="card-body pt-0">
        <div className="d-flex flex-column">
          {recentItems.slice(0, 8).map((item, index) => (
            <div
              key={item.id || index}
              className="d-flex align-items-center py-2 px-2 rounded cursor-pointer bg-hover-light"
              onClick={() => handleItemClick(item)}
              style={{ transition: 'background-color 0.15s ease' }}
            >
              <div className="symbol symbol-35px me-3">
                <span className="symbol-label bg-light">
                  <i className={`bi ${getTypeIcon(item.type)} fs-5`}></i>
                </span>
              </div>
              <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                <span className="text-gray-800 fw-semibold text-truncate" title={item.title}>
                  {item.title}
                </span>
                <span className="text-muted fs-7 text-truncate">
                  {item.projectName || 'Project'}
                </span>
              </div>
              <span className="text-muted fs-8 ms-2 flex-shrink-0">
                {formatTime(item.viewedAt)}
              </span>
            </div>
          ))}
        </div>

        {recentItems.length > 8 && (
          <div className="text-center mt-3">
            <span className="text-muted fs-7">
              +{recentItems.length - 8} more items
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
