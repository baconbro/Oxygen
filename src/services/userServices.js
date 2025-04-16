import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, deleteDoc, getDoc, batch, deleteField, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';
import { auth } from '../services/firestore';

export const getOrgUsers = async (orgId) => {
  try {
    
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

export const inviteUser = async (email, orgId) => {
    //check if user email exist
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
        const docRef = doc(db, "users", querySnapshot.docs[0].id);
        const user = await getDoc(docRef)
        const orgs = user.data().orgs
        const uid = user.data().uid
        if (orgs.includes(orgId)) {
            throw new Error("User is already a member of this organisation.")
        } else {
            orgs.push(orgId)
            await setDoc(docRef, { orgs: orgs }, { merge: true })
            return await addUserToOrg(email, orgId, uid)
        }
    } else {
        //user do not exist
        //create an empty user
        const userData = await addDoc(collection(db, "users"), {
            uid: '',
            email: email,
            id: Math.floor(Math.random() * 1000000000000) + 1, //number, because it needed somwhere in the code. Maybe not valuable
            lastlogin: serverTimestamp(),
            invited: serverTimestamp(),
            invitedBy: auth.currentUser.email,
            currentOrg: orgId,
            orgs: [orgId],
        });

        const falsUid = Math.floor(Math.random() * 1000000000000) + 1;
        return await addUserToOrg(email, orgId, falsUid)
    }
};

export const addUserToOrg = async (email, orgId, uid) => {
    //test if uid is a number
    if (isNaN(uid)) {
        var status = 'member'
    } else {
        var status = 'unregistered'
    }

    const feild =
    {
        email: email,
        joined: Math.floor(Date.now()),
        role: 'member',
        status: status,
    }
    
    // Get the count of users to enforce limit
    const usersColRef = collection(db, "organisation", orgId, "users");
    const querySnapshot = await getDocs(usersColRef);
    
    if (querySnapshot.size < 10) {
      // Create a document reference with the specific UID
      const userDocRef = doc(db, "organisation", orgId, "users", uid.toString());
      
      // Use setDoc instead of addDoc to ensure the document is created with the specific UID
      await setDoc(userDocRef, feild);
      
      return { success: true, uid };
    } else {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.");
    }
}

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