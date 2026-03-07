import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-background border-none shadow-lg">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Search for items, projects, goals and more.</DialogDescription>
        <div className="command-palette">
          {/* Search Input */}
          <div className="p-3 border-b">
            <div className="flex items-center">
              <i className="bi bi-search text-muted-foreground text-xl mr-3"></i>
              <input
                ref={inputRef}
                type="text"
                className="flex h-12 w-full bg-transparent mx-2 rounded-md outline-none placeholder:text-muted-foreground"
                placeholder="Search items, projects, goals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isSearching && (
                <div className="animate-spin mr-2">
                  <i className="bi bi-arrow-repeat text-muted-foreground"></i>
                </div>
              )}
              <kbd className="hidden sm:inline-block bg-muted text-muted-foreground border px-2 py-0.5 rounded text-xs ml-2">esc</kbd>
            </div>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[400px] overflow-y-auto"
          >
            {allResults.length === 0 && query.length >= 2 && !isSearching && (
              <div className="text-center py-10 text-muted-foreground">
                <i className="bi bi-search text-4xl mb-2 block"></i>
                <p>No results found for "{query}"</p>
              </div>
            )}

            {/* Quick Actions (when no query) */}
            {!query && (
              <div className="p-2">
                <div className="text-muted-foreground uppercase text-xs font-bold px-3 py-2">
                  Quick Actions
                </div>
                {quickActions.map((action, index) => (
                  <div
                    key={action.id}
                    data-index={index}
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                      }`}
                    onClick={() => handleSelect({ ...action, resultType: "action" })}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 mr-3">
                      <i className={`bi ${action.icon} text-primary text-lg`}></i>
                    </span>
                    <span className="font-medium flex-1">{action.label}</span>
                    {action.shortcut && (
                      <kbd className="bg-muted text-muted-foreground border px-2 py-0.5 rounded text-xs ml-auto">{action.shortcut}</kbd>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {results.projects.length > 0 && (
              <div className="p-2">
                <div className="text-muted-foreground uppercase text-xs font-bold px-3 py-2">Projects</div>
                {results.projects.map((project, index) => {
                  const globalIndex = index;
                  return (
                    <div
                      key={project.id}
                      data-index={globalIndex}
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${selectedIndex === globalIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      onClick={() => handleSelect({ ...project, resultType: "project" })}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-md bg-info/10 mr-3">
                        <i className="bi bi-folder text-info text-lg"></i>
                      </span>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium truncate">{project.title}</span>
                        {project.acronym && (
                          <span className="text-muted-foreground text-xs">{project.acronym}</span>
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
                <div className="text-muted-foreground uppercase text-xs font-bold px-3 py-2">Items</div>
                {results.items.map((item, index) => {
                  const globalIndex = results.projects.length + index;
                  return (
                    <div
                      key={item.id}
                      data-index={globalIndex}
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${selectedIndex === globalIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      onClick={() => handleSelect({ ...item, resultType: "item" })}
                    >
                      <span className={`flex items-center justify-center w-8 h-8 rounded-md bg-${getResultColor(item)}/10 mr-3`}>
                        <i className={`bi ${getResultIcon(item)} text-${getResultColor(item)} text-lg`}></i>
                      </span>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium truncate">{item.title}</span>
                        <span className="text-muted-foreground text-xs">#{item.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Goals */}
            {results.goals.length > 0 && (
              <div className="p-2">
                <div className="text-muted-foreground uppercase text-xs font-bold px-3 py-2">Goals</div>
                {results.goals.map((goal, index) => {
                  const globalIndex = results.projects.length + results.items.length + index;
                  return (
                    <div
                      key={goal.id}
                      data-index={globalIndex}
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${selectedIndex === globalIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      onClick={() => handleSelect({ ...goal, resultType: "goal" })}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-md bg-warning/10 mr-3">
                        <i className="bi bi-trophy text-warning text-lg"></i>
                      </span>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium truncate">{goal.title || goal.name}</span>
                        {goal.progress !== undefined && (
                          <span className="text-muted-foreground text-xs">{goal.progress}% complete</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/30">
            <div className="flex justify-center gap-4 text-muted-foreground text-xs">
              <span className="flex items-center">
                <kbd className="bg-background border rounded px-1 min-w-[1.25rem] text-center mr-1.5">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center">
                <kbd className="bg-background border rounded px-1 min-w-[1.25rem] text-center mr-1.5">↵</kbd> Select
              </span>
              <span className="flex items-center">
                <kbd className="bg-background border rounded px-1 mr-1.5">esc</kbd> Close
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
