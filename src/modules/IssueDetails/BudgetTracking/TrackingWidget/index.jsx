import React from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';

import { TrackingWidget, WatchIcon, Right, BarCont, Bar, Values } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
};

const ProjectBoardIssueDetailsTrackingWidget = ({ issue }) => (
  <TrackingWidget>
    <WatchIcon type="stopwatch" size={26} top={-1} />
    <Right>
      <BarCont>
        <Bar width={calculateTrackingBarWidth(issue)} />
      </BarCont>
      <Values>
        <div>{issue.budgetSpent ? `${issue.budgetSpent}$ logged` : 'No spend logged'}</div>
        {renderRemainingOrEstimate(issue)}
      </Values>
    </Right>
  </TrackingWidget>
);

const calculateTrackingBarWidth = ({ budgetSpent, budgetRemaining, budgetEstimate }) => {
  if (!budgetSpent) {
    return 0;
  }
  if (isNil(budgetRemaining) && isNil(budgetEstimate)) {
    return 100;
  }
  if (!isNil(budgetRemaining)) {
    return (budgetSpent / (budgetSpent + budgetRemaining)) * 100;
  }
  if (!isNil(budgetEstimate)) {
    return Math.min((budgetSpent / budgetEstimate) * 100, 100);
  }
};

const renderRemainingOrEstimate = ({ budgetRemaining, budgetEstimate }) => {
  if (isNil(budgetRemaining) && isNil(budgetEstimate)) {
    return null;
  }
  if (!isNil(budgetRemaining)) {
    return <div>{`${budgetRemaining}$ remaining`}</div>;
  }
  if (!isNil(budgetEstimate)) {
    return <div>{`${budgetEstimate}$ estimated`}</div>;
  }
};

ProjectBoardIssueDetailsTrackingWidget.propTypes = propTypes;

export default ProjectBoardIssueDetailsTrackingWidget;
