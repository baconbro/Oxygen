/**
 * Generates ideal burndown line data points
 * 
 * @param {Date} startDate - Sprint start date
 * @param {Date} endDate - Sprint end date
 * @param {Number} totalPoints - Total story points in sprint
 * @returns {Array} Array of [date, remaining points] data points
 */
export const generateIdealBurndown = (startDate, endDate, totalPoints) => {
  const ideal = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate number of days in the sprint
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate ideal burndown points (linear)
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    // Calculate ideal remaining points (linear from totalPoints to 0)
    const pointsPerDay = totalPoints / (days - 1);
    const remainingPoints = Math.max(0, totalPoints - (pointsPerDay * i));
    
    ideal.push([date.getTime(), parseFloat(remainingPoints.toFixed(1))]);
  }
  
  return ideal;
};

/**
 * Processes raw issue history into burndown data format
 * 
 * @param {Array} historyEntries - Raw issue history entries
 * @param {Date} startDate - Sprint start date
 * @param {Date} endDate - Sprint end date
 * @param {Object} issuePoints - Map of issue ID to story points
 * @param {String} doneColumnId - ID of the Done column status
 * @returns {Array} Array of [date, remaining points] data points
 */
export const processHistoryToBurndownData = (historyEntries, startDate, endDate, issuePoints, doneColumnId) => {
  // Create an array of all dates in the sprint
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  
  // Total story points at sprint start
  const totalPoints = Object.values(issuePoints).reduce((sum, points) => sum + points, 0);
  
  // Track which issues are "done" by date
  const doneIssuesByDate = {};
  dates.forEach(date => {
    doneIssuesByDate[date] = new Set();
  });
  
  // Process history to track when issues moved to "done"
  historyEntries.forEach(entry => {
    if (!entry.timestamp) return;
    
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    // Only process if the date is within our sprint range
    if (dates.includes(entryDate)) {
      if (entry.status === doneColumnId) {
        // Mark issue as done for this date and all later dates
        dates.filter(d => d >= entryDate).forEach(date => {
          doneIssuesByDate[date].add(entry.issueId);
        });
      } else if (doneIssuesByDate[entryDate].has(entry.issueId)) {
        // Issue moved from "done" to another status
        dates.filter(d => d >= entryDate).forEach(date => {
          doneIssuesByDate[date].delete(entry.issueId);
        });
      }
    }
  });
  
  // Calculate remaining points for each day
  const burndownData = dates.map(date => {
    let donePoints = 0;
    doneIssuesByDate[date].forEach(issueId => {
      donePoints += issuePoints[issueId] || 0;
    });
    
    return [
      new Date(date).getTime(),
      parseFloat((totalPoints - donePoints).toFixed(1))
    ];
  });
  
  return burndownData;
};
