import PropTypes from 'prop-types';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { customStatus, getScoreColor } from '../../constants/custom';
import { Status } from '../IssueDetails/Status/Styles';
import { useNavigate } from 'react-router-dom';

const KRTable = ({ parentGoalId }) => {
  const { goals, setCurrentGoal } = useWorkspace();
  const navigate = useNavigate();

  const filteredGoals = (goals || []).filter(
    goal => String(goal.parent) === String(parentGoalId) && goal.type === 'kr'
  );

  const handleRowClick = (goal) => {
    setCurrentGoal(goal);
    navigate(`/goals/details?id=${goal.id}`);
  };

  const getKRProgress = (goal) => {
    const score = Number(goal.score);
    const target = Number(goal.targetValue);
    if (!isNaN(score) && !isNaN(target) && target !== 0) {
      return Math.round((score / target) * 100);
    }
    return 0;
  };

  if (filteredGoals.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center py-8">
        <i className="bi bi-list-check fs-3x text-gray-300 mb-3"></i>
        <div className="text-gray-500 fw-semibold mb-1">No key results yet</div>
        <div className="text-gray-400 fs-7">Add measurable key results to track progress toward this objective.</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {filteredGoals.map((goal, index) => {
        const progress = getKRProgress(goal);
        const hasTarget = goal.targetValue && Number(goal.targetValue) !== 0;

        return (
          <div
            key={goal.id}
            onClick={() => handleRowClick(goal)}
            className="border border-gray-300 border-dashed rounded p-4 cursor-pointer bg-hover-light-primary"
            style={{ transition: 'background-color 0.15s ease' }}
          >
            <div className="d-flex align-items-start justify-content-between mb-2">
              <div className="d-flex align-items-center gap-3 flex-fill">
                <span className="text-gray-400 fw-bold fs-7 min-w-25px">
                  KR{index + 1}
                </span>
                <span className="fw-semibold text-gray-800 text-hover-primary fs-6">
                  {goal.title}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 ms-3">
                <Status
                  className={`btn btn-sm btn-${customStatus.IssueStatusClass[goal.status]}`}
                  color={goal.status}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  {customStatus.IssueStatusCopy[goal.status]}
                </Status>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="progress h-6px flex-fill">
                <div
                  className={`progress-bar bg-${getScoreColor(progress)}`}
                  role="progressbar"
                  style={{ width: `${Math.min(progress, 100)}%`, transition: 'width 0.4s ease' }}
                ></div>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ minWidth: 100 }}>
                {hasTarget ? (
                  <>
                    <span className={`badge badge-light-${getScoreColor(progress)} fs-8`}>
                      {goal.score || 0} / {goal.targetValue}
                    </span>
                    <span className="text-gray-500 fw-semibold fs-8">
                      {progress}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 fs-8">No target set</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

KRTable.propTypes = {
  parentGoalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default KRTable;
