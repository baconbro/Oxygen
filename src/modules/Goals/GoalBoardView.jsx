import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { customStatus, getScoreColor, goalType } from '../../constants/custom';
import { Avatar } from '../../components/common';

const statusColumns = [
  { key: 'pending', label: 'Pending', colorClass: 'secondary' },
  { key: 'ontrack', label: 'On Track', colorClass: 'success' },
  { key: 'atrisk', label: 'At Risk', colorClass: 'danger' },
  { key: 'behind', label: 'Behind', colorClass: 'warning' },
  { key: 'completed', label: 'Completed', colorClass: 'primary' },
  { key: 'paused', label: 'Paused', colorClass: 'dark' },
];

const GoalBoardView = ({ goals, orgUsers }) => {
  const navigate = useNavigate();
  const { setCurrentGoal } = useWorkspace();

  const handleCardClick = (goal) => {
    setCurrentGoal(goal);
    navigate(`details?id=${goal.id}`);
  };

  const getOwnerInfo = (reporterId) => {
    if (orgUsers?.users) {
      const user = Object.values(orgUsers.users).find(u => u.uid === reporterId);
      if (user) {
        return {
          name: user.name || user.displayName || user.fName || '',
          avatarUrl: user.photoURL || '',
        };
      }
    }
    return { name: '', avatarUrl: '' };
  };

  const getProgress = (goal, allGoals) => {
    if (goal.type === 'kr') {
      const score = Number(goal.score) || 0;
      const target = Number(goal.targetValue);
      if (target && target !== 0) return Math.round((score / target) * 100);
      return 0;
    }
    const childKRs = (allGoals || []).filter(g => String(g.parent) === String(goal.id) && g.type === 'kr');
    if (childKRs.length === 0) return null;
    let total = 0;
    let count = 0;
    childKRs.forEach(kr => {
      const s = Number(kr.score) || 0;
      const t = Number(kr.targetValue);
      if (t && t !== 0) { total += s / t; count++; }
    });
    return count > 0 ? Math.round((total / count) * 100) : 0;
  };

  // Only show top-level goals (objectives/initiatives without parent) on the board
  const topLevelGoals = (goals || []).filter(g => !g.parent && !g.isArchived);

  return (
    <div className="d-flex gap-4 overflow-auto pb-4" style={{ minHeight: 400 }}>
      {statusColumns.map(col => {
        const columnGoals = topLevelGoals.filter(g => g.status === col.key);
        return (
          <div key={col.key} className="flex-shrink-0" style={{ width: 280, minWidth: 280 }}>
            {/* Column header */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
              <div className="d-flex align-items-center gap-2">
                <span className={`bullet bullet-dot bg-${col.colorClass} h-8px w-8px`}></span>
                <span className="fw-bold text-gray-700 fs-7">{col.label}</span>
              </div>
              <span className="badge badge-light fs-8">{columnGoals.length}</span>
            </div>

            {/* Column cards */}
            <div
              className="d-flex flex-column gap-3"
              style={{ minHeight: 200 }}
            >
              {columnGoals.map(goal => {
                const owner = getOwnerInfo(goal.reporterId);
                const progress = getProgress(goal, goals);
                const childCount = (goals || []).filter(g => String(g.parent) === String(goal.id)).length;

                return (
                  <div
                    key={goal.id}
                    onClick={() => handleCardClick(goal)}
                    className="card card-flush border border-gray-200 cursor-pointer bg-hover-light-primary"
                    style={{ transition: 'all 0.15s ease' }}
                  >
                    <div className="card-body p-4">
                      {/* Type badge */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className={`badge badge-${goalType.IssueStatusClass[goal.type] || 'light-primary'} fs-9`}>
                          {goalType.IssueStatusCopy[goal.type] || 'Goal'}
                        </span>
                        {goal.tags && goal.tags.length > 0 && (
                          <div className="d-flex gap-1">
                            {goal.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="badge badge-light fs-9">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="fw-semibold text-gray-800 fs-6 mb-3 text-truncate-2">
                        {goal.title}
                      </div>

                      {/* Progress */}
                      {progress !== null && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-gray-500 fs-8">Progress</span>
                            <span className={`text-${getScoreColor(progress)} fs-8 fw-bold`}>{progress}%</span>
                          </div>
                          <div className="progress h-5px">
                            <div
                              className={`progress-bar bg-${getScoreColor(progress)}`}
                              style={{ width: `${Math.min(progress, 100)}%`, transition: 'width 0.4s ease' }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Footer: owner + child count */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <Avatar avatarUrl={owner.avatarUrl} name={owner.name} size={22} className="avatar-circle" />
                          <span className="text-gray-500 fs-8">{owner.name}</span>
                        </div>
                        {childCount > 0 && (
                          <span className="text-gray-400 fs-8">
                            <i className="bi bi-diagram-3 me-1 fs-8"></i>
                            {childCount}
                          </span>
                        )}
                      </div>

                      {/* Cadence */}
                      {goal.cadence && (
                        <div className="mt-2">
                          <span className="badge badge-light-primary fs-9">{goal.cadence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {columnGoals.length === 0 && (
                <div className="text-center py-8 text-gray-400 fs-8">
                  No goals
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoalBoardView;
