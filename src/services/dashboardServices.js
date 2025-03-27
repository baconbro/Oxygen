import { collection, getDocs, query, where } from 'firebase/firestore';
import { useQuery } from 'react-query';
import { db } from './firestore';
import { getSpaceConfig } from './workspaceServices';

export const getAssignedTasks = async (userId, orgId) => {
  try {
    // Query the items collection for tasks assigned to the user
    const itemsColRef = collection(db, "organisation", orgId, "items");
    const q = query(itemsColRef, where("userIds", "array-contains", userId));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch workspace config to add project details and status configurations
    const projectDetails = {};
    for (const task of tasks) {
      if (!projectDetails[task.projectId]) {
        const workspace = await getSpaceConfig(task.projectId, orgId);
        projectDetails[task.projectId] = {
          name: workspace?.title || 'Unknown Project',
          id: task.projectId,
          statusConfig: workspace?.config?.issueStatus || []
        };
      }
    }
    
    // Enhance tasks with project details including status configuration
    return tasks.map(task => {
      const details = projectDetails[task.projectId] || { 
        name: 'Unknown Project', 
        id: task.projectId,
        statusConfig: []
      };
      
      // Find status name and color information if available
      let statusName = null;
      let statusColor = null;
      
      if (task.status && details.statusConfig && details.statusConfig.length > 0) {
        const statusConfig = details.statusConfig.find(s => s.id === task.status);
        if (statusConfig) {
          statusName = statusConfig.name;
          statusColor = statusConfig.borderColor;
        }
      }
      
      return {
        ...task,
        projectDetails: details,
        statusName,
        statusColor
      };
    });
  } catch (error) {
    console.error('Error fetching assigned tasks: ', error);
    throw new Error('Error fetching assigned tasks');
  }
};

export const useGetAssignedTasks = (userId, orgId) => {
  return useQuery(['AssignedTasks', userId, orgId], () => getAssignedTasks(userId, orgId), {
    enabled: !!userId && !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
