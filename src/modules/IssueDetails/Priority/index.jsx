import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { IssuePriority, IssuePriorityCopy } from '../../../constants/issues';
import { Select, IssuePriorityIcon } from '../../../components/common';
import { Priority, Label } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsPriority = ({ issue, updateIssue }) => (
  <Fragment>
    <h3 className="fw-bold mb-1">Priority</h3>
    <Select
      variant="empty"
      withClearValue={false}
      dropdownWidth={343}
      name="priority"
      value={issue.priority}
      options={Object.values(IssuePriority).map(priority => ({
        value: priority,
        label: IssuePriorityCopy[priority],
      }))}
      onChange={priority => updateIssue({ priority })}
      renderValue={({ value: priority }) => renderPriorityItem(priority, true)}
      renderOption={({ value: priority }) => renderPriorityItem(priority)}
    />
  </Fragment>
);

const renderPriorityItem = (priority, isValue) => (
  <Priority isValue={isValue}>
    <IssuePriorityIcon priority={priority} />
    <Label>{IssuePriorityCopy[priority]}</Label>
  </Priority>
);

ProjectBoardIssueDetailsPriority.propTypes = propTypes;

export default ProjectBoardIssueDetailsPriority;
