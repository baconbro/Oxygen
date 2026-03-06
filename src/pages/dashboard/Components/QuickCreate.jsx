import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../../modules/auth";
import { useAddItem } from "../../../services/itemServices";
import { useGetSpaces } from "../../../services/workspaceServices";

// Generate unique ID following codebase convention
const generateId = () => Math.floor(Math.random() * 1000000000000) + 1;

/**
 * QuickCreate Component
 * Floating action button + modal for quickly creating tasks from anywhere
 */
export const QuickCreate = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;
  const userId = currentUser?.all?.uid;

  const { data: spaces = [], isLoading: spacesLoading } = useGetSpaces(orgId);
  const addItemMutation = useAddItem();

  // Set default project when spaces load
  useEffect(() => {
    if (spaces.length > 0 && !selectedProject) {
      setSelectedProject(spaces[0].id);
    }
  }, [spaces, selectedProject]);

  // Listen for openQuickCreate event from Command Palette
  useEffect(() => {
    const handleOpenQuickCreate = () => {
      setShowModal(true);
    };

    window.addEventListener("openQuickCreate", handleOpenQuickCreate);
    return () => window.removeEventListener("openQuickCreate", handleOpenQuickCreate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !selectedProject) return;

    setIsSubmitting(true);

    try {
      const newItem = {
        id: generateId(),
        title: title.trim(),
        description: description.trim() || "",
        priority,
        status: "backlog",
        type: "task",
        projectId: selectedProject,
        userIds: [userId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reporterId: userId,
      };

      await addItemMutation.mutateAsync({
        orgId,
        item: newItem,
        userId,
      });

      // Reset form and close modal
      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="btn btn-primary btn-icon rounded-circle position-fixed shadow-lg"
        style={{
          width: "56px",
          height: "56px",
          bottom: "24px",
          right: "24px",
          zIndex: 1050,
        }}
        onClick={() => setShowModal(true)}
        title="Quick Create (Ctrl+K)"
      >
        <i className="bi bi-plus-lg fs-2"></i>
      </button>

      {/* Quick Create Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">Quick Create Task</Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-3">
            {/* Title Input */}
            <div className="mb-4">
              <input
                type="text"
                className="form-control form-control-lg border-0 bg-light px-0 fs-3 fw-semibold"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                style={{ boxShadow: "none" }}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <textarea
                className="form-control border-0 bg-light"
                placeholder="Add a description (optional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {/* Project & Priority Row */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted fs-7 fw-semibold">
                  Project
                </label>
                <select
                  className="form-select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={spacesLoading}
                >
                  {spacesLoading ? (
                    <option>Loading projects...</option>
                  ) : (
                    spaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.title || space.name || "Untitled Project"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted fs-7 fw-semibold">
                  Priority
                </label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="mt-4 pt-3 border-top">
              <span className="text-muted fs-7">
                <kbd className="bg-light text-muted border px-2">Ctrl</kbd> +{" "}
                <kbd className="bg-light text-muted border px-2">K</kbd> to
                open from anywhere
              </span>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <button
              type="button"
              className="btn btn-light"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !selectedProject || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg me-2"></i>
                  Create Task
                </>
              )}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
