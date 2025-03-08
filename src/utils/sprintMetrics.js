export const calculateSprintMetrics = (sprints, issues, doneColumnId) => {
  // Sort sprints by start date, newest first, and take last 5
  const recentSprints = [...sprints]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5)
    .reverse();

  return recentSprints.map(sprint => {
    const sprintIssues = issues.filter(issue => issue.sprintId === sprint.id);
    
    // Calculate total story points committed
    const totalPoints = sprintIssues.reduce((sum, issue) => 
      sum + (issue.storypoint || 0), 0);

    // Calculate completed story points (issues in done status)
    const completedPoints = sprintIssues
      .filter(issue => issue.status === doneColumnId)
      .reduce((sum, issue) => sum + (issue.storypoint || 0), 0);

    return {
      name: sprint.name,
      committed: totalPoints,
      completed: completedPoints
    };
  });
};
