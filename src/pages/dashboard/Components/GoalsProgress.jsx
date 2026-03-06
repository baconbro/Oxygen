import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../../modules/auth";
import { useFetchOKRs } from "../../../services/okrServices";

/**
 * GoalsProgress Widget
 * Shows OKR/Goals progress to connect daily work to strategic objectives
 */
export const GoalsProgress = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;

  const { data: goals = [], isLoading } = useFetchOKRs(orgId);

  // Get top-level goals (objectives) with their progress
  const topGoals = useMemo(() => {
    if (!goals || goals.length === 0) return [];

    // Filter for top-level objectives (no parent or parent is null)
    const objectives = goals.filter(
      (g) => !g.parent || g.parent === null || g.parent === ""
    );

    // Calculate progress for each objective
    return objectives
      .map((obj) => {
        // Find all key results for this objective
        const keyResults = goals.filter((g) => g.parent === obj.id);

        let progress = 0;
        if (keyResults.length > 0) {
          // Calculate average progress of key results
          const totalProgress = keyResults.reduce((sum, kr) => {
            return sum + (kr.progress || 0);
          }, 0);
          progress = Math.round(totalProgress / keyResults.length);
        } else {
          // Use the objective's own progress if no key results
          progress = obj.progress || 0;
        }

        return {
          ...obj,
          calculatedProgress: progress,
          keyResultsCount: keyResults.length,
        };
      })
      .sort((a, b) => (b.calculatedProgress || 0) - (a.calculatedProgress || 0))
      .slice(0, 4); // Show top 4 goals
  }, [goals]);

  const handleGoalClick = (goal) => {
    navigate(`/goals/details/${goal.id}`);
  };

  const handleViewAll = () => {
    navigate("/goals");
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "primary";
    if (progress >= 25) return "warning";
    return "danger";
  };

  const getStatusBadge = (goal) => {
    if (goal.status === "completed" || goal.calculatedProgress >= 100) {
      return (
        <span className="badge badge-light-success fs-8">
          <i className="bi bi-check-circle-fill me-1"></i>Done
        </span>
      );
    }
    if (goal.status === "at_risk") {
      return (
        <span className="badge badge-light-danger fs-8">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>At Risk
        </span>
      );
    }
    if (goal.status === "on_track") {
      return (
        <span className="badge badge-light-success fs-8">
          <i className="bi bi-check-lg me-1"></i>On Track
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Goals & OKRs</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-center py-5">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topGoals || topGoals.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold text-dark">Goals & OKRs</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-trophy text-muted fs-2x mb-3 d-block"></i>
            <p className="text-muted mb-2">No goals set yet</p>
            <button
              className="btn btn-sm btn-light-primary"
              onClick={handleViewAll}
            >
              <i className="bi bi-plus-lg me-1"></i>Create Goal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5 pb-3">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-dark">Goals & OKRs</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            Strategic objectives progress
          </span>
        </h3>
        <div className="card-toolbar">
          <button
            className="btn btn-sm btn-light-primary"
            onClick={handleViewAll}
          >
            View All
          </button>
        </div>
      </div>

      <div className="card-body pt-0">
        {topGoals.map((goal, index) => (
          <div
            key={goal.id || index}
            className="mb-4 cursor-pointer"
            onClick={() => handleGoalClick(goal)}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center flex-grow-1 me-3 overflow-hidden">
                <span
                  className="text-gray-800 fw-semibold text-truncate"
                  title={goal.title || goal.name}
                >
                  {goal.title || goal.name || "Untitled Goal"}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {getStatusBadge(goal)}
                <span
                  className={`fw-bold text-${getProgressColor(
                    goal.calculatedProgress
                  )}`}
                >
                  {goal.calculatedProgress}%
                </span>
              </div>
            </div>
            <div className="progress h-6px">
              <div
                className={`progress-bar bg-${getProgressColor(
                  goal.calculatedProgress
                )}`}
                role="progressbar"
                style={{ width: `${goal.calculatedProgress}%` }}
                aria-valuenow={goal.calculatedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            {goal.keyResultsCount > 0 && (
              <span className="text-muted fs-8 mt-1 d-block">
                {goal.keyResultsCount} key result
                {goal.keyResultsCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
