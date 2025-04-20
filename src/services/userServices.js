import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, deleteDoc, getDoc, batch, deleteField, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';
import { auth } from '../services/firestore';

export const getOrgUsers = async (orgId) => {
  try {
    // Fetch from the subcollection
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
    // First try to get the user from users collection (for routing info)
    let userRef;
    if (userId) {
      userRef = doc(db, "users", userId);
    } else {
      const q = query(collection(db, "users"), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        userRef = querySnapshot.docs[0].ref;
      } else {
        throw new Error('User not found');
      }
    }
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Then enhance with data from org subcollection if available
    if (userData.currentOrg) {
      const orgUserRef = doc(db, "organisation", userData.currentOrg, "users", userDoc.id);
      const orgUserDoc = await getDoc(orgUserRef);
      
      if (orgUserDoc.exists()) {
        // Create a new snapshot-like object with combined data
        const enhancedData = {
          ...userData,
          ...orgUserDoc.data()
        };
        
        return [{
          data: () => enhancedData,
          id: userDoc.id
        }];
      }
    }
    
    // Return original user data if we couldn't enhance it
    return [{
      data: () => userData,
      id: userDoc.id
    }];
  } catch (error) {
    console.error('Error fetching user: ', error);
    throw new Error('Error fetching user');
  }
};

export const editUser = async (values, fields) => {
  if (!fields) { fields = {} }

  // Exit the function if no currentOrg is provided
  if (!values.all?.currentOrg) {
      console.warn("No currentOrg provided. Exiting editUser.");
      return;
  }

  const orgId = values.all.currentOrg;
  const userEmail = values.all.email;
  const userId = values.all.uid;
  
  try {
    // Update the user in the organization subcollection (main source of truth)
    const orgUserRef = doc(db, "organisation", orgId, "users", userId);
    await setDoc(orgUserRef, fields, { merge: true });
    
    // Only update routing-relevant fields in the users collection
    if (fields.email || fields.displayName || fields.photoURL) {
      const userRef = doc(db, "users", userId);
      const updateFields = {};
      
      if (fields.email) updateFields.email = fields.email;
      if (fields.displayName) updateFields.displayName = fields.displayName;
      if (fields.photoURL) updateFields.photoURL = fields.photoURL;
      
      await setDoc(userRef, updateFields, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user: ', error);
    throw new Error('Error updating user');
  }
};

export const inviteUser = async (email, orgId) => {
  email = email.toLowerCase().trim();
  
  try {
    // Check if user already exists
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    // Check if there's an existing invitation within this organization
    const orgInvitesRef = collection(db, "organisation", orgId, "invitations");
    const existingOrgInviteQuery = query(orgInvitesRef, where("email", "==", email));
    const existingOrgInviteSnapshot = await getDocs(existingOrgInviteQuery);
    
    if (!existingOrgInviteSnapshot.empty) {
      throw new Error("This user already has a pending invitation to this organization.");
    }
    
    // If user exists
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      
      // If user already belongs to any org, they can't join another
      if (userData.orgs && userData.orgs.length > 0) {
        throw new Error("User already belongs to an organization.");
      }
    }
    
    // Get the total count of users in the organization
    const usersColRef = collection(db, "organisation", orgId, "users");
    const usersSnapshot = await getDocs(usersColRef);
    
    if (usersSnapshot.size >= 10) {
      throw new Error("Free plan is limited to 10 users. Please upgrade plan.");
    }
    
    // Create invitation in organization subcollection
    const invitationData = {
      email: email,
      invitedAt: serverTimestamp(),
      invitedBy: auth.currentUser.email,
      role: 'member',
      status: 'pending'
    };
    
    // Create invitation record
    await addDoc(collection(db, "organisation", orgId, "invitations"), invitationData);
    
    // Create a small reference in the global email-invitations lookup for quick searching
    await addDoc(collection(db, "email-invitations"), {
      email: email,
      orgId: orgId,
      createdAt: serverTimestamp()
    });
    
    // Generate a temporary UID for the invited user
    const temporaryUid = `temp-${Math.floor(Math.random() * 1000000000000)}`;
    
    // Create an unregistered user entry in the organization's users subcollection
    const userDocRef = doc(db, "organisation", orgId, "users", temporaryUid);
    await setDoc(userDocRef, {
      email: email,
      role: 'member',
      status: 'unregistered',
      joined: Math.floor(Date.now()),
      invitedAt: serverTimestamp(),
      invitedBy: auth.currentUser.email
    });
    
    return { 
      success: true,
      temporaryUid,
      message: "Invitation sent successfully!" 
    };
  } catch (error) {
    console.error('Error inviting user: ', error);
    throw error;
  }
};

// Simplified - use inviteUser instead
export const addUserToOrg = async (email, orgId, uid) => {
  return inviteUser(email, orgId);
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

/**
 * Removes a user from an organization
 * @param {Object} user - The user to remove
 * @param {string} orgId - The organization ID
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeUserFromOrganization = async (user, orgId) => {
  try {
    // Check if user is not the owner
    if (user.role === 'owner') {
      throw new Error("Cannot remove the owner of the organization");
    }
    
    // Get reference to the user document in org subcollection
    const userDocRef = doc(db, "organisation", orgId, "users", user.id);
    
    // Delete the user from org
    await deleteDoc(userDocRef);
    
    // Update the user's root document to remove org reference
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, {
      currentOrg: deleteField(),
      orgs: []
    });
    
    return { success: true, message: "User removed from organization" };
  } catch (error) {
    console.error('Error removing user from organization:', error);
    throw error;
  }
};

/**
 * Invites a user to join an organization with improved error handling
 * @param {string} email - Email of the user to invite
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object>} - Result of the invitation
 */
export const inviteUserToOrganization = async (email, orgId) => {
  try {
    const result = await inviteUser(email, orgId);
    return {
      success: true,
      message: "Invitation sent successfully!"
    };
  } catch (error) {
    console.error('Error inviting user to organization:', error);
    throw error;
  }
};