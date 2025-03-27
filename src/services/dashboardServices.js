import { collection, getDocs, query, where } from 'firebase/firestore';
import { useQuery } from 'react-query';
import { db } from './firestore';
import { getSpace } from './workspaceServices';

export const getAssignedTasks = async (userId, orgId) => {
  try {
    // Query the items collection for tasks assigned to the user
    const itemsColRef = collection(db, "organisation", orgId, "items");
    const q = query(itemsColRef, where("userIds", "array-contains", userId));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch workspace info to add project names
    const projectDetails = {};
    for (const task of tasks) {
      if (!projectDetails[task.projectId]) {
        const workspace = await getSpace(task.projectId, orgId);
        console.log('workspace: ', workspace);
        projectDetails[task.projectId] = {
          name: workspace?.title || 'Unknown Project',
          id: task.projectId
        };
      }
    }
    
    return tasks.map(task => ({
      ...task,
      projectDetails: projectDetails[task.projectId] || { name: 'Unknown Project', id: task.projectId }
    }));
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
