import { collection, getDocs, addDoc, query, where, setDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';
import { recordStatusChange } from './issueHistoryServices';

const getItems = async (id, orgId) => {
  try {
    const subColRef = collection(db, "organisation", orgId, "items");
    const q = query(subColRef, where("projectId", "==", id))
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error('Error fetching items: ', error);
    throw new Error('Error fetching items');
  }
};

const updateItem = async (orgId, field, itemId, workspaceId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "items"),
      where("id", "==", parseInt(itemId)),
      where("projectId", "==", workspaceId),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const currentData = doc.data();
      
      // Check if the status is being updated
      if (field.status && field.status !== currentData.status) {
        console.log('Status change detected');
        
        // Normalize data before recording to ensure consistent field names
        const issueData = { ...currentData, ...field };
        
        // Ensure storyPoints exists (might be called storypoint in some places)
        if (issueData.storypoint !== undefined && issueData.storyPoints === undefined) {
          issueData.storyPoints = issueData.storypoint;
        }
        
        // Record this status change in history
        try {
          await recordStatusChange(
            orgId,
            workspaceId,
            parseInt(itemId),
            field.status,
            issueData
          );
        } catch (historyError) {
          console.error("Error recording status history:", historyError);
          // Continue with the update even if history recording fails
        }
      }
      
      await setDoc(doc.ref, field, { merge: true });
      await setDoc(doc.ref, { updatedAt: Math.floor(Date.now()) }, { merge: true });
      return 'Update successful';
    } else {
      return 'No matching document found';
    }
  } catch (error) {
    console.error('Error updating item: ', error);
    return 'Update failed';
  }
};

const addItem = async (orgId, item, userId) => {
  try {
    const itemsColRef = collection(db, "organisation", orgId, "items")

    const items = await getItems(item.projectId, orgId);
    let maxId = 0;
    // Iterate through the items to find the maximum ID
    items.forEach((item) => {
      const id = item.id;
      if (id > maxId) {
        maxId = id;
      }
    });
    // Generate the new ID by incrementing the maximum ID
    const newId = maxId + 1;

    // Create the new item object with base properties
    const newItem = {
      createdAt: Math.floor(Date.now()),
      updatedAt: Math.floor(Date.now()),
      type: item.type,
      title: item.title,
      description: item.description,
      reporterId: item.reporterId,
      userIds: item.userIds,
      priority: item.priority,
      status: item.status,
      projectId: item.projectId,
      users: item.users,
      listPosition: item.listPosition,
      id: newId
    };

    // Add any additional properties from the item object (including sprintId if present)
    Object.keys(item).forEach(key => {
      if (!newItem.hasOwnProperty(key) && key !== 'id') {
        newItem[key] = item[key];
      }
    });

    // Note: The explicit parent check is no longer needed as it's handled by the code above
    // but we're keeping the comment to show the intent of the original code
    // If the item has a parent, add it to the item object (now handled dynamically)
    
    // Add the new item to the collection
    const docRef = await addDoc(itemsColRef, newItem);
    
    // Create a history entry for the initial status
    try {
      await recordStatusChange(
        orgId,
        item.projectId, // This is the workspace/space ID
        newId,
        item.status,
        newItem
      );
      console.log('Created initial history entry for new item:', newId);
    } catch (historyError) {
      console.error("Error recording initial status history:", historyError);
      // Continue even if history recording fails
    }
    
    return { id: docRef.id, ...newItem }; // Return the created item with ID
  } catch (error) {
    console.error('Error adding item: ', error);
    return 'Add failed';
  }
};

const deleteItem = async (orgId, itemId) => {
  const q = query(collection(db, "organisation", orgId, "items"), where("id", "==", parseInt(itemId)));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    // doc.data() is never undefined for query doc snapshots
    deleteDoc(doc.ref)
  });
};

const getItem = async (goalId, orgId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "items"), where("goalLink", "==", goalId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const itemDoc = querySnapshot.docs[0];
      return { id: itemDoc.id, ...itemDoc.data() };
    } else {
      throw new Error('Item not found');
    }
  } catch (error) {
    console.error('Error fetching item: ', error);
    throw new Error('Error fetching item');
  }
};


// React Query hooks
export const useGetItems = (id, orgId) => {
  return useQuery(['Items', orgId], () => getItems(id, orgId), {
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, field, itemId, workspaceId }) => updateItem(orgId, field, itemId, workspaceId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['Items', orgId]);
    },
  });
  return mutation.mutate;
}

export const useAddItem = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, item, userId }) => addItem(orgId, item, userId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['Items', orgId]);
    },
  });

  return mutation.mutate;
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, itemId }) => deleteItem(orgId, itemId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['Items', orgId]);
    },
  });
  return mutation.mutate;
};

export const useGetItem = (goalId, orgId) => {
  return useQuery(['Item', goalId, orgId], () => getItem(goalId, orgId), {
    enabled: !!goalId && !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
