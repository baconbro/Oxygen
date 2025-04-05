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
    connectFirestoreEmulator
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
    // Get the currently authenticated user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    updateProfile(auth.currentUser, {
        displayName: name,
    }).then(() => {

    }).catch((error) => {

    });
    const userData = {
        uid: auth.currentUser.uid,
        name: name,
        email: email,
        displayName: name,
        id: Math.floor(Math.random() * 1000000000000) + 1, //number, because it needed somwhere in the code. Maybe not valuable
        lastlogin: serverTimestamp(),
        lastname: lastname,
        lName: lastname,
        fName: name
    };
    //check if user exists then update with new data else create new user
    const q = query(collection(db, "users"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        await addDoc(collection(db, "users"), userData);
        await createOrg({ title: name + ' team' }, user)
    } else {
        querySnapshot.forEach(async (doc) => {
            setDoc(doc.ref, userData, { merge: true });
        });
        //get the org where the user is a member and get the key of the user
        const orgs = await getOrgs(user.email)
        orgs.forEach(async (org) => {
            const orgData = org.data();
            const orgUsers = org.data().users;
            const orgId = org.id;
            const orgRef = doc(db, 'organisation', orgId);

            // Find the user with the given email
            const userKey = Object.keys(orgUsers).find(key => {
                return orgUsers[key].email === user.email;
            });

            if (!userKey) {
                console.error(`User with email ${user.email} does not exist.`);
                return;
            }

            // Check if userKey is a number
            if (!isNaN(parseInt(userKey))) {

                // Convert userKey to the new key
                orgUsers[user.uid] = orgUsers[userKey];
                orgUsers[user.uid].status = "registered";
                await setDoc(orgRef, { users: { [user.uid]: orgUsers[user.uid] } }, { merge: true });
                await updateDoc(orgRef,
                    { ["users." + userKey]: deleteField() }
                )
            }
        })
    }
    return res;
};

export const sendPasswordReset = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

export const logout = () => {
    signOut(auth);
};


//Items


export const streamSubItem = (orgId, itemId, snapshot, error) => {
    const subColRef = collection(db, "organisation", orgId, "items");
    const itemsQuery = query(subColRef, where("id", "==", parseInt(itemId)))
    return onSnapshot(itemsQuery, snapshot, error);
};






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
            avatarUrl: currentUser.photoURL,
            email: currentUser.email,
            //id:currentUser.id,
            name: currentUser.first_name
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
    const itemsColRef = collection(db, 'organisation', values.org, 'spaces')
    let userPhotoURL = ""
    //if user.photoURL is null, use default image
    if (user.photoURL === null) {
        userPhotoURL = "media/logos/logo_oxy.png"
    } else { userPhotoURL = user.photoURL }

    const docRef = await addDoc(itemsColRef, {
        org: values.org,
        title: values.title,
        created: Math.floor(Date.now()),
        users: [{
            avatarUrl: "",
            id: user.all.uid,
            email: user.email,
            name: user.first_name,
            role: 'owner'
        }],
        config: values.config || defaultWorkspaceConfig,
    })
    await updateDoc(docRef, {
        spaceId: docRef.id
    });
    return docRef.id;

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


//User
// DEPRECATED: Use the version from userServices.js instead
export const editUser = async (values, fields) => {
    if (!fields) { fields = {} }

    const q = query(collection(db, "users"), where("email", "==", values.email));
    const querySnapshot = await getDocs(q);

    const userUpdates = querySnapshot.docs.map(async doc => {
        await setDoc(doc.ref, fields, { merge: true });
        return getDoc(doc.ref); // Re-fetch the updated document
    });

    const updatedDocs = await Promise.all(userUpdates);

    // Call the editOrgUser function after updating the user
    await editOrgUser(updatedDocs.map(doc => doc.data()), updatedDocs.map(doc => doc.data()));
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

    const orgRef = doc(db, "organisation", values[0].currentOrg);
    const orgDoc = await getDoc(orgRef);

    if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        let users = orgData?.users || {};

        // Find user with matching email and update their details
        for (let uid in users) {
            if (users[uid].email === values[0].email) {
                users[uid] = {
                    ...users[uid],
                    ...fields[0]
                };
            }
        }

        // Update the organisation document with the modified users data
        return await setDoc(orgRef, { users: users }, { merge: true });
    } else {
        console.error("Organisation not found");
    }
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
    const itemsColRef = query(collection(db, "organisation"), where(documentId(), "in", user.orgs),);
    return await getDocs(itemsColRef)
}

export const getOrgUsers = async (orgId) => {
    const docRef = doc(db, "organisation", orgId);
    const org = await getDoc(docRef)
    return org;
}

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
//remove org from user
export const removeUserFromOrg = async (email, orgId) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    const docRef = doc(db, "users", querySnapshot.docs[0].id);
    const user = await getDoc(docRef)
    const orgs = user.data().orgs
    const index = orgs.indexOf(orgId);
    if (index > -1) {
        orgs.splice(index, 1);
    }
    return await setDoc(docRef, { orgs: orgs }, { merge: true })
};

export const addUserToOrg = async (email, orgId, uid) => {
    const q = doc(db, 'organisation', orgId)
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
    const org = await getDoc(q)
    if (Object.keys(org.data().users).length < 10) {
        return await setDoc(q, {
            users: {
                [uid]: feild
            }
        }, { merge: true })
    } else {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.")
    }
}

export const createOrg = async (values, user) => {
    const itemsColRef = collection(db, 'organisation')
    // Create a new user object with the user's information
    const newUser = {
        email: user.email,
        joined: Math.floor(Date.now()),
        role: 'owner'
    };

    const docRef = await addDoc(itemsColRef, {
        name: values.title,
        users: { [user.uid]: newUser }
    })
    let userRef = []
    const q = query(collection(db, "users"), where("email", "==", user.email));
    await getDocs(q)
        .then(async querySnapshot => {
            const snapshot = querySnapshot.docs[0]
            userRef = snapshot.ref
            //await delay(1000);
        })
    return await updateDoc(userRef, {
        orgs: arrayUnion(docRef.id),
        currentOrg: docRef.id,
    });
};

export const editOrg = async (feild, orgId) => {
    const q = doc(db, 'organisation', orgId)
    const org = await getDoc(q)
    return setDoc(org.ref, feild, { merge: true });
};

export const editUsers = async (user, orgId) => {
    const q = doc(db, 'organisation', orgId)
    const org = await getDoc(q)
    if (Object.keys(org.data().users).length < 10) {
        await updateDoc(q, {
            ["users." + user.id]: deleteField()
        })
        return await removeUserFromOrg(user.email, orgId)
    } else {
        throw new Error("Free plan is limited to 10 users. Please upgrade plan.")
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








