import { getFirestore, collection, getDocs, addDoc, updateDoc, doc,query,where,setDoc ,deleteDoc,getDoc} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from '../services/firestore';


const getSpaces = async (orgId) => {
  try {
    const itemsColRef = query(collection(db, 'organisation', orgId, 'spaces'));
    const snapshot = await getDocs(itemsColRef);
    const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return workspaces;
  } catch (error) {
    console.error('Error fetching workspaces: ', error);
    throw new Error('Error fetching workspaces');
  }
};

const getSpace = async (id, orgId) => {
  try {
    const spaceDocRef = doc(db, 'organisation', orgId, 'spaces', id)
    const workspace = await getDoc(spaceDocRef);
  return workspace.data();
  } catch (error) {
    console.error('Error fetching workspace: ', error);
    throw new Error('Error fetching workspace');
  }
};

const updateWorkspace = async (values, workspaceId, orgId) => {
  console.log('values: ', values, 'workspaceId: ', workspaceId, 'orgId: ', orgId);
  try {
    const q = query(collection(db, "organisation", orgId, "spaces"), where("spaceId", "==", workspaceId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const spaceDocRef = querySnapshot.docs[0].ref;
      await updateDoc(spaceDocRef, values);
    } else {
      throw new Error('Workspace not found');
    }
  } catch (error) {
    console.error('Error updating workspace: ', error);
    throw new Error('Error updating workspace');
  }
};




// React Query hooks
export const useGetSpaces = (orgId) => {
  return useQuery(['Workspaces', orgId], () => getSpaces(orgId), {
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSpace = (id, orgId) => {
  return useQuery(['Workspace', id], () => getSpace(id, orgId), {
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(({ values, workspaceId, orgId }) => updateWorkspace(values, workspaceId, orgId), {
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries(['Workspace', workspaceId]);
    },
  });
  return mutation.mutate;
}