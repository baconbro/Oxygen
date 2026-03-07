import PropTypes from 'prop-types';
import { Select } from '../../../components/common';
import { Status } from './Styles';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsStatus = ({ issue, updateIssue, customStatus, fieldName }) => {
  const { project } = useWorkspace()
  
  // Find border color for a status
  const getBorderColor = (statusId) => {
    // Try to find the status in project configuration
    const statusConfig = project.config.issueStatus.find(status => status.id === statusId);
    return statusConfig?.borderColor || '#FF5733'; // Default color if not found
  };

  return (
    <>

      {
        //custom status is for goals (beta1.0)
        customStatus ? (<Select
          variant="empty"
          dropdownWidth={343}
          withClearValue={false}
          name={fieldName || "status"}
          value={issue[fieldName || 'status']}
          options={Object.values(customStatus.IssueStatus).map(status => ({
            value: status,
            label: customStatus.IssueStatusCopy[status],
          }))}
          onChange={status => {
            const updateField = fieldName || 'status';
            updateIssue({ [updateField]: status });
          }}
          renderValue={({ value: status }) => (
            <Status isValue color={status} className={`btn btn-${customStatus.IssueStatusClass[status]}`}
              style={{ borderLeft: `3px solid ${customStatus.IssueStatusClass[status] || '#FF5733'}` }}>
              <div>{customStatus.IssueStatusCopy[status]}</div>
              <i className='bi bi-chevron-down'></i>
            </Status>
          )}
          renderOption={({ value: status }) => (
            <Status className={`btn btn-${customStatus.IssueStatusClass[status]}`} color={status}
              style={{ borderLeft: `3px solid ${customStatus.IssueStatusClass[status] || '#FF5733'}` }}>
              {customStatus.IssueStatusCopy[status]}
            </Status>
          )}
        />) : (<Select
          variant="empty"
          dropdownWidth={343}
          withClearValue={false}
          name="status"
          value={issue.status}
          options={Object.values(project.config.issueStatus).map(status => ({
            value: status.id,
            label: status.name,
            borderColor: status.borderColor,
          }))}
          onChange={status => updateIssue({ status })}
          renderValue={({ value: status }) => {
            const statusConfig = project.config.issueStatus.find(s => s.id === status);
            const borderColor = statusConfig?.borderColor || '#FF5733';
            return (
              <Status isValue color={status} 
                style={{ borderLeft: `3px solid ${borderColor}` }}>
                <div>{statusConfig?.name}</div>
                <i className='bi bi-chevron-down'></i>
              </Status>
            );
          }}
          renderOption={({ value, label, borderColor }) => (
            <Status color={value} style={{ borderLeft: `3px solid ${borderColor || '#FF5733'}` }}>
              {label}
            </Status>
          )}
        />)}

    </>
  )
};

ProjectBoardIssueDetailsStatus.propTypes = propTypes;

export default ProjectBoardIssueDetailsStatus;
