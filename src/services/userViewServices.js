import { getFirestore, collection, getDocs, addDoc, updateDoc, doc,query,where,setDoc ,deleteDoc,getDoc} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { db } from './firestore';


const getUserViews = async (userId, orgId) => {
  try {
    const userViewsRef = collection(db, "organisation", orgId, "userviews");
    const q = query(userViewsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const userViews = [];
    querySnapshot.forEach((doc) => {
      userViews.push({ id: doc.id, ...doc.data() });
    });
    return userViews;
  } catch (error) {
    console.error('Error fetching user views: ', error);
    throw new Error('Error fetching user views');
  }
};

const addUserView = async (userId, orgId, viewData,queryClient) => {
  try {
    const cacheKey = ['userView', userId];
    let userViews = queryClient.getQueryData(cacheKey);

    if (!userViews) {
      // If not found in cache, fetch from Firestore
      userViews = await getUserViews(userId, orgId);
    }

    // Check if the view already exists
    const existingView = userViews.find(view => view.userId === viewData.userId && view.itemId === viewData.itemId);
    if (existingView) {
      // Update the lastTime field
      const docRef = doc(db, "organisation", orgId, "userviews", existingView.id);
      await updateDoc(docRef, { lastTime: new Date().toISOString() });
      existingView.lastTime = new Date().toISOString();
      queryClient.setQueryData(cacheKey, userViews);
      return existingView;
    } else {
      // Document does not exist, create a new one
      const newView = {
        ...viewData,
        lastTime: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "organisation", orgId, "userviews"), newView);
      const createdView = { id: docRef.id, ...newView };
      queryClient.setQueryData(cacheKey, [...userViews, createdView]);
      return createdView;
    }
  } catch (error) {
    console.error('Error adding or updating user view: ', error);
    throw new Error('Error adding or updating user view');
  }
};





// React Query hooks
export const useGetUserViews= (userId,orgId) => {
  return useQuery(['userView', userId], () => getUserViews(userId,orgId), {
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddUserView = () => {
  const queryClient = useQueryClient();
  return useMutation((newView) => addUserView(newView.userId, newView.orgId, newView.viewData,queryClient), {
    onSuccess: (newView) => {
      queryClient.invalidateQueries(['userView', newView.userId]);
    },
  });
};

