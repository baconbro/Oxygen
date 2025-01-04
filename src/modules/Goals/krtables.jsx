import PropTypes from 'prop-types';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { customStatus } from '../../constants/custom';
import { Status } from '../IssueDetails/Status/Styles';
import { useNavigate } from 'react-router-dom';

const KRTable = ({ parentGoalId }) => {
  const { goals, setCurrentGoal } = useWorkspace();
  const navigate = useNavigate();

  // Filter goals based on the parent goal ID and type 'kr'
  const filteredGoals = goals.filter(goal => goal.parent === parentGoalId && goal.type === 'kr');

  const handleRowClick = (goal) => {
    setCurrentGoal(goal);
    navigate(`/goals/details?id=${goal.id}`);
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-row-gray-300 gy-3">
        <thead>
          <tr className='fw-bold fs-6 text-gray-800'>
            <th>Title</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Work progress</th>
          </tr>
        </thead>
        <tbody>
          {filteredGoals.map(goal => (
            <tr key={goal.id} onClick={() => handleRowClick(goal)} style={{ cursor: 'pointer' }}>
              <td>{goal.title}</td>
              <td><Status className={`btn btn-${customStatus.IssueStatusClass[goal.status]}`} color={goal.status}>{customStatus.IssueStatusCopy[goal.status]}</Status>
              </td>
              <td>      <div className='progress h-6px w-100'>
        <div
          className='progress-bar bg-primary'
          role='progressbar'
          style={{ width: '50%' }}
        ></div>
      </div></td>
      <td>      <div className='progress h-6px w-100'>
        <div
          className='progress-bar bg-primary'
          role='progressbar'
          style={{ width: '50%' }}
        ></div>
      </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

KRTable.propTypes = {
  parentGoalId: PropTypes.string.isRequired,
};

export default KRTable;