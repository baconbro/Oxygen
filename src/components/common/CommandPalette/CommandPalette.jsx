import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth";
import { globalSearch } from "../../../services/dashboardServices";

/**
 * CommandPalette Component
 * Linear-style command palette for quick search and navigation
 * Opens with Ctrl/Cmd + K
 */
export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ items: [], projects: [], goals: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;

  // Quick actions available in command palette
  const quickActions = [
    { id: "create-task", label: "Create new task", icon: "bi-plus-circle", shortcut: "C", action: "create" },
    { id: "go-dashboard", label: "Go to Dashboard", icon: "bi-house", action: () => navigate("/dashboard") },
    { id: "go-goals", label: "Go to Goals", icon: "bi-trophy", action: () => navigate("/goals") },
    { id: "go-workspace", label: "Go to Workspaces", icon: "bi-folder", action: () => navigate("/workspace") },
  ];

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ items: [], projects: [], goals: [] });
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await globalSearch(orgId, query);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, orgId]);

  // Get all results as flat array for keyboard navigation
  const getAllResults = useCallback(() => {
    const all = [];

    if (!query) {
      // Show quick actions when no query
      quickActions.forEach((action) => all.push({ ...action, resultType: "action" }));
    } else {
      results.projects.forEach((p) => all.push({ ...p, resultType: "project" }));
      results.items.forEach((i) => all.push({ ...i, resultType: "item" }));
      results.goals.forEach((g) => all.push({ ...g, resultType: "goal" }));
    }

    return all;
  }, [query, results, quickActions]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleNavigation = (e) => {
      const allResults = getAllResults();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) handleSelect(selected);
      }
    };

    document.addEventListener("keydown", handleNavigation);
    return () => document.removeEventListener("keydown", handleNavigation);
  }, [isOpen, selectedIndex, getAllResults]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults({ items: [], projects: [], goals: [] });
    setSelectedIndex(0);
  };

  const handleSelect = (result) => {
    if (result.resultType === "action") {
      if (typeof result.action === "function") {
        result.action();
      } else if (result.action === "create") {
        // Trigger quick create (dispatch event that QuickCreate listens to)
        window.dispatchEvent(new CustomEvent("openQuickCreate"));
      }
    } else if (result.resultType === "project") {
      navigate(`/workspace/${result.id}`);
    } else if (result.resultType === "item") {
      navigate(`/workspace/${result.projectId}/board/issues/${result.id}`);
    } else if (result.resultType === "goal") {
      navigate(`/goals/details/${result.id}`);
    }
    handleClose();
  };

  const getResultIcon = (result) => {
    if (result.icon) return result.icon;
    if (result.resultType === "project") return "bi-folder";
    if (result.resultType === "goal") return "bi-trophy";
    if (result.type === "bug") return "bi-bug";
    if (result.type === "story") return "bi-book";
    return "bi-check2-square";
  };

  const getResultColor = (result) => {
    if (result.resultType === "action") return "primary";
    if (result.resultType === "project") return "info";
    if (result.resultType === "goal") return "warning";
    if (result.type === "bug") return "danger";
    return "secondary";
  };

  const allResults = getAllResults();

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      centered
      size="lg"
      dialogClassName="command-palette-modal"
      contentClassName="border-0 shadow-lg"
    >
      <div className="command-palette">
        {/* Search Input */}
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <i className="bi bi-search text-muted fs-4 me-3"></i>
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-lg border-0 shadow-none ps-0"
              placeholder="Search items, projects, goals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ fontSize: "1.1rem" }}
            />
            {isSearching && (
              <div className="spinner-border spinner-border-sm text-muted" role="status">
                <span className="visually-hidden">Searching...</span>
              </div>
            )}
            <kbd className="bg-light text-muted border px-2 ms-2">esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="command-palette-results"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {allResults.length === 0 && query.length >= 2 && !isSearching && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search fs-2 mb-2 d-block"></i>
              <p>No results found for "{query}"</p>
            </div>
          )}

          {/* Quick Actions (when no query) */}
          {!query && (
            <div className="p-2">
              <div className="text-muted text-uppercase fs-8 fw-bold px-3 py-2">
                Quick Actions
              </div>
              {quickActions.map((action, index) => (
                <div
                  key={action.id}
                  data-index={index}
                  className={`d-flex align-items-center px-3 py-2 rounded cursor-pointer ${
                    selectedIndex === index ? "bg-light-primary" : "bg-hover-light"
                  }`}
                  onClick={() => handleSelect({ ...action, resultType: "action" })}
                >
                  <span className={`symbol symbol-30px me-3`}>
                    <span className="symbol-label bg-light-primary">
                      <i className={`bi ${action.icon} text-primary fs-5`}></i>
                    </span>
                  </span>
                  <span className="fw-semibold text-gray-800">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="bg-light text-muted border px-2 ms-auto">{action.shortcut}</kbd>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div className="p-2">
              <div className="text-muted text-uppercase fs-8 fw-bold px-3 py-2">Projects</div>
              {results.projects.map((project, index) => {
                const globalIndex = index;
                return (
                  <div
                    key={project.id}
                    data-index={globalIndex}
                    className={`d-flex align-items-center px-3 py-2 rounded cursor-pointer ${
                      selectedIndex === globalIndex ? "bg-light-primary" : "bg-hover-light"
                    }`}
                    onClick={() => handleSelect({ ...project, resultType: "project" })}
                  >
                    <span className="symbol symbol-30px me-3">
                      <span className="symbol-label bg-light-info">
                        <i className="bi bi-folder text-info fs-5"></i>
                      </span>
                    </span>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold text-gray-800">{project.title}</span>
                      {project.acronym && (
                        <span className="text-muted fs-7">{project.acronym}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          {results.items.length > 0 && (
            <div className="p-2">
              <div className="text-muted text-uppercase fs-8 fw-bold px-3 py-2">Items</div>
              {results.items.map((item, index) => {
                const globalIndex = results.projects.length + index;
                return (
                  <div
                    key={item.id}
                    data-index={globalIndex}
                    className={`d-flex align-items-center px-3 py-2 rounded cursor-pointer ${
                      selectedIndex === globalIndex ? "bg-light-primary" : "bg-hover-light"
                    }`}
                    onClick={() => handleSelect({ ...item, resultType: "item" })}
                  >
                    <span className="symbol symbol-30px me-3">
                      <span className={`symbol-label bg-light-${getResultColor(item)}`}>
                        <i className={`bi ${getResultIcon(item)} text-${getResultColor(item)} fs-5`}></i>
                      </span>
                    </span>
                    <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                      <span className="fw-semibold text-gray-800 text-truncate">{item.title}</span>
                      <span className="text-muted fs-7">#{item.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Goals */}
          {results.goals.length > 0 && (
            <div className="p-2">
              <div className="text-muted text-uppercase fs-8 fw-bold px-3 py-2">Goals</div>
              {results.goals.map((goal, index) => {
                const globalIndex = results.projects.length + results.items.length + index;
                return (
                  <div
                    key={goal.id}
                    data-index={globalIndex}
                    className={`d-flex align-items-center px-3 py-2 rounded cursor-pointer ${
                      selectedIndex === globalIndex ? "bg-light-primary" : "bg-hover-light"
                    }`}
                    onClick={() => handleSelect({ ...goal, resultType: "goal" })}
                  >
                    <span className="symbol symbol-30px me-3">
                      <span className="symbol-label bg-light-warning">
                        <i className="bi bi-trophy text-warning fs-5"></i>
                      </span>
                    </span>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold text-gray-800">{goal.title || goal.name}</span>
                      {goal.progress !== undefined && (
                        <span className="text-muted fs-7">{goal.progress}% complete</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-top bg-light">
          <div className="d-flex justify-content-center gap-4 text-muted fs-8">
            <span>
              <kbd className="bg-white border px-1 me-1">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-white border px-1 me-1">↵</kbd> Select
            </span>
            <span>
              <kbd className="bg-white border px-1 me-1">esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CommandPalette;
