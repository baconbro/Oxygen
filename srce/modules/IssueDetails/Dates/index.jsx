import PropTypes from 'prop-types';
import { formatDateTimeConversational } from '../../../utils/dateTime';
import DatePicker from '../../../components/common/DatePicker';

const propTypes = {
  issue: PropTypes.object.isRequired,
};

const ProjectBoardIssueDetailsDates = ({ issue, updateIssue }) => (
  <>
  <h3 className="fw-bold mb-1">Dates</h3>
    <div className='text-muted fw-bold mb-3'>Created at {formatDateTimeConversational(issue.createdAt)}</div>
    <div className='text-muted fw-bold mb-3'>Updated at {formatDateTimeConversational(issue.updatedAt)}</div>
    <div className='text-muted fw-bold mb-3'>Due date 
    <DatePicker
    onChange={dueDate => updateIssue({ dueDate })}
    value={issue.dueDate}
    className="form-control form-control-solid"
    />
    </div>
    
  </>
);

ProjectBoardIssueDetailsDates.propTypes = propTypes;

export default ProjectBoardIssueDetailsDates;
