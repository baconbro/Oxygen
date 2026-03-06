import { collection, getDocs, addDoc, query, where, setDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
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

// --- Status Updates Subcollection ---

const addStatusUpdate = async (orgId, goalDocId, statusUpdate) => {
  const updatesCollection = collection(db, "organisation", orgId, "goals", goalDocId, "statusUpdates");
  const docRef = await addDoc(updatesCollection, {
    ...statusUpdate,
    createdAt: Math.floor(Date.now()),
  });
  return { id: docRef.id, ...statusUpdate };
};

const fetchStatusUpdates = async (orgId, goalDocId) => {
  if (!orgId || !goalDocId) return [];
  const updatesCollection = collection(db, "organisation", orgId, "goals", goalDocId, "statusUpdates");
  const snapshot = await getDocs(updatesCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

const deleteStatusUpdate = async (orgId, goalDocId, updateId) => {
  const updateRef = doc(db, "organisation", orgId, "goals", goalDocId, "statusUpdates", updateId);
  await deleteDoc(updateRef);
  return updateId;
};

// --- Saved Views ---

const fetchSavedViews = async (orgId) => {
  const viewsCollection = collection(db, "organisation", orgId, "savedGoalViews");
  const snapshot = await getDocs(viewsCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

const addSavedView = async (orgId, view) => {
  const viewsCollection = collection(db, "organisation", orgId, "savedGoalViews");
  const docRef = await addDoc(viewsCollection, {
    ...view,
    createdAt: Math.floor(Date.now()),
  });
  return { id: docRef.id, ...view };
};

const deleteSavedView = async (orgId, viewId) => {
  const viewRef = doc(db, "organisation", orgId, "savedGoalViews", viewId);
  await deleteDoc(viewRef);
  return viewId;
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

// --- Status Updates hooks ---

export const useFetchStatusUpdates = (orgId, goalDocId) => {
  return useQuery({
    queryKey: ['statusUpdates', orgId, goalDocId],
    queryFn: () => fetchStatusUpdates(orgId, goalDocId),
    enabled: !!orgId && !!goalDocId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAddStatusUpdate = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, goalDocId, statusUpdate }) => addStatusUpdate(orgId, goalDocId, statusUpdate),
    onSuccess: (_, { orgId, goalDocId }) => {
      queryClient.invalidateQueries({ queryKey: ['statusUpdates', orgId, goalDocId] });
      queryClient.invalidateQueries({ queryKey: ['okrs', orgId] });
    },
  });
  return mutation;
};

export const useDeleteStatusUpdate = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, goalDocId, updateId }) => deleteStatusUpdate(orgId, goalDocId, updateId),
    onSuccess: (_, { orgId, goalDocId }) => {
      queryClient.invalidateQueries({ queryKey: ['statusUpdates', orgId, goalDocId] });
    },
  });
  return mutation;
};

// --- Saved Views hooks ---

export const useFetchSavedViews = (orgId) => {
  return useQuery({
    queryKey: ['savedGoalViews', orgId],
    queryFn: () => fetchSavedViews(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddSavedView = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, view }) => addSavedView(orgId, view),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['savedGoalViews', orgId] });
    },
  });
  return mutation;
};

export const useDeleteSavedView = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orgId, viewId }) => deleteSavedView(orgId, viewId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['savedGoalViews', orgId] });
    },
  });
  return mutation;
};
