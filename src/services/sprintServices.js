import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from './firestore';



const getSprints = async (id, orgId) => {
  try {
    const itemsColRef = query(collection(db, 'organisation', orgId, 'spaces', id, 'sprints'));
    const snapshot = await getDocs(itemsColRef);
    const sprints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return sprints;
  } catch (error) {
    console.error('Error fetching sprints: ', error);
    throw new Error('Error fetching sprints');
  }
};
const addSprint = async (values, spaceId, orgId) => {
  try {
    const itemsColRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'sprints');
    const docRef = await addDoc(itemsColRef, values);
    return docRef.id;
  } catch (error) {
    console.error('Error adding sprint: ', error);
    throw new Error('Error adding sprint');
  }
};
const updateSprint = async (values, sprintId, spaceId, orgId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "spaces", spaceId, "sprints"), where("id", "==", sprintId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const sprintDocRef = querySnapshot.docs[0].ref;
      await updateDoc(sprintDocRef, values);
    } else {
      throw new Error('Sprint not found');
    }
  } catch (error) {
    console.error('Error updating sprint: ', error);
    throw new Error('Error updating sprint');
  }
}

const deleteSprint = async (sprintId, spaceId, orgId) => {
  try {
    const q = query(collection(db, "organisation", orgId, "spaces", spaceId, "sprints"), where("id", "==", sprintId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const sprintDocRef = querySnapshot.docs[0].ref;
      await deleteDoc(sprintDocRef);
    } else {
      throw new Error('Sprint not found');
    }
  } catch (error) {
    console.error('Error deleting sprint: ', error);
    throw new Error('Error deleting sprint');
  }
}

const addTicketToSprint = async (sprintId, spaceId, orgId, ticketId) => {
  try {
    const sprintsRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'sprints');
    const q = query(sprintsRef, where('id', '==', sprintId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No sprint found with the given ID');
    }

    let sprintDocId;
    querySnapshot.forEach((doc) => {
      sprintDocId = doc.id;
    });

    const ticketRef = doc(db, 'organisation', orgId, 'spaces', spaceId, 'sprints', sprintDocId, 'tickets', ticketId.toString());
    await setDoc(ticketRef, {
      ticketId: ticketId,
      added_at: Date.now(),
    });
  } catch (error) {
    console.error('Error adding ticket to sprint: ', error);
    throw error;
  }
};

const removeTicketFromSprint = async (sprintId, spaceId, orgId, ticketId) => {
  try {
    const sprintsRef = collection(db, 'organisation', orgId, 'spaces', spaceId, 'sprints');
    const q = query(sprintsRef, where('id', '==', sprintId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No sprint found with the given ID');
    }

    let sprintDocId;
    querySnapshot.forEach((doc) => {
      sprintDocId = doc.id;
    });

    const ticketRef = doc(db, 'organisation', orgId, 'spaces', spaceId, 'sprints', sprintDocId, 'tickets', ticketId.toString());
    await setDoc(ticketRef, {
      removed_at: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error removing ticket from sprint: ', error);
    throw error;
  }
};

// React Query hooks
export const useGetSprints = (id, orgId) => {
  return useQuery(['Sprints', id, orgId], () => getSprints(id, orgId), {
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddSprint = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ values, spaceId, orgId }) => addSprint(values, spaceId, orgId), {
    onSuccess: (_, { spaceId, orgId }) => {
      queryClient.invalidateQueries(['Sprints', spaceId, orgId]);
    },
  });

  return mutation.mutate;
};

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ values, sprintId, spaceId, orgId }) => updateSprint(values, sprintId, spaceId, orgId), {
    onSuccess: (_, { spaceId, orgId }) => {
      queryClient.invalidateQueries(['Sprints', spaceId, orgId]);
    },
  });

  return mutation.mutate;
};

export const useDeleteSprint = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ sprintId, spaceId, orgId }) => deleteSprint(sprintId, spaceId, orgId), {
    onSuccess: (_, { spaceId, orgId }) => {
      queryClient.invalidateQueries(['Sprints', spaceId, orgId]);
    },
  });

  return mutation.mutate;
};

export const useAddTicketToSprint = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ sprintId, spaceId, orgId, ticketId }) => addTicketToSprint(sprintId, spaceId, orgId, ticketId),
    {
      onSuccess: (_, { spaceId, orgId }) => {
        queryClient.invalidateQueries(['Sprints', spaceId, orgId]);
      },
    }
  );
};

export const useRemoveTicketFromSprint = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ sprintId, spaceId, orgId, ticketId }) => removeTicketFromSprint(sprintId, spaceId, orgId, ticketId),
    {
      onSuccess: (_, { spaceId, orgId }) => {
        queryClient.invalidateQueries(['Sprints', spaceId, orgId]);
      },
    }
  );
};