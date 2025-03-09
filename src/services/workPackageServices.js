import { collection, getDocs, addDoc, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from './firestore';


const getWorkPackages = async (id, orgId) => {
  try {
    const subColRef = collection(db, "organisation", orgId, "workpackages");
    const q = query(subColRef, where("wpId", "==", id))
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error('Error fetching items: ', error);
    throw new Error('Error fetching items');
  }
};

const updateWorkPackage = async (orgId, values, wpgId, wpId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "workpackages"),
      where("id", "==", parseInt(wpgId)),
      where("wpId", "==", wpId),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await setDoc(doc.ref, values, { merge: true });
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

const addWorkPackage = async (orgId, item) => {
  try {
    const itemsColRef = collection(db, "organisation", orgId, "workpackages")

    const newItem = {
      createdAt: Math.floor(Date.now()),
      updatedAt: Math.floor(Date.now()),
      title: item.title || "",
      desc: item.desc || "",
      owner: item.owner || null,  // Default to null if undefined
      status: item.status || "Notstarted",
      startDate: item.startDate || Math.floor(Date.now()),
      endDate: item.endDate || Math.floor(Date.now()),
      id: item.id,
      wpId: item.wpId
    };

    // Add the new item to the collection
    return addDoc(itemsColRef, newItem);
  } catch (error) {
    console.error('Error updating item: ', error);
    return 'Update failed';
  }
};

const deleteWorkPackage = async (orgId, wpgId) => {
  const q = query(collection(db, "organisation", orgId, "workpackages"), where("id", "==", parseInt(wpgId)));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    deleteDoc(doc.ref)
  });
};

// React Query hooks
export const useGetWorkPackages = (id, orgId) => {
  return useQuery(['WorkPackages', orgId], () => getWorkPackages(id, orgId), {
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateWorkPackage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, values, wpgId, wpId }) => updateWorkPackage(orgId, values, wpgId, wpId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['WorkPackages', orgId]);
    },
  });
  return mutation.mutate;
}

export const useAddWorkPackage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, item }) => addWorkPackage(orgId, item), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['WorkPackages', orgId]);
    },
  });

  return mutation.mutate;
};

export const useDeleteWorkPackage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ orgId, wpgId }) => deleteWorkPackage(orgId, wpgId), {
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries(['WorkPackages', orgId]);
    },
  });

  return mutation.mutate;
};
