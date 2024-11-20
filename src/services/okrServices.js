import { getFirestore, collection, getDocs, addDoc, updateDoc, doc,query,where,setDoc ,deleteDoc} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';
import { useAuth } from '../modules/auth'


 const fetchOKRs = async (orgId) => {
  try {
    const okrCollection = collection(db, "organisation", orgId, "goals");
    const snapshot = await getDocs(okrCollection);
    const okrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return okrs;
  } catch (error) {
    console.error('Error fetching OKRs: ', error);
    throw new Error('Error fetching OKRs');
  }
};

 const addOKR = async ( okr,orgId) => {
  try {
    const okrCollection = collection(db, "organisation", orgId, "goals");
    okr.id = Math.floor(Math.random() * 1000000000000) + 1;
    okr.createdAt = Math.floor(Date.now());
    const docRef = await addDoc(okrCollection, okr);
    return { id: docRef.id, ...okr };
  } catch (error) {
    console.error('Error adding OKR: ', error);
    throw new Error('Error adding OKR');
  }
};

const updateOKR = async (orgId, feild, itemId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        setDoc(doc.ref, feild, { merge: true });
        setDoc(doc.ref, { updatedAt: Math.floor(Date.now()) }, { merge: true });
    });
    const firstDoc = querySnapshot.docs[0];
    const firstDocData = firstDoc.data();
    return { firstDocData };
  } catch (error) {
    console.error('Error updating OKR: ', error);
    throw new Error('Error updating OKR');
  }
};

const deleteOKR = async (orgId, itemId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        // doc.data() is never undefined for query doc snapshots
        deleteDoc(doc.ref)
    });
    const firstDoc = querySnapshot.docs[0];
    const firstDocData = firstDoc.data();
    return { firstDocData };
  } catch (error) {
    console.error('Error deleting OKR: ', error);
    throw new Error('Error deleting OKR');
  }
};

// React Query hooks
export const useFetchOKRs = (orgId) => {
    return useQuery(['okrs', orgId], () => fetchOKRs(orgId), {
      enabled: !!orgId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
export const useAddOKR = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ okr, orgId }) => addOKR(okr, orgId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['okrs', orgId]);
    },
  });

  return mutation.mutate;
};
  
  export const useUpdateOKR = () => {
    const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, feild, itemId}) => updateOKR(orgId, feild, itemId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['okrs', orgId]);
    },
  });

  return mutation.mutate;
};

export const useDeleteOKR = () => {
    const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, itemId}) => deleteOKR(orgId, itemId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['okrs', orgId]);
    },
  });

  return mutation.mutate;
};
