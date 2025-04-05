import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';
import { editOrgUser } from '../services/firestore';


const getOrgUsers = async (orgId) => {
  try {
    const docRef = doc(db, "organisation", orgId);
    const org = await getDoc(docRef)
    return org.data();
  } catch (error) {
    console.error('Error fetching items: ', error);
    throw new Error('Error fetching items');
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

  const q = query(collection(db, "users"), where("email", "==", values.email));
  const querySnapshot = await getDocs(q);

  const userUpdates = querySnapshot.docs.map(async doc => {
      await setDoc(doc.ref, fields, { merge: true });
      return getDoc(doc.ref); // Re-fetch the updated document
  });

  const updatedDocs = await Promise.all(userUpdates);

  // Call the editOrgUser function after updating the user
  await editOrgUser(updatedDocs.map(doc => doc.data()), updatedDocs.map(doc => doc.data()));
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