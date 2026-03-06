import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { useGetFavorites, useRemoveFavorite } from "../../../services/dashboardServices";

/**
 * Favorites Widget
 * Shows user's starred/favorited items for quick access
 */
export const Favorites = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;

  const { data: favorites = [], isLoading } = useGetFavorites(userId);
  const removeFavoriteMutation = useRemoveFavorite();

  const handleItemClick = (favorite) => {
    if (favorite.type === "project") {
      navigate(`/workspace/${favorite.itemId}`);
    } else if (favorite.type === "goal") {
      navigate(`/goals/details/${favorite.itemId}`);
    } else {
      navigate(`/workspace/${favorite.projectId}/board/issues/${favorite.itemId}`);
    }
  };

  const handleRemove = (e, favorite) => {
    e.stopPropagation();
    removeFavoriteMutation.mutate({ userId, itemId: favorite.itemId });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "project":
        return { icon: "bi-folder", color: "info" };
      case "goal":
        return { icon: "bi-trophy", color: "warning" };
      case "bug":
        return { icon: "bi-bug", color: "danger" };
      case "story":
        return { icon: "bi-book", color: "success" };
      default:
        return { icon: "bi-star-fill", color: "primary" };
    }
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Favorites</span>
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

  if (!favorites || favorites.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Favorites</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-star text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-0">No favorites yet</p>
            <p className="text-muted fs-7">Star items to access them quickly</p>
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
            <i className="bi bi-star-fill text-warning me-2"></i>
            Favorites
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">Quick access to starred items</span>
        </h3>
      </div>

      <div className="card-body pt-0">
        {favorites.slice(0, 8).map((favorite, index) => {
          const { icon, color } = getTypeIcon(favorite.type);
          return (
            <div
              key={favorite.id || index}
              className="d-flex align-items-center py-2 px-2 rounded cursor-pointer bg-hover-light group"
              onClick={() => handleItemClick(favorite)}
              style={{ transition: "background-color 0.15s ease" }}
            >
              <div className="symbol symbol-30px me-3">
                <span className={`symbol-label bg-light-${color}`}>
                  <i className={`bi ${icon} text-${color} fs-5`}></i>
                </span>
              </div>
              <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                <span className="text-gray-800 fw-semibold text-truncate" title={favorite.title}>
                  {favorite.title}
                </span>
                {favorite.projectName && (
                  <span className="text-muted fs-7 text-truncate">{favorite.projectName}</span>
                )}
              </div>
              <button
                className="btn btn-sm btn-icon btn-light-danger opacity-0 opacity-hover-100"
                onClick={(e) => handleRemove(e, favorite)}
                title="Remove from favorites"
                style={{ transition: "opacity 0.15s ease" }}
              >
                <i className="bi bi-x fs-5"></i>
              </button>
            </div>
          );
        })}

        {favorites.length > 8 && (
          <div className="text-center mt-3">
            <span className="text-muted fs-7">+{favorites.length - 8} more favorites</span>
          </div>
        )}
      </div>
    </div>
  );
};
