import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../../modules/auth";
import { useGetDashboardConfig, useSaveDashboardConfig } from "../../../services/dashboardServices";

// Widget definitions
const WIDGETS = [
  { id: "focusToday", name: "Focus Today", description: "Overdue and upcoming items", icon: "bi-bullseye" },
  { id: "sprintProgress", name: "Sprint Progress", description: "Current sprint status", icon: "bi-speedometer2" },
  { id: "goalsProgress", name: "Goals & OKRs", description: "Strategic objectives progress", icon: "bi-trophy" },
  { id: "blockedItems", name: "Blocked Items", description: "Items that need attention", icon: "bi-x-octagon" },
  { id: "activityFeed", name: "Activity Feed", description: "Recent team activity", icon: "bi-activity" },
  { id: "waitingForReview", name: "Waiting for Review", description: "Items pending review", icon: "bi-hourglass" },
  { id: "recentlyViewed", name: "Recently Viewed", description: "Quick access to recent items", icon: "bi-clock-history" },
  { id: "favorites", name: "Favorites", description: "Your starred items", icon: "bi-star" },
  { id: "workload", name: "Workload", description: "Your capacity indicator", icon: "bi-speedometer" },
  { id: "myWork", name: "My Work", description: "All your assigned tasks", icon: "bi-list-task" },
  { id: "lastWeek", name: "Last Week Stats", description: "Weekly activity metrics", icon: "bi-bar-chart" },
];

/**
 * DashboardCustomizer Component
 * Allows users to show/hide dashboard widgets
 */
export const DashboardCustomizer = ({ onConfigChange }) => {
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  const userId = currentUser?.all?.uid;

  const { data: config } = useGetDashboardConfig(userId);
  const saveMutation = useSaveDashboardConfig();

  const [localConfig, setLocalConfig] = useState(null);

  const handleOpen = () => {
    setLocalConfig(config || { hiddenWidgets: [], compactMode: false });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setLocalConfig(null);
  };

  const handleToggleWidget = (widgetId) => {
    if (!localConfig) return;

    const hiddenWidgets = localConfig.hiddenWidgets || [];
    const newHiddenWidgets = hiddenWidgets.includes(widgetId)
      ? hiddenWidgets.filter((id) => id !== widgetId)
      : [...hiddenWidgets, widgetId];

    setLocalConfig({ ...localConfig, hiddenWidgets: newHiddenWidgets });
  };

  const handleToggleCompact = () => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, compactMode: !localConfig.compactMode });
  };

  const handleSave = async () => {
    if (!localConfig) return;

    try {
      await saveMutation.mutateAsync({ userId, config: localConfig });
      if (onConfigChange) {
        onConfigChange(localConfig);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleReset = () => {
    setLocalConfig({ hiddenWidgets: [], compactMode: false });
  };

  const isWidgetVisible = (widgetId) => {
    if (!localConfig) return true;
    return !localConfig.hiddenWidgets?.includes(widgetId);
  };

  return (
    <>
      {/* Customize Button */}
      <button
        className="btn btn-sm btn-light-primary"
        onClick={handleOpen}
        title="Customize Dashboard"
      >
        <i className="bi bi-gear me-2"></i>
        Customize
      </button>

      {/* Customization Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Customize Dashboard</Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          <p className="text-muted mb-4">
            Toggle widgets to show or hide them on your dashboard.
          </p>

          {/* Compact Mode Toggle */}
          <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-4">
            <div>
              <span className="fw-semibold">Compact Mode</span>
              <p className="text-muted fs-7 mb-0">Show smaller widget cards</p>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={localConfig?.compactMode || false}
                onChange={handleToggleCompact}
              />
            </div>
          </div>

          {/* Widget Toggles */}
          <div className="row g-3">
            {WIDGETS.map((widget) => {
              const isVisible = isWidgetVisible(widget.id);
              return (
                <div key={widget.id} className="col-md-6">
                  <div
                    className={`d-flex align-items-center p-3 rounded cursor-pointer border ${
                      isVisible ? "border-primary bg-light-primary" : "border-secondary bg-light"
                    }`}
                    onClick={() => handleToggleWidget(widget.id)}
                    style={{ transition: "all 0.15s ease" }}
                  >
                    <div
                      className={`symbol symbol-40px me-3 ${
                        isVisible ? "" : "opacity-50"
                      }`}
                    >
                      <span
                        className={`symbol-label ${
                          isVisible ? "bg-primary" : "bg-secondary"
                        }`}
                      >
                        <i className={`bi ${widget.icon} text-white fs-5`}></i>
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <span
                        className={`fw-semibold d-block ${
                          isVisible ? "text-primary" : "text-muted"
                        }`}
                      >
                        {widget.name}
                      </span>
                      <span className="text-muted fs-7">{widget.description}</span>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={isVisible}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <button className="btn btn-light" onClick={handleReset}>
            Reset to Default
          </button>
          <button className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Save Changes
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardCustomizer;
