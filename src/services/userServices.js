import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, deleteDoc, getDoc, batch, deleteField } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';

// New function to migrate users from old structure to subcollection
export const migrateOrgUsers = async (orgId) => {
  try {
    // First, check if the organization document has a users field
    const orgRef = doc(db, "organisation", orgId);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      console.warn(`Organization with ID ${orgId} does not exist.`);
      return false;
    }
    
    const orgData = orgDoc.data();
    const usersInOrgDoc = orgData.users;
    
    if (!usersInOrgDoc || Object.keys(usersInOrgDoc).length === 0) {
      // No users in the old structure, nothing to migrate
      return false;
    }
    
    console.log(`Found ${Object.keys(usersInOrgDoc).length} users to migrate in org ${orgId}`);
    
    // Create a batch for atomic operations
    const batchWrite = db.batch();
    
    // Check if users already exist in subcollection to avoid duplicates
    const usersColRef = collection(db, "organisation", orgId, "users");
    const existingUsersSnapshot = await getDocs(usersColRef);
    const existingUserIds = new Set();
    
    existingUsersSnapshot.forEach(doc => {
      existingUserIds.add(doc.id);
    });
    
    // Transfer each user to the subcollection
    let migratedCount = 0;
    for (const [userId, userData] of Object.entries(usersInOrgDoc)) {
      if (!existingUserIds.has(userId)) {
        const userDocRef = doc(db, "organisation", orgId, "users", userId);
        batchWrite.set(userDocRef, userData);
        migratedCount++;
      }
    }
    
    if (migratedCount > 0) {
      // After migrating all users, remove the users field from the org document
      batchWrite.update(orgRef, { users: deleteField() });
      
      // Commit the batch
      await batchWrite.commit();
      console.log(`Successfully migrated ${migratedCount} users to subcollection for org ${orgId}`);
      return true;
    } else {
      console.log("No new users to migrate");
      return false;
    }
  } catch (error) {
    console.error("Error migrating users:", error);
    return false;
  }
};

export const getOrgUsers = async (orgId) => {
  try {
    // First, try to migrate any users from the old structure
    await migrateOrgUsers(orgId);
    
    // Then fetch from the subcollection
    const usersColRef = collection(db, "organisation", orgId, "users");
    const querySnapshot = await getDocs(usersColRef);
    
    // Transform into an object with uid as keys for backward compatibility
    const users = {};
    querySnapshot.forEach((doc) => {
      users[doc.id] = doc.data();
    });
    
    return { users };
  } catch (error) {
    console.error('Error fetching users: ', error);
    throw new Error('Error fetching users');
  }
};

export const getUser = async (userEmail, userId) => {
  try {
    let q;
    if (userId) {
      q = query(collection(db, "users"), where("uid", "==", userId));
    } else {
      q = query(collection(db, "users"), where("email", "==", userEmail));
    }
    const querySnapshot = await getDocs(q);
    // Return the querySnapshot directly
    return querySnapshot;
  } catch (error) {
    console.error('Error fetching user: ', error);
    throw new Error('Error fetching user');
  }
};

export const editUser = async (values, fields) => {
  if (!fields) { fields = {} }

  // Exit the function if no currentOrg is provided
  if (!values.all.currentOrg) {
      console.warn("No currentOrg provided. Exiting editOrgUser.");
      return;
  }

  const orgId = values.all.currentOrg;
  const userEmail = values.all.email;
  
  // Find user with matching email in the subcollection
  const usersColRef = collection(db, "organisation", orgId, "users");
  const q = query(usersColRef, where("email", "==", userEmail));
  const querySnapshot = await getDocs(q);
  
  // Update the user document with the new fields
  const updates = querySnapshot.docs.map(doc => {
      return setDoc(doc.ref, { ...fields }, { merge: true });
  });
  
  return Promise.all(updates);
};

// React Query hooks
export const useGetOrgUsers= (orgId) => {
  return useQuery(['Users', orgId], () => getOrgUsers(orgId), {
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetUser= (userEmail, userId) => {
  return useQuery(['User', userEmail], () => getUser(userEmail, userId), {
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for editing user data with React Query
 * @returns {Object} mutation object with mutate function, isLoading, isError, etc.
 */
export const useEditUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    // Mutation function that accepts an object with values and fields
    async ({ values, fields }) => {
      return await editUser(values, fields);
    },
    {
      // When mutation is successful, invalidate any queries that include the user
      onSuccess: (data, variables) => {
        // Invalidate any queries that include the user's email
        queryClient.invalidateQueries(['User', variables.values.email]);
        
        // If the user belongs to an organization, invalidate those queries too
        if (variables.values.currentOrg) {
          queryClient.invalidateQueries(['Users', variables.values.currentOrg]);
        }
        
        // Return the data for chaining
        return data;
      },
    }
  );
};