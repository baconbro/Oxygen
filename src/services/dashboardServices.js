import { collection, getDocs, query, where, doc, setDoc, orderBy, limit, deleteDoc, getDoc } from 'firebase/firestore';
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

// Activity Feed - aggregates recent activity across workspaces
export const getActivityFeed = async (orgId, userId, daysBack = 7) => {
  if (!orgId) return [];

  try {
    const activities = [];
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

    // Get all items updated recently
    const itemsColRef = collection(db, 'organisation', orgId, 'items');
    const recentItemsQuery = query(
      itemsColRef,
      where('updatedAt', '>=', cutoffTime),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const itemsSnapshot = await getDocs(recentItemsQuery);

    itemsSnapshot.docs.forEach(docSnap => {
      const item = { id: docSnap.id, ...docSnap.data() };

      // Determine activity type based on timestamps
      const wasCreatedRecently = item.createdAt && item.createdAt >= cutoffTime;
      const wasUpdatedAfterCreation = item.updatedAt && item.createdAt &&
        (item.updatedAt - item.createdAt > 60000); // More than 1 minute difference

      if (wasCreatedRecently && !wasUpdatedAfterCreation) {
        activities.push({
          id: `created-${item.id}`,
          type: 'item_created',
          itemId: item.id,
          itemTitle: item.title,
          projectId: item.projectId,
          userId: item.reporterId || item.createdBy,
          timestamp: item.createdAt,
          data: { itemType: item.type, priority: item.priority }
        });
      } else if (item.updatedAt >= cutoffTime) {
        // Check if status changed to 'done'
        if (item.status === 'done' || item.status === 'closed') {
          activities.push({
            id: `completed-${item.id}-${item.updatedAt}`,
            type: 'item_completed',
            itemId: item.id,
            itemTitle: item.title,
            projectId: item.projectId,
            userId: item.userIds?.[0],
            timestamp: item.updatedAt,
            data: { itemType: item.type }
          });
        } else {
          activities.push({
            id: `updated-${item.id}-${item.updatedAt}`,
            type: 'item_updated',
            itemId: item.id,
            itemTitle: item.title,
            projectId: item.projectId,
            userId: item.userIds?.[0],
            timestamp: item.updatedAt,
            data: { status: item.status }
          });
        }
      }

      // Check for assignments to current user
      if (item.userIds?.includes(userId) && item.createdAt >= cutoffTime) {
        activities.push({
          id: `assigned-${item.id}`,
          type: 'item_assigned',
          itemId: item.id,
          itemTitle: item.title,
          projectId: item.projectId,
          userId: item.reporterId,
          timestamp: item.createdAt,
          data: { assigneeId: userId }
        });
      }
    });

    // Sort by timestamp descending and dedupe
    const seen = new Set();
    return activities
      .filter(a => {
        const key = `${a.type}-${a.itemId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
};

export const useGetActivityFeed = (orgId, userId) => {
  return useQuery({
    queryKey: ['ActivityFeed', orgId, userId],
    queryFn: () => getActivityFeed(orgId, userId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

// Blocked Items - items with blocked status or unresolved blockers
export const getBlockedItems = async (orgId, userId) => {
  if (!orgId) return [];

  try {
    const itemsColRef = collection(db, 'organisation', orgId, 'items');

    // Query for items with blocked status
    const blockedQuery = query(
      itemsColRef,
      where('status', '==', 'blocked')
    );

    const blockedSnapshot = await getDocs(blockedQuery);
    const blockedItems = blockedSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      blockReason: 'status'
    }));

    // Also check for items with blockedBy field
    const withBlockersQuery = query(
      itemsColRef,
      where('blockedBy', '!=', null)
    );

    try {
      const withBlockersSnapshot = await getDocs(withBlockersQuery);
      withBlockersSnapshot.docs.forEach(docSnap => {
        const item = docSnap.data();
        // Only add if not already in blocked list and has actual blockers
        if (item.blockedBy?.length > 0 && !blockedItems.find(b => b.id === docSnap.id)) {
          blockedItems.push({
            id: docSnap.id,
            ...item,
            blockReason: 'dependency'
          });
        }
      });
    } catch {
      // blockedBy field might not exist, that's ok
    }

    // Filter for items relevant to user (assigned to them or they reported)
    const userRelevant = blockedItems.filter(item =>
      item.userIds?.includes(userId) || item.reporterId === userId
    );

    // Get project details for each item
    const projectCache = {};
    for (const item of userRelevant) {
      if (item.projectId && !projectCache[item.projectId]) {
        try {
          const spaceDoc = await getDoc(doc(db, 'organisation', orgId, 'spaces', item.projectId));
          if (spaceDoc.exists()) {
            projectCache[item.projectId] = spaceDoc.data().title || 'Unknown';
          }
        } catch {
          projectCache[item.projectId] = 'Unknown';
        }
      }
      item.projectName = projectCache[item.projectId] || 'Unknown';
    }

    return userRelevant.slice(0, 10);

  } catch (error) {
    console.error('Error fetching blocked items:', error);
    return [];
  }
};

export const useGetBlockedItems = (orgId, userId) => {
  return useQuery({
    queryKey: ['BlockedItems', orgId, userId],
    queryFn: () => getBlockedItems(orgId, userId),
    enabled: !!orgId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
