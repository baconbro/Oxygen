import { initializeApp } from "firebase/app";
import {
    getFirestore,
    query,
    onSnapshot,
    collection,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion,
    where,
    deleteDoc,
    setDoc,
    arrayRemove,
    documentId,
    deleteField,
    orderBy,
    limit,
    connectFirestoreEmulator,
    writeBatch,
    runTransaction
} from "firebase/firestore";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    sendEmailVerification,
    connectAuthEmulator
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { async } from "@firebase/util";
import { defaultWorkspaceConfig } from "../constants/defaultConfig";
import { useFirestoreQuery } from "@react-query-firebase/firestore";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth();
export const storage = getStorage(app);

// Connect to the emulators if running locally
if (window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099'); 
    connectFirestoreEmulator(db, 'localhost', 8080); 
  }


const analytics = getAnalytics(app);


//Auth


export const logInWithEmailAndPassword = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;
    const q = query(collection(db, "users"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        setDoc(doc.ref, { lastlogin: serverTimestamp() }, { merge: true });
    });
    return res;
};

export const registerWithEmailAndPassword = async (name, email, password, lastname) => {
    // Create the user account with Firebase Authentication
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    // Update profile with display name
    await updateProfile(auth.currentUser, {
        displayName: name,
    }).catch((error) => {
        console.error("Error updating profile:", error);
    });
    
    // Basic user data structure
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        name: name,
        fName: name,
        lName: lastname,
        lastname: lastname,
        lastlogin: serverTimestamp(),
        createdAt: serverTimestamp()
    };
    
    // Add userData to the user object under the 'all' property
    user.all = userData;
    
    try {
        // Search for invitations by email (using email-invitations lookup collection)
        const emailInvitesQuery = query(collection(db, "email-invitations"), 
                                         where("email", "==", email.toLowerCase()));
        const emailInvitesSnapshot = await getDocs(emailInvitesQuery);
        
        if (!emailInvitesSnapshot.empty) {
            // User was invited - locate the actual invitation in the org subcollection
            const inviteData = emailInvitesSnapshot.docs[0].data();
            const orgId = inviteData.orgId;
            
            // Delete the temporary unregistered user entry in the org/users collection
            const tempUserQuery = query(
                collection(db, "organisation", orgId, "users"), 
                where("email", "==", email.toLowerCase()),
                where("status", "==", "unregistered")
            );
            const tempUserSnapshot = await getDocs(tempUserQuery);
            
            // Delete any temporary user entries
            for (const tempDoc of tempUserSnapshot.docs) {
                await deleteDoc(tempDoc.ref);
            }
            
            // Get the full invitation details from the org subcollection
            const orgInvitesRef = collection(db, "organisation", orgId, "invitations");
            const orgInviteQuery = query(orgInvitesRef, where("email", "==", email.toLowerCase()));
            const orgInviteSnapshot = await getDocs(orgInviteQuery);
            
            if (!orgInviteSnapshot.empty) {
                const fullInviteData = orgInviteSnapshot.docs[0].data();
                
                // Create minimal user document in users collection (just for routing)
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    currentOrg: orgId,
                    orgs: [orgId]
                });
                
                // Add user to organization with complete profile
                const orgUserDocRef = doc(db, "organisation", orgId, "users", user.uid);
                await setDoc(orgUserDocRef, {
                    ...userData,
                    role: fullInviteData.role || 'member',
                    status: 'registered',
                    joined: Math.floor(Date.now()),
                    currentOrg: orgId,
                    orgs: [orgId]
                });
                
                // Delete the invitation
                await deleteDoc(orgInviteSnapshot.docs[0].ref);
                
                // Delete all invitation lookup references for this email
                const batch = writeBatch(db);
                emailInvitesSnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                
                console.log("User joined existing organization:", orgId);
            }
        } else {
            // No invitation - create a new organization for the user
            const orgId = await createOrg({ title: name + '\'s team' }, user);
            
            // Create minimal user document in users collection (just for routing)
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                currentOrg: orgId,
                orgs: [orgId]
            });
            
            console.log("Created new organization for user:", orgId);
        }
        
        return res;
    } catch (error) {
        console.error("Error during registration process:", error);
        throw error;
    }
};

export const sendPasswordReset = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

export const logout = () => {
    signOut(auth);
};


//Items

// streamSubItem function has been moved to itemServices.js



//V2 - sub
export const addComment = async (orgId, body, issueId, currentUser) => {
    const q = query(collection(db, "organisation", orgId, "items"), where("id", "==", parseInt(issueId)));
    const querySnapshot = await getDocs(q);
    const feild = {
        body: body,
        issueId: issueId,
        //userId: currentUser.id,
        id: Math.floor(Math.random() * 1000000000000) + 1, //numer, unique Id for the issue to be shown
        createdAt: Math.floor(Date.now()),
        user: {
            avatarUrl: currentUser.all.photoURL,
            email: currentUser.all.email,
            //id:currentUser.id,
            name: currentUser.all.fName
        },
    }
    querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
            comments: arrayUnion(feild)
        });
        setDoc(doc.ref, { updatedAt: Math.floor(Date.now()) }, { merge: true });
    });
};
//Dependencies
//create or modify a dependencie  in the dependencie collection in the organisation collection  based on data received
export const updateDependencie = async (orgId, field, depId) => {
    console.log('updateDependencie', orgId, field, depId);
    try {
        const q = query(collection(db, "organisation", orgId, "dependencies"), where("id", "==", depId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(collection(db, "organisation", orgId, "dependencies"), {
                ...field,
                id: depId,
                createdAt: Math.floor(Date.now()),
                updatedAt: Math.floor(Date.now())
            });
        } else {
            querySnapshot.forEach(async (doc) => {
                await setDoc(doc.ref, field, { merge: true });
                await setDoc(doc.ref, { updatedAt: Math.floor(Date.now()) }, { merge: true });
            });
        }
        console.log('Dependency updated successfully');
    } catch (error) {
        console.error('Error updating dependency:', error);
    }
};

//add a dependancie to the dependencies collection in the organisation collection based on data received
export const addDependencie = async (orgId, data) => {
    data.id = Math.floor(Math.random() * 1000000000000) + 1;
    data.createdAt = Math.floor(Date.now());
    await addDoc(collection(db, "organisation", orgId, "dependencies"), data);
};

//get all dependencies from the dependencies collection in the organisation collection for some issues if the issue match the feilds A and B in the dependencie
export const getDependencies = async (orgId, issueId) => {
    const q = query(collection(db, "organisation", orgId, "dependencies"), where("A", "==", issueId));
    const querySnapshot = await getDocs(q);
    const dependencies = [];
    querySnapshot.forEach((doc) => {
        dependencies.push(doc.data());
    });
    const qb = query(collection(db, "organisation", orgId, "dependencies"), where("B", "==", issueId));
    const querySnapshotb = await getDocs(qb);
    querySnapshotb.forEach((doc) => {
        dependencies.push(doc.data());
    });
    return dependencies;
};
export const deleteDependencie = async (orgId, itemId) => {
    const q = query(collection(db, "organisation", orgId, "dependencies"), where("id", "==", parseInt(itemId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        deleteDoc(doc.ref)
    });
};

//v2 - sub
export const deletComment = async (orgId, comment, issueId) => {
    const q = query(collection(db, "organisation", orgId, "items"), where("id", "==", parseInt(issueId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
            comments: arrayRemove(comment)
        });
    });
};

export const editComment = async (orgId, comment, issueId, body) => {
    const q = query(collection(db, "organisation", orgId, "items"), where("id", "==", parseInt(issueId)));
    const querySnapshot = await getDocs(q);
    const initComment = comment;
    const newComment = comment;
    querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
            comments: arrayRemove(initComment)
        });
        newComment.editedAt = Math.floor(Date.now());
        newComment.body = body;
        await updateDoc(doc.ref, {
            comments: arrayUnion(newComment)
        });
    });
};

//Goals
//create a goal in the goals collection in the organisation collection based on data received ///query done
export const createGoal = async (orgId, data) => {
    data.id = Math.floor(Math.random() * 1000000000000) + 1;
    data.createdAt = Math.floor(Date.now());
    await addDoc(collection(db, "organisation", orgId, "goals"), data);
};
//get all goals from the goals collection in the organisation collection ///query done
export const getGoals = async (orgId) => {
    const q = query(collection(db, "organisation", orgId, "goals"));
    const querySnapshot = await getDocs(q);
    const goals = [];
    querySnapshot.forEach((doc) => {
        goals.push(doc.data());
    });
    return goals;
};
//edit Goal ///query done
export const editGoal = async (orgId, feild, itemId) => {
    const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        setDoc(doc.ref, feild, { merge: true });
        setDoc(doc.ref, { updatedAt: Math.floor(Date.now()) }, { merge: true });
    });
};
//get all Epic and Higher hierarchy items
export const getHighLevelWorkItems = async (orgId, snapshot, error) => {
    const itemsColRef = collection(db, "organisation", orgId, "items")
    const itemsQuery = query(itemsColRef, where("type", 'in', ['epic']))
    return onSnapshot(itemsQuery, snapshot, error);
};

//delete goal ///query done
export const deleteGoal = async (orgId, itemId) => {
    const q = query(collection(db, "organisation", orgId, "goals"), where("id", "==", parseInt(itemId)));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        // doc.data() is never undefined for query doc snapshots
        deleteDoc(doc.ref)
    });
};


//Space
export const getSpaceData = (id, org) => {
    const spaceDocRef = doc(db, 'organisation', org, 'spaces', id)
    return getDoc(spaceDocRef);
};
///-Query done
export const getSpaces = (org) => {
    // const itemsColRef = query(collection(db, "spaces"), where("org", "==", org));
    const itemsColRef = query(collection(db, 'organisation', org, 'spaces'));
    return getDocs(itemsColRef)
}

export const addUserToSpace = async (feilds, orgId) => {
    const q = doc(db, 'organisation', orgId, 'spaces', feilds.spaceId)
    return await setDoc(q, feilds, { merge: true });
};

export const createSpace = async (values, user) => {
    const spacesColRef = collection(db, 'organisation', values.org, 'spaces');
    const spaceRef = doc(spacesColRef); // pre-generate ID
    const acro = values.acronym ? values.acronym.toUpperCase().trim() : null;
    let userPhotoURL = "";
    if (user.all.photoURL === null) {
        userPhotoURL = "media/logos/logo_oxy.png";
    } else { userPhotoURL = user.all.photoURL }

    await runTransaction(db, async (tx) => {
        if (acro) {
            const acroRef = doc(db, 'acronyms', acro);
            const acroSnap = await tx.get(acroRef);
            if (acroSnap.exists()) {
                throw new Error('Acronym already in use');
            }
            tx.set(acroRef, {
                org: values.org,
                spaceId: spaceRef.id,
                createdAt: serverTimestamp(),
            });
        }

        tx.set(spaceRef, {
            org: values.org,
            title: values.title,
            created: Math.floor(Date.now()),
            acronym: acro,
            issueCounter: acro ? 0 : null,
            users: [{
                avatarUrl: "",
                id: user.all.uid,
                email: user.all.email,
                name: user.all.fName,
                role: 'owner'
            }],
            config: values.config || defaultWorkspaceConfig,
            spaceId: spaceRef.id,
        });
    });

    return spaceRef.id;
};

export const editSpace = async (feild, spaceId, orgId) => {
    const q = query(collection(db, "organisation", orgId, "spaces"), where("spaceId", "==", spaceId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        return await setDoc(doc.ref, feild, { merge: true });
    });
};
// be careful, no merge here
export const editSpaceNoMerge = async (field, spaceId, orgId) => {
    const q = query(collection(db, "organisation", orgId, "spaces"), where("spaceId", "==", spaceId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        // Read the current 'issueType' array from Firestore, nested within 'config'
        const currentArray = doc.data().config?.issueType;

        // Modify the array as needed
        // Assuming 'field' contains the modified array in 'field.config.issueType'
        const updatedArray = field.config.issueType;

        // Update the document with the modified array
        // Ensure we're maintaining the structure by keeping it inside 'config'
        const newField = { ...doc.data(), config: { ...doc.data().config, issueType: updatedArray } };
        // Update the Firestore document
        await setDoc(doc.ref, newField, { merge: false });
    });
};

export const deleteSpace = async (spaceId, orgId) => {
    const q = query(collection(db, "organisation", orgId, "spaces"), where("projectId", "==", spaceId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        deleteDoc(doc.ref)
    })
    const queryValidation = await getDocs(q);
    if (queryValidation.docs.length == 0) {
        const docRef = doc(db, "organisation", orgId, 'spaces', spaceId)
        return await deleteDoc(docRef);

    };
}

// Storage helpers for workspace avatars
export const uploadWorkspaceAvatar = async (orgId, spaceId, file) => {
    if (!file) throw new Error('No file provided');
    const path = `organisation/${orgId}/spaces/${spaceId}/avatar/${Date.now()}_${file.name}`;
    const ref = storageRef(storage, path);
    const snapshot = await uploadBytes(ref, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, path };
};

export const deleteWorkspaceAvatarByPath = async (path) => {
    if (!path) return;
    const ref = storageRef(storage, path);
    try {
        await deleteObject(ref);
    } catch (e) {
        console.warn('Failed to delete old avatar', e);
    }
};


//User
// DEPRECATED: Use the version from userServices.js instead
export const editUser = async (values, fields) => {
    if (!fields) { fields = {} }

    const q = query(collection(db, "users"), where("email", "==", values.email));
    const querySnapshot = await getDocs(q);

    const userUpdates = querySnapshot.docs.map(async doc => {
        await setDoc(doc.ref, fields, { merge: true });
        return getDoc(doc.ref);
    });

    const updatedDocs = await Promise.all(userUpdates);

    // Call the editOrgUser function after updating the user
    if (updatedDocs.length > 0) {
        await editOrgUser(updatedDocs.map(doc => doc.data()), updatedDocs.map(doc => doc.data()));
    }
};

export const basicEditUser = async (values) => {
    const update = await updateProfile(auth.currentUser, values)
        .then(async value => {
            await editUser(values)
        })
    return update;
}
export const searchMember = async (searchText) => {
    const citiesRef = collection(db, 'users');
    const q = query(citiesRef, where("name", ">=", searchText));
    return await getDocs(q);
}

export const getUserInfo = async (email, uid) => {
    if (uid) {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        return await getDocs(q)
    } else {
        const q = query(collection(db, "users"), where("email", "==", email));
        return await getDocs(q)
    }

};

export const updateUserEmail = async (email) => {
    const update = await updateEmail(auth.currentUser, email)
        .then(async () => {
            await editUser({ email: email })
        })
    return update
}
export const editOrgUser = async (values, fields) => {
    if (!fields) { fields = {} }

    // Exit the function if no currentOrg is provided
    if (!values[0].currentOrg) {
        console.warn("No currentOrg provided. Exiting editOrgUser.");
        return;
    }

    const orgId = values[0].currentOrg;
    const userEmail = values[0].email;
    
    // Find user with matching email in the subcollection
    const usersColRef = collection(db, "organisation", orgId, "users");
    const q = query(usersColRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    
    // Update the user document with the new fields
    const updates = querySnapshot.docs.map(doc => {
        return setDoc(doc.ref, { ...fields[0] }, { merge: true });
    });
    
    return Promise.all(updates);
};


//Organisation
export const getOrgs = async (userEmail) => {
    //const delay = ms => new Promise(res => setTimeout(res, ms));
    let user = []
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
        const docRef = doc(db, "users", querySnapshot.docs[0].id);
        const userRef = await getDoc(docRef)
        user = userRef.data()
    }
    
    // Fix: Check if user.orgs exists and is not empty before using it in query
    if (!user || !user.orgs || user.orgs.length === 0) {
        // Return a QuerySnapshot-compatible empty result
        return await getDocs(query(collection(db, "organisation"), where("__nonexistent__", "==", true)));
    }
    
    const itemsColRef = query(collection(db, "organisation"), where(documentId(), "in", user.orgs));
    return await getDocs(itemsColRef)
}

export const getOrgUsers = async (orgId) => {

    
    // Then fetch users from the subcollection
    const usersColRef = collection(db, "organisation", orgId, "users");
    const querySnapshot = await getDocs(usersColRef);
    
    // Transform into an object with uid as keys for backward compatibility
    const users = {};
    querySnapshot.forEach((doc) => {
      users[doc.id] = doc.data();
    });
    
    return { data: () => ({ users }) };
};

export const inviteUser = async (email, orgId) => {
    email = email.toLowerCase().trim();
    
    // Check if user already exists
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    // Check if there's an existing invitation
    const inviteQuery = query(collection(db, "invitations"), where("email", "==", email));
    const inviteSnapshot = await getDocs(inviteQuery);
    
    // If there's already an invitation for this email
    if (!inviteSnapshot.empty) {
        throw new Error("This user already has a pending invitation.");
    }
    
    // If user exists
    if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        
        // If user already belongs to any org, they can't join another
        if (userData.orgs && userData.orgs.length > 0) {
            throw new Error("User already belongs to an organization.");
        }
    }
    
    // Get the total count of users in the organization
    const usersColRef = collection(db, "organisation", orgId, "users");
    const usersSnapshot = await getDocs(usersColRef);
    
    if (usersSnapshot.size >= 10) {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.");
    }
    
    // Create invitation record
    await addDoc(collection(db, "invitations"), {
        email: email,
        orgId: orgId,
        invitedAt: serverTimestamp(),
        invitedBy: auth.currentUser.email,
        role: 'member',
        status: 'pending'
    });
    
    return { success: true };
};

export const addUserToOrg = async (email, orgId, uid) => {
    email = email.toLowerCase().trim();
    
    // Check if the user is already in this organization
    const orgUsersRef = collection(db, "organisation", orgId, "users");
    const userQuery = query(orgUsersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
        throw new Error("User is already a member of this organization.");
    }
    
    // Get the count of users to enforce limit
    const querySnapshot = await getDocs(orgUsersRef);
    
    if (querySnapshot.size >= 10) {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.");
    }
    
    const field = {
        email: email,
        joined: Math.floor(Date.now()),
        role: 'member',
        status: isNaN(uid) ? 'member' : 'unregistered',
        currentOrg: orgId,
        orgs: [orgId]
    };
    
    // Add user to the organization's users subcollection
    const userDocRef = doc(db, "organisation", orgId, "users", uid.toString());
    await setDoc(userDocRef, field);
    
    return { success: true, uid };
};

export const createOrg = async (values, user) => {
    try {
        // Create the organization document
        const orgRef = collection(db, 'organisation');
        const docRef = await addDoc(orgRef, {
            name: values.title,
            createdAt: serverTimestamp(),
            createdBy: user.uid
        });
        
        const orgId = docRef.id;
        
        // Add the user to the users subcollection
        const userDocRef = doc(db, "organisation", orgId, "users", user.uid);
        await setDoc(userDocRef, {
            ...user.all,
            joined: Math.floor(Date.now()),
            role: 'owner',
            status: 'registered',
            currentOrg: orgId,
            orgs: [orgId]
        });
        
        // Update the user's document with organization reference
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            currentOrg: orgId,
            orgs: [orgId]
        }, { merge: true });
        
        return orgId;
    } catch (error) {
        console.error("Error creating organization:", error);
        throw error;
    }
};

export const editOrg = async (feild, orgId) => {
    const q = doc(db, 'organisation', orgId)
    const org = await getDoc(q)
    return setDoc(org.ref, feild, { merge: true });
};

export const editUsers = async (user, orgId) => {
    // Get the count of users
    const usersColRef = collection(db, "organisation", orgId, "users");
    const querySnapshot = await getDocs(usersColRef);
    
    if (querySnapshot.size < 10) {
        // Delete the user document from subcollection
        const userDocRef = doc(db, "organisation", orgId, "users", user.id);
        await deleteDoc(userDocRef);
        return await removeUserFromOrg(user.email, orgId);
    } else {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.");
    }
};

export const removeUserFromOrg = async (email, orgId) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error("User not found.");
        }
        
        const docRef = doc(db, "users", querySnapshot.docs[0].id);
        const user = await getDoc(docRef);
        const userData = user.data();
        
        // Remove the organization from user's orgs array
        if (userData && userData.orgs) {
            const orgs = [...userData.orgs];
            const index = orgs.indexOf(orgId);
            if (index > -1) {
                orgs.splice(index, 1);
                
                // Update user document with modified orgs array
                await setDoc(docRef, { 
                    orgs: orgs,
                    currentOrg: orgs.length > 0 ? orgs[0] : deleteField()
                }, { merge: true });
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error removing user from organization:', error);
        throw error;
    }
};

export const getOrgData = (id) => {
    const groceryDocRef = doc(db, 'organisation', id)
    return getDoc(groceryDocRef);
};

//Statistics
export const adminStats = async () => {
    let stats = [];
    const q = query(collection(db, "users"));
    await getDocs(q)
        .then(function (querySnapshot) {
            stats['users'] = querySnapshot.size;
        });
    const qq = query(collection(db, "items"));
    await getDocs(qq)
        .then(function (querySnapshot) {
            stats['items'] = querySnapshot.size;
        });
    return stats


};
export const getDoneItemsFromLastWeek = async (orgId) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Convert the oneWeekAgo Date object to a Unix timestamp in milliseconds
    const oneWeekAgoTimestamp = oneWeekAgo.getTime();

    const q = query(collection(db, "organisation", orgId, "items"),
        where("status", "==", "done"),
        where("updatedAt", ">=", oneWeekAgoTimestamp));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size; // number of items marked as done in the last 7 days
};
export const getEditedItemsFromLastWeek = async (orgId) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Convert the oneWeekAgo Date object to a Unix timestamp in milliseconds
    const oneWeekAgoTimestamp = oneWeekAgo.getTime();

    const q = query(collection(db, "organisation", orgId, "items"),
        where("updatedAt", ">=", oneWeekAgoTimestamp));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size; // number of items marked as done in the last 7 days
};
export const getNewItemsFromLastWeek = async (orgId) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Convert the oneWeekAgo Date object to a Unix timestamp in milliseconds
    const oneWeekAgoTimestamp = oneWeekAgo.getTime();

    const q = query(collection(db, "organisation", orgId, "items"),
        where("createdAt", ">=", oneWeekAgoTimestamp));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size; // number of items marked as done in the last 7 days
};
export const getItemsByStatus = async (orgId, statuses) => {

    const counts = {};

    for (let status of statuses) {
        const q = query(collection(db, "organisation", orgId, "items"),
            where("status", "==", status))
        const querySnapshot = await getDocs(q);

        counts[status] = querySnapshot.size;
    }

    return counts; // object with the number of items for each status
};
export const getItemsByPriority = async (orgId, priorities) => {

    const counts = {};

    for (let priority of priorities) {
        const q = query(collection(db, "organisation", orgId, "items"),
            where("priority", "==", priority))
        const querySnapshot = await getDocs(q);

        counts[priority] = querySnapshot.size;
    }
    return counts; // object with the number of items for each status
};