import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firestore';
import { recordStatusChange } from '../services/issueHistoryServices';

/**
 * Backfills issue history for existing issues that don't have historical data
 * @param {string} orgId Organization ID
 * @param {string} spaceId Workspace/Space ID
 */
export const backfillIssueHistory = async (orgId, spaceId) => {
  try {
    console.log(`Starting history backfill for space ${spaceId} in org ${orgId}...`);
    
    // Get all issues for this workspace
    const issuesQuery = query(
      collection(db, "organisation", orgId, "items"),
      where("projectId", "==", spaceId)
    );
    const issuesSnapshot = await getDocs(issuesQuery);
    const issues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${issues.length} issues to process`);
    
    // For each issue, create an initial history entry with its current status
    for (const issue of issues) {
      // Check the updated timestamp of the issue
      const timestamp = issue.updatedAt || Date.now();
      
      // Normalize the issue data
      const normalizedIssue = { ...issue };
      
      // Ensure storyPoints exists (might be called storypoint in some places)
      if (normalizedIssue.storypoint !== undefined && normalizedIssue.storyPoints === undefined) {
        normalizedIssue.storyPoints = normalizedIssue.storypoint;
      }
      
      // Record the current status as a history entry
      try {
        await recordStatusChange(
          orgId,
          spaceId,
          issue.id,
          issue.status,
          normalizedIssue,
          timestamp
        );
        console.log(`Created history entry for issue ${issue.id}`);
      } catch (error) {
        console.error(`Error creating history for issue ${issue.id}:`, error);
      }
    }
    
    console.log('Backfill complete!');
  } catch (error) {
    console.error('Error during history backfill:', error);
  }
};
