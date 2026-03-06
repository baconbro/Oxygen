import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useWorkspace } from "../../../contexts/WorkspaceProvider";
import { useGetActivityFeed } from "../../../services/dashboardServices";

/**
 * ActivityFeed Widget
 * Shows recent team activity relevant to the user
 */
export const ActivityFeed = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { orgUsers = [] } = useWorkspace();

  const userId = currentUser?.all?.uid;
  const orgId = currentUser?.all?.currentOrg;

  const { data: activities = [], isLoading } = useGetActivityFeed(orgId, userId);

  const getUserName = (activityUserId) => {
    if (!activityUserId) return "Someone";
    if (activityUserId === userId) return "You";
    const user = orgUsers.find((u) => u.id === activityUserId || u.uid === activityUserId);
    return user?.fName || user?.displayName || "A teammate";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "item_created":
        return { icon: "bi-plus-circle-fill", color: "success" };
      case "item_completed":
        return { icon: "bi-check-circle-fill", color: "success" };
      case "item_updated":
        return { icon: "bi-pencil-fill", color: "primary" };
      case "item_assigned":
        return { icon: "bi-person-plus-fill", color: "info" };
      case "comment_added":
        return { icon: "bi-chat-fill", color: "warning" };
      default:
        return { icon: "bi-activity", color: "secondary" };
    }
  };

  const getActivityText = (activity) => {
    const userName = getUserName(activity.userId);
    switch (activity.type) {
      case "item_created":
        return (
          <>
            <strong>{userName}</strong> created
          </>
        );
      case "item_completed":
        return (
          <>
            <strong>{userName}</strong> completed
          </>
        );
      case "item_updated":
        return (
          <>
            <strong>{userName}</strong> updated
          </>
        );
      case "item_assigned":
        return (
          <>
            <strong>{userName}</strong> assigned you to
          </>
        );
      case "comment_added":
        return (
          <>
            <strong>{userName}</strong> commented on
          </>
        );
      default:
        return (
          <>
            <strong>{userName}</strong> modified
          </>
        );
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.projectId && activity.itemId) {
      navigate(`/workspace/${activity.projectId}/board/issues/${activity.itemId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Activity</span>
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

  if (!activities || activities.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Activity</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-activity text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No recent activity</p>
            <p className="text-muted fs-7">Team updates will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5 pb-3">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Activity</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Recent team updates</span>
        </h3>
      </div>

      <div className="card-body pt-0">
        <div className="timeline-label">
          {activities.slice(0, 8).map((activity, index) => {
            const { icon, color } = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id || index}
                className="timeline-item d-flex align-items-start mb-4 cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="timeline-badge me-3">
                  <span className={`symbol symbol-30px symbol-circle bg-light-${color}`}>
                    <span className="symbol-label">
                      <i className={`bi ${icon} text-${color} fs-6`}></i>
                    </span>
                  </span>
                </div>
                <div className="timeline-content flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="overflow-hidden">
                      <span className="text-gray-700 fs-7">{getActivityText(activity)}</span>
                      <span
                        className="text-primary fw-semibold fs-7 text-truncate d-block"
                        title={activity.itemTitle}
                      >
                        {activity.itemTitle}
                      </span>
                    </div>
                    <span className="text-muted fs-8 ms-2 flex-shrink-0">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activities.length > 8 && (
          <div className="text-center mt-2">
            <span className="text-muted fs-7">+{activities.length - 8} more activities</span>
          </div>
        )}
      </div>
    </div>
  );
};
