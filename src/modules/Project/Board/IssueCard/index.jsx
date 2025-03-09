import React from 'react';
import PropTypes from 'prop-types';

// ...existing code...

const IssueCard = ({ issue, /* ...other props */ }) => {
  // ...existing code...
  
  // Function to calculate checklist progress
  const getChecklistProgress = () => {
    if (!issue.checklist || issue.checklist.length === 0) return null;
    
    const total = issue.checklist.length;
    const completed = issue.checklist.filter(item => item.isCompleted).length;
    const percentage = Math.round((completed / total) * 100);
    
    return { total, completed, percentage };
  };
  
  const checklistProgress = getChecklistProgress();
  
  return (
    <div>
      {/* ...existing issue card content... */}
      
      {/* Add checklist progress if checklist exists and has items */}
      {checklistProgress && (
        <div className="checklist-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${checklistProgress.percentage}%` }}
            />
          </div>
          <span>
            {checklistProgress.completed}/{checklistProgress.total}
          </span>
        </div>
      )}
      
      {/* ...other elements... */}
    </div>
  );
};

// ...existing code...

IssueCard.propTypes = {
  issue: PropTypes.object.isRequired,
  // ...other prop types...
};

export default IssueCard;