import { collection, getDocs, query, where, doc, setDoc, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: ['AssignedTasks', userId, orgId],
    queryFn: () => getAssignedTasks(userId, orgId),
    enabled: !!userId && !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Recently Viewed Items
const MAX_RECENT_ITEMS = 15;

export const trackRecentlyViewed = async (userId, item) => {
  if (!userId || !item?.id) return;

  try {
    const recentRef = doc(db, 'users', userId, 'recentViews', item.id);
    await setDoc(recentRef, {
      itemId: item.id,
      title: item.title || 'Untitled',
      projectId: item.projectId,
      projectName: item.projectName || '',
      type: item.type || 'task',
      viewedAt: Date.now(),
    });

    // Cleanup old entries (keep only MAX_RECENT_ITEMS)
    const recentColRef = collection(db, 'users', userId, 'recentViews');
    const recentQuery = query(recentColRef, orderBy('viewedAt', 'desc'));
    const snapshot = await getDocs(recentQuery);

    if (snapshot.docs.length > MAX_RECENT_ITEMS) {
      const docsToDelete = snapshot.docs.slice(MAX_RECENT_ITEMS);
      for (const docToDelete of docsToDelete) {
        await deleteDoc(docToDelete.ref);
      }
    }
  } catch (error) {
    console.error('Error tracking recently viewed: ', error);
  }
};

export const getRecentlyViewed = async (userId) => {
  if (!userId) return [];

  try {
    const recentColRef = collection(db, 'users', userId, 'recentViews');
    const recentQuery = query(recentColRef, orderBy('viewedAt', 'desc'), limit(MAX_RECENT_ITEMS));
    const snapshot = await getDocs(recentQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recently viewed: ', error);
    return [];
  }
};

export const useGetRecentlyViewed = (userId) => {
  return useQuery({
    queryKey: ['RecentlyViewed', userId],
    queryFn: () => getRecentlyViewed(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTrackRecentlyViewed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, item }) => trackRecentlyViewed(userId, item),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['RecentlyViewed', userId]);
    },
  });
};

// Get all active sprints across workspaces for a user
export const getActiveSprints = async (orgId) => {
  if (!orgId) return [];

  try {
    // Get all workspaces in the org
    const spacesColRef = collection(db, 'organisation', orgId, 'spaces');
    const spacesSnapshot = await getDocs(spacesColRef);

    const allSprints = [];
    const now = new Date();

    for (const spaceDoc of spacesSnapshot.docs) {
      const sprintsColRef = collection(db, 'organisation', orgId, 'spaces', spaceDoc.id, 'sprints');
      const sprintsSnapshot = await getDocs(sprintsColRef);

      sprintsSnapshot.docs.forEach(sprintDoc => {
        const sprint = { id: sprintDoc.id, ...sprintDoc.data(), workspaceId: spaceDoc.id };

        // Check if sprint is active
        if (sprint.startDate && sprint.endDate) {
          const start = new Date(sprint.startDate);
          const end = new Date(sprint.endDate);
          if (now >= start && now <= end) {
            allSprints.push(sprint);
          }
        } else if (sprint.status === 'active') {
          allSprints.push(sprint);
        }
      });
    }

    return allSprints;
  } catch (error) {
    console.error('Error fetching active sprints: ', error);
    return [];
  }
};

export const useGetActiveSprints = (orgId) => {
  return useQuery({
    queryKey: ['ActiveSprints', orgId],
    queryFn: () => getActiveSprints(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
