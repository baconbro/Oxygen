import { collection, addDoc, getDocs, query, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from './firestore';

/**
 * Records a status change for an issue in the history collection
 * @param {string} orgId Organization ID
 * @param {string} spaceId Workspace/Space ID
 * @param {number} issueId Issue ID
 * @param {string} newStatus New status of the issue
 * @param {object} issue Full issue object (optional, for snapshots)
 * @returns {Promise} Promise resolving to the new document reference
 */
export const recordStatusChange = async (orgId, spaceId, issueId, newStatus, issue = null) => {
  try {
    const historyColRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'issueHistory');
    
    const historyEntry = {
      issueId,
      status: newStatus,
      timestamp: Date.now()
    };
    
    // Optionally store a snapshot of the issue at this point in time
    if (issue) {
      // Create a clean snapshot with only defined values to avoid Firestore errors
      const snapshot = {
        title: issue.title || '',
        type: issue.type || '',
        priority: issue.priority || '',
        // Use null coalescing to ensure we don't store undefined values
        storyPoints: issue.storyPoints ?? 0, // Use 0 if storyPoints is undefined/null
        userIds: Array.isArray(issue.userIds) ? issue.userIds : []
      };
      
      historyEntry.snapshot = snapshot;
    }
    
    return await addDoc(historyColRef, historyEntry);
  } catch (error) {
    console.error('Error recording status change:', error);
    throw new Error('Failed to record status change: ' + error.message);
  }
};

/**
 * Fetches historical status data for all issues in a workspace
 * @param {string} orgId Organization ID
 * @param {string} spaceId Workspace/Space ID
 * @param {number} daysBack How many days of history to fetch (default 30)
 * @returns {Promise<Array>} Array of history entries
 */
export const getIssueStatusHistory = async (orgId, spaceId, daysBack = 30) => {
  try {
    // Calculate the timestamp for daysBack days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startTimestamp = startDate.getTime();
    
    const historyColRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'issueHistory');
    const q = query(
      historyColRef, 
      where('timestamp', '>=', startTimestamp),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching issue status history:', error);
    throw new Error('Failed to fetch issue status history');
  }
};

/**
 * Creates a daily snapshot of issue statuses for the cumulative flow diagram
 * @param {string} orgId Organization ID
 * @param {string} spaceId Workspace/Space ID
 * @param {Array} issues Current issues for fallback/initial state
 * @param {Array} issueStatuses Array of issue status configurations
 * @param {number} daysBack How many days of history to fetch
 * @returns {Object} Formatted data for the cumulative flow chart
 */
export const getCumulativeFlowHistoricalData = async (
  orgId, 
  spaceId, 
  issues, 
  issueStatuses, 
  daysBack = 30
) => {
  try {
    console.log("Getting historical data with params:", { orgId, spaceId, issuesCount: issues.length, statusesCount: issueStatuses.length });

    // Get raw history data
    const historyData = await getIssueStatusHistory(orgId, spaceId, daysBack);
    console.log(`Retrieved ${historyData.length} history entries`);
    
    // If we have no historical data and backfill hasn't run, create some initial entries
    if (historyData.length === 0) {
      console.log("No historical data found - we need to run backfill");
      // Return null to trigger the fallback to simulated data
      return null;
    }
    
    // Generate array of days (date strings) for the x-axis
    const dates = [];
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Create a mapping of status IDs to names
    const statusMap = {};
    issueStatuses.forEach(status => {
      statusMap[status.id] = status.name;
    });
    
    // Initialize counts for each status on each day
    const dailyStatusCounts = {};
    const allStatusIds = issueStatuses.map(status => status.id);
    
    dates.forEach(date => {
      dailyStatusCounts[date] = {};
      allStatusIds.forEach(statusId => {
        dailyStatusCounts[date][statusId] = 0;
      });
    });
    
    // Process historical data to build the daily counts
    // First, create a map of the latest status for each issue on each day
    const issueStatusByDay = {};
    
    // Initialize with current statuses (fallback for issues without history)
    issues.forEach(issue => {
      if (!issueStatusByDay[issue.id]) {
        issueStatusByDay[issue.id] = {};
      }
      // Set the current status for all dates (will be overwritten by history)
      dates.forEach(date => {
        issueStatusByDay[issue.id][date] = issue.status;
      });
    });
    
    // Update with historical data
    historyData.forEach(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      
      // Find the first date in our range that's >= the entry date
      const applicableDates = dates.filter(date => date >= entryDate);
      
      if (!issueStatusByDay[entry.issueId]) {
        issueStatusByDay[entry.issueId] = {};
      }
      
      // Update the status for all applicable dates
      applicableDates.forEach(date => {
        issueStatusByDay[entry.issueId][date] = entry.status;
      });
    });
    
    // Count issues in each status for each day
    Object.keys(issueStatusByDay).forEach(issueId => {
      const issueDailyStatus = issueStatusByDay[issueId];
      
      dates.forEach(date => {
        const statusOnDate = issueDailyStatus[date];
        if (statusOnDate && dailyStatusCounts[date][statusOnDate] !== undefined) {
          dailyStatusCounts[date][statusOnDate]++;
        }
      });
    });
    
    // Format the data for the chart
    const series = allStatusIds.map(statusId => {
      return {
        name: statusId,
        data: dates.map(date => dailyStatusCounts[date][statusId] || 0)
      };
    });
    
    console.log("Generated series data:", series.map(s => s.name));
    
    return {
      categories: dates,
      series: series
    };
  } catch (error) {
    console.error('Error generating cumulative flow data:', error);
    throw new Error('Failed to generate cumulative flow data');
  }
};

/**
 * Gets burndown chart data for a specific sprint
 * @param {string} orgId Organization ID
 * @param {string} spaceId Workspace/Space ID
 * @param {number} sprintId Sprint ID
 * @returns {Promise<Object>} Burndown chart data
 */
export const getBurndownChartData = async (orgId, spaceId, sprintId) => {
  try {
    // First get the sprint details
    const sprintsRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'sprints');
    const q = query(sprintsRef, where('id', '==', sprintId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Sprint not found');
      return { 
        actual: [], 
        ideal: [], 
        totalPoints: 0 
      };
    }
    
    // Get sprint data
    let sprint;
    let sprintDocId;
    querySnapshot.forEach((doc) => {
      sprint = { id: doc.id, ...doc.data() };
      sprintDocId = doc.id;
    });
    
    // Get sprint start and end dates
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    
    // Create empty data structure with start/end date points
    const emptyResult = {
      actual: [[startDate.getTime(), 0], [endDate.getTime(), 0]],
      ideal: [[startDate.getTime(), 0], [endDate.getTime(), 0]],
      totalPoints: 0
    };
    
    // Get tickets in this sprint
    if (!sprintDocId) {
      console.log('Sprint document ID not found');
      return emptyResult;
    }
    
    const ticketsRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'sprints', sprintDocId, 'tickets');
    const ticketsSnapshot = await getDocs(ticketsRef);
    
    if (ticketsSnapshot.empty) {
      console.log('No tickets found in this sprint');
      return emptyResult;
    }
    
    const ticketIds = [];
    ticketsSnapshot.forEach((doc) => {
      const ticketData = doc.data();
      // Only include tickets that have not been removed or were removed after the sprint ended
      if (ticketData.ticketId && (!ticketData.removed_at || new Date(ticketData.removed_at) > endDate)) {
        ticketIds.push(parseInt(ticketData.ticketId));
      }
    });

    // If no tickets found, return empty data structure
    if (ticketIds.length === 0) {
      console.log('No valid tickets found in this sprint');
      return emptyResult;
    }

    // Group history entries by day
    const dailyData = {};
    const datePoints = [];
    
    // Generate all dates between sprint start and end
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyData[dateStr] = { date: new Date(currentDate).getTime(), remaining: 0 };
      datePoints.push(dateStr);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate initial total story points at sprint start
    let totalPoints = 0;
    const issuePoints = {};
    
    // Get the story points for each ticket - use batching for Firestore limits
    const batchSize = 10; // Firestore's "in" query has a limit of 10 values
    
    try {
      // Process tickets in batches to avoid Firestore limitations
      for (let i = 0; i < ticketIds.length; i += batchSize) {
        const batch = ticketIds.slice(i, i + batchSize);
        
        if (batch.length === 0) continue;
        
        const itemsColRef = collection(db, 'organisation', orgId, 'items');
        const itemsQuery = query(itemsColRef, where('id', 'in', batch));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        if (itemsSnapshot.empty) continue;
        
        itemsSnapshot.forEach(doc => {
          const item = doc.data();
          // Ensure we use correct field name for story points
          const storyPoints = parseInt(item.storyPoints || item.storypoint || 0);
          issuePoints[item.id] = storyPoints;
          totalPoints += storyPoints;
        });
      }
    } catch (storyPointError) {
      console.error('Error fetching story points:', storyPointError);
      // Continue with the tickets we have
    }
    
    // Handle case where no story points were found
    if (totalPoints === 0) {
      console.log('No story points found for tickets in this sprint');
      return {
        actual: [[startDate.getTime(), 0], [endDate.getTime(), 0]],
        ideal: [[startDate.getTime(), 0], [endDate.getTime(), 0]],
        totalPoints: 0
      };
    }
    
    // Get the "done" status ID from workspace config
    let doneColumnId = '4'; // Default value if not found
    try {
      const spaceDocRef = doc(db, 'organisation', orgId, 'spaces', spaceId);
      const spaceDoc = await getDoc(spaceDocRef);
      if (spaceDoc.exists()) {
        const spaceData = spaceDoc.data();
        if (spaceData.config?.workspaceConfig?.board?.doneColumn) {
          doneColumnId = spaceData.config.workspaceConfig.board.doneColumn;
        }
      }
    } catch (e) {
      console.error("Error getting workspace config:", e);
    }
    
    // Create an object to track which issues are "done" by date
    const doneIssuesByDate = {};
    datePoints.forEach(date => {
      doneIssuesByDate[date] = new Set();
    });
    
    // Get history entries for these tickets
    const historyEntries = [];
    
    try {
      // Process tickets in batches for history query
      for (let i = 0; i < ticketIds.length; i += batchSize) {
        const batch = ticketIds.slice(i, i + batchSize);
        
        if (batch.length === 0) continue;
        
        const historyColRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'issueHistory');
        const historyQuery = query(
          historyColRef,
          where('issueId', 'in', batch),
          where('timestamp', '>=', startDate.getTime()),
          where('timestamp', '<=', endDate.getTime() + 86400000) // Include the full last day
        );
        
        const historySnapshot = await getDocs(historyQuery);
        historyEntries.push(...historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (historyError) {
      console.error('Error fetching history entries:', historyError);
      // Continue with any history entries we have
    }
    
    // Process history to mark when issues moved to "done"
    historyEntries.forEach(entry => {
      if (!entry.timestamp) return;
      
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      
      // Only process if the date is within our sprint range
      if (dailyData[entryDate]) {
        // If this history entry shows the issue moved to "done" status
        if (entry.status === doneColumnId) {
          // For all subsequent dates, mark this issue as done
          datePoints.forEach(date => {
            if (date >= entryDate) {
              doneIssuesByDate[date].add(entry.issueId);
            }
          });
        } else {
          // If the issue moved from "done" to another status, remove it from the done list
          // for this date and all subsequent dates
          datePoints.forEach(date => {
            if (date >= entryDate) {
              doneIssuesByDate[date].delete(entry.issueId);
            }
          });
        }
      }
    });
    
    // Calculate remaining points for each day
    datePoints.forEach(date => {
      let donePoints = 0;
      doneIssuesByDate[date].forEach(issueId => {
        donePoints += issuePoints[issueId] || 0;
      });
      
      // Round to one decimal place for more even numbers
      dailyData[date].remaining = Math.round((totalPoints - donePoints) * 10) / 10;
    });
    
    // Create actual burndown data points
    const actual = datePoints.map(date => [dailyData[date].date, dailyData[date].remaining]);
    
    // Create ideal burndown line points
    const ideal = [];
    const startValue = totalPoints;
    const dayCount = datePoints.length;
    
    // Avoid division by zero
    const divisor = Math.max(1, dayCount - 1);
    
    for (let i = 0; i < dayCount; i++) {
      // Round to one decimal place for more even numbers
      const idealRemaining = Math.round((startValue - ((startValue / divisor) * i)) * 10) / 10;
      ideal.push([dailyData[datePoints[i]].date, Math.max(0, idealRemaining)]);
    }
    
    return { actual, ideal, totalPoints };
  } catch (error) {
    console.error('Error generating burndown chart data:', error);
    // Return a valid data structure even on error
    return { 
      actual: [], 
      ideal: [], 
      totalPoints: 0 
    };
  }
};
