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
      <div className="text-gray-500 text-center py-5">
        No key results yet. Add one to start tracking progress.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-row-dashed table-row-gray-300 gy-3">
        <thead>
          <tr className="fw-bold fs-7 text-uppercase text-gray-500">
            <th>Title</th>
            <th>Status</th>
            <th>Score</th>
            <th style={{ minWidth: 120 }}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {filteredGoals.map(goal => {
            const progress = getKRProgress(goal);
            return (
              <tr
                key={goal.id}
                onClick={() => handleRowClick(goal)}
                style={{ cursor: 'pointer' }}
              >
                <td className="fw-semibold text-gray-800 text-hover-primary">
                  {goal.title}
                </td>
                <td>
                  <Status
                    className={`btn btn-sm btn-${customStatus.IssueStatusClass[goal.status]}`}
                    color={goal.status}
                  >
                    {customStatus.IssueStatusCopy[goal.status]}
                  </Status>
                </td>
                <td>
                  <span className={`badge badge-light-${getScoreColor(goal.score)} fs-base`}>
                    {goal.score || 0}
                    {goal.targetValue ? ` / ${goal.targetValue}` : ''}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="progress h-6px w-100 me-2">
                      <div
                        className={`progress-bar bg-${getScoreColor(progress)}`}
                        role="progressbar"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className="text-gray-500 fw-semibold fs-7" style={{ minWidth: 35 }}>
                      {progress}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

KRTable.propTypes = {
  parentGoalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default KRTable;
