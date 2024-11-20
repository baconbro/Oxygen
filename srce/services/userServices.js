import { getFirestore, collection, getDocs, addDoc, updateDoc, doc,query,where,setDoc ,deleteDoc,getDoc} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';


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
  console.log('userEmail: ', userEmail, 'userId: ', userId);
  try {
    let q;
    if (userId) {
      q = query(collection(db, "users"), where("uid", "==", userId));
    } else {
      console.log('userEmail: ', userEmail);
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