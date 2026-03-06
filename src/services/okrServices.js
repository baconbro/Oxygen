import { collection, getDocs, addDoc, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../services/firestore';


const fetchOKRs = async (orgId) => {
  const okrCollection = collection(db, "organisation", orgId, "goals");
  const snapshot = await getDocs(okrCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addOKR = async (okr, orgId) => {
  const okrCollection = collection(db, "organisation", orgId, "goals");
  if (!okr.createdAt) {
    okr.createdAt = Math.floor(Date.now());
  }
  const docRef = await addDoc(okrCollection, okr);
  return { id: docRef.id, ...okr };
};

const updateOKR = async (orgId, feild, itemId) => {
  const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Goal not found');
  }

  const firstDoc = querySnapshot.docs[0];
  // Single write: merge field updates and updatedAt together
  await setDoc(firstDoc.ref, { ...feild, updatedAt: Math.floor(Date.now()) }, { merge: true });
  return { ...firstDoc.data(), ...feild };
};

const deleteOKR = async (orgId, itemId) => {
  const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Goal not found');
  }

  const firstDoc = querySnapshot.docs[0];
  const data = firstDoc.data();
  await deleteDoc(firstDoc.ref);
  return data;
};

// React Query hooks
export const useFetchOKRs = (orgId) => {
  return useQuery({
    queryKey: ['okrs', orgId],
    queryFn: () => fetchOKRs(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddOKR = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ okr, orgId }) => addOKR(okr, orgId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['okrs', orgId] });
    },
  });
  return mutation.mutate;
};

export const useUpdateOKR = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, feild, itemId }) => updateOKR(orgId, feild, itemId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['okrs', orgId] });
    },
  });
  return mutation.mutate;
};

export const useDeleteOKR = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, itemId }) => deleteOKR(orgId, itemId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['okrs', orgId] });
    },
  });
  return mutation.mutate;
};

export const fetchSingleOKR = async (orgId, goalId) => {
  if (!orgId || !goalId) {
    throw new Error('Organization ID and Goal ID are required');
  }

  const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(goalId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const firstDoc = querySnapshot.docs[0];
  return { id: firstDoc.id, ...firstDoc.data() };
};
