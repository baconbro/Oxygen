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

// Global Search - search across items, projects, goals
export const globalSearch = async (orgId, searchQuery, options = {}) => {
  if (!orgId || !searchQuery || searchQuery.length < 2) return { items: [], projects: [], goals: [] };

  const results = { items: [], projects: [], goals: [] };
  const queryLower = searchQuery.toLowerCase();
  const maxResults = options.maxResults || 10;

  try {
    // Search items
    const itemsColRef = collection(db, 'organisation', orgId, 'items');
    const itemsSnapshot = await getDocs(itemsColRef);

    itemsSnapshot.docs.forEach(docSnap => {
      const item = { id: docSnap.id, ...docSnap.data() };
      const titleMatch = item.title?.toLowerCase().includes(queryLower);
      const descMatch = item.description?.toLowerCase().includes(queryLower);
      const idMatch = String(item.id).includes(searchQuery);

      if (titleMatch || descMatch || idMatch) {
        results.items.push({
          ...item,
          matchType: titleMatch ? 'title' : descMatch ? 'description' : 'id',
          type: 'item',
          icon: item.type === 'bug' ? 'bi-bug' : item.type === 'story' ? 'bi-book' : 'bi-check2-square'
        });
      }
    });

    // Search projects/workspaces
    const spacesColRef = collection(db, 'organisation', orgId, 'spaces');
    const spacesSnapshot = await getDocs(spacesColRef);

    spacesSnapshot.docs.forEach(docSnap => {
      const space = { id: docSnap.id, ...docSnap.data() };
      const titleMatch = space.title?.toLowerCase().includes(queryLower);
      const acronymMatch = space.acronym?.toLowerCase().includes(queryLower);

      if (titleMatch || acronymMatch) {
        results.projects.push({
          ...space,
          matchType: titleMatch ? 'title' : 'acronym',
          type: 'project',
          icon: 'bi-folder'
        });
      }
    });

    // Search goals
    const goalsColRef = collection(db, 'organisation', orgId, 'goals');
    const goalsSnapshot = await getDocs(goalsColRef);

    goalsSnapshot.docs.forEach(docSnap => {
      const goal = { id: docSnap.id, ...docSnap.data() };
      const titleMatch = goal.title?.toLowerCase().includes(queryLower);
      const nameMatch = goal.name?.toLowerCase().includes(queryLower);

      if (titleMatch || nameMatch) {
        results.goals.push({
          ...goal,
          matchType: 'title',
          type: 'goal',
          icon: 'bi-trophy'
        });
      }
    });

    // Limit results
    results.items = results.items.slice(0, maxResults);
    results.projects = results.projects.slice(0, 5);
    results.goals = results.goals.slice(0, 5);

    return results;
  } catch (error) {
    console.error('Error in global search:', error);
    return { items: [], projects: [], goals: [] };
  }
};

// Waiting for Review - items in review status that user created/reported
export const getWaitingForReview = async (orgId, userId) => {
  if (!orgId || !userId) return [];

  try {
    const itemsColRef = collection(db, 'organisation', orgId, 'items');

    // Query for items in review status
    const reviewQuery = query(
      itemsColRef,
      where('status', 'in', ['review', 'in_review', 'inReview', 'code_review'])
    );

    const reviewSnapshot = await getDocs(reviewQuery);
    const reviewItems = [];

    reviewSnapshot.docs.forEach(docSnap => {
      const item = { id: docSnap.id, ...docSnap.data() };

      // Only include items the user reported or is assigned to
      const isReporter = item.reporterId === userId;
      const isAssigned = item.userIds?.includes(userId);

      if (isReporter || isAssigned) {
        // Calculate days in review
        const daysInReview = item.updatedAt
          ? Math.floor((Date.now() - item.updatedAt) / (1000 * 60 * 60 * 24))
          : 0;

        reviewItems.push({
          ...item,
          daysInReview,
          isReporter,
          isAssigned
        });
      }
    });

    // Get project names
    const projectCache = {};
    for (const item of reviewItems) {
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

    // Sort by days in review (longest first)
    return reviewItems
      .sort((a, b) => b.daysInReview - a.daysInReview)
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching waiting for review:', error);
    return [];
  }
};

export const useGetWaitingForReview = (orgId, userId) => {
  return useQuery({
    queryKey: ['WaitingForReview', orgId, userId],
    queryFn: () => getWaitingForReview(orgId, userId),
    enabled: !!orgId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Favorites - user's starred items, projects, goals
export const getFavorites = async (userId) => {
  if (!userId) return [];

  try {
    const favoritesColRef = collection(db, 'users', userId, 'favorites');
    const favoritesQuery = query(favoritesColRef, orderBy('addedAt', 'desc'), limit(20));
    const snapshot = await getDocs(favoritesQuery);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const addFavorite = async (userId, item) => {
  if (!userId || !item?.id) return;

  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', String(item.id));
    await setDoc(favoriteRef, {
      itemId: item.id,
      title: item.title || item.name || 'Untitled',
      type: item.type || 'item', // 'item', 'project', 'goal'
      projectId: item.projectId || null,
      projectName: item.projectName || null,
      addedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (userId, itemId) => {
  if (!userId || !itemId) return;

  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', String(itemId));
    await deleteDoc(favoriteRef);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const useGetFavorites = (userId) => {
  return useQuery({
    queryKey: ['Favorites', userId],
    queryFn: () => getFavorites(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, item }) => addFavorite(userId, item),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['Favorites', userId]);
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, itemId }) => removeFavorite(userId, itemId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['Favorites', userId]);
    },
  });
};

// Workload - calculate user's current workload
export const getWorkload = async (orgId, userId) => {
  if (!orgId || !userId) return null;

  try {
    const itemsColRef = collection(db, 'organisation', orgId, 'items');

    // Get all items assigned to user
    const assignedQuery = query(
      itemsColRef,
      where('userIds', 'array-contains', userId)
    );

    const assignedSnapshot = await getDocs(assignedQuery);
    const assignedItems = assignedSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Calculate workload metrics
    const activeStatuses = ['todo', 'inprogress', 'in_progress', 'inProgress', 'review', 'in_review'];
    const doneStatuses = ['done', 'closed', 'complete', 'completed'];

    const activeItems = assignedItems.filter(item =>
      activeStatuses.includes(item.status) ||
      (!doneStatuses.includes(item.status) && item.status !== 'backlog')
    );

    const inProgressItems = assignedItems.filter(item =>
      item.status === 'inprogress' || item.status === 'in_progress' || item.status === 'inProgress'
    );

    const highPriorityItems = activeItems.filter(item =>
      item.priority === 'highest' || item.priority === 'high'
    );

    // Calculate story points if available
    const totalStoryPoints = activeItems.reduce((sum, item) =>
      sum + (item.storyPoints || 0), 0
    );

    // Calculate overdue items
    const now = Date.now();
    const overdueItems = activeItems.filter(item => {
      if (!item.dueDate) return false;
      return new Date(item.dueDate).getTime() < now;
    });

    // Default capacity (can be made configurable)
    const defaultCapacity = 10; // items
    const defaultStoryPointCapacity = 20; // story points

    const workloadPercent = Math.min(100, Math.round((activeItems.length / defaultCapacity) * 100));
    const storyPointPercent = totalStoryPoints > 0
      ? Math.min(100, Math.round((totalStoryPoints / defaultStoryPointCapacity) * 100))
      : null;

    return {
      totalAssigned: assignedItems.length,
      activeItems: activeItems.length,
      inProgress: inProgressItems.length,
      highPriority: highPriorityItems.length,
      overdue: overdueItems.length,
      storyPoints: totalStoryPoints,
      workloadPercent,
      storyPointPercent,
      capacity: defaultCapacity,
      status: workloadPercent >= 100 ? 'overloaded' : workloadPercent >= 75 ? 'high' : workloadPercent >= 50 ? 'moderate' : 'light'
    };

  } catch (error) {
    console.error('Error calculating workload:', error);
    return null;
  }
};

export const useGetWorkload = (orgId, userId) => {
  return useQuery({
    queryKey: ['Workload', orgId, userId],
    queryFn: () => getWorkload(orgId, userId),
    enabled: !!orgId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Dashboard Configuration - user's widget preferences
export const getDashboardConfig = async (userId) => {
  if (!userId) return null;

  try {
    const configRef = doc(db, 'users', userId, 'preferences', 'dashboard');
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      return configSnap.data();
    }

    // Return default config
    return {
      widgetOrder: [
        'focusToday',
        'sprintProgress',
        'goalsProgress',
        'blockedItems',
        'activityFeed',
        'waitingForReview',
        'recentlyViewed',
        'favorites',
        'workload',
        'myWork',
        'lastWeek'
      ],
      hiddenWidgets: [],
      compactMode: false,
    };
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    return null;
  }
};

export const saveDashboardConfig = async (userId, config) => {
  if (!userId) return;

  try {
    const configRef = doc(db, 'users', userId, 'preferences', 'dashboard');
    await setDoc(configRef, {
      ...config,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error saving dashboard config:', error);
    throw error;
  }
};

export const useGetDashboardConfig = (userId) => {
  return useQuery({
    queryKey: ['DashboardConfig', userId],
    queryFn: () => getDashboardConfig(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useSaveDashboardConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, config }) => saveDashboardConfig(userId, config),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['DashboardConfig', userId]);
    },
  });
};
