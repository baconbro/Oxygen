import axios from 'axios'
import {AuthModel, UserModel} from './_models'
import * as FirestoreService from '../../../services/firestore'
// Add import for userServices
import { getUser, getOrgUsers } from '../../../services/userServices'


const API_URL = process.env.REACT_APP_API_URL

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`
export const LOGIN_URL = `${API_URL}/login`
export const REGISTER_URL = `${API_URL}/register`
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`

// Server should return AuthModel
export async function login(email: string, password: string) {
  const userCredential = await FirestoreService.logInWithEmailAndPassword(email, password)
  const auth = {api_token: userCredential.user.email,
  created_at: "novalue",
  email: userCredential.user.email,
  first_name: "novalue",
  id: 0,
  last_name: "novalue",
  updated_at: "novalue"}
  return  auth
/*   return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  }) */
}

// Server should return AuthModel
export async function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  const userCredential = await FirestoreService.registerWithEmailAndPassword(firstname, email, password, lastname)
  const auth = {api_token: userCredential.user.email,
  created_at: "novalue",
  email: userCredential.user.email,
  first_name: "novalue",
  id: 0,
  last_name: "novalue",
  updated_at: "novalue"}
  return  auth
/*   return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  }) */
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return FirestoreService.sendPasswordReset(email)
  /* return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {
    email,
  }) */
}

export async function getUserByToken(token: string | null, setOrgUsersFunc: ((orgUsers: any) => void) | null = null) { // get user info from user tab
  type user = {
    photoURL?:string; 
    email?:string | undefined;
    name?:string | undefined;
    orgs?: string[];
    currentOrg?: string;
    orgUserData?: any;
    // Add other possible user properties
  };
  
  // Maximum number of retry attempts
  const maxRetries = 5;
  // Initial delay (longer to allow for Firebase initialization)
  let retryDelay = 2000; 
  // Exponential backoff factor
  const backoffFactor = 1.5;
  
  // Function to try getting user info
  const tryGetUserInfo = async (attempt: number): Promise<user> => {
    let userInfo: user = {};
    let orgUsers = null;
    
    try {
      // Use userServices.getUser to get user data
      const querySnapshot = await getUser(token);
      
      querySnapshot.forEach((doc) => {
        userInfo = doc.data();
      });
      
      // If we found user data and they have organizations
      if (userInfo && userInfo.orgs && userInfo.orgs.length > 0) {
        const firstOrgId = userInfo.currentOrg || userInfo.orgs[0];
        
        try {
          // Get all users from the organization
          const orgUsersResult = await getOrgUsers(firstOrgId);
          orgUsers = orgUsersResult;
          
          // Set org users in context if function was provided
          if (setOrgUsersFunc && typeof setOrgUsersFunc === 'function') {
            setOrgUsersFunc(orgUsers);
          }
          
          // If user exists in org users, enhance user data with org user data
          if (orgUsers?.users && userInfo.email) {
            // Find the user in org users by email
            const orgUserEntries = Object.entries(orgUsers.users);
            const matchingOrgUser = orgUserEntries.find(([_, userData]) => userData.email === userInfo.email);
            
            if (matchingOrgUser) {
              // Merge org user data with user data
              userInfo =  matchingOrgUser[1]
            }
          }
        } catch (error) {
          console.error('Error fetching organization users:', error);
        }
      }
      
      if (Object.keys(userInfo).length === 0) {
        if (attempt < maxRetries) {
          // Implement exponential backoff
          retryDelay = Math.floor(retryDelay * backoffFactor);
          
          return new Promise(resolve => {
            setTimeout(async () => {
              resolve(await tryGetUserInfo(attempt + 1));
            }, retryDelay);
          });
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return userInfo;
        }
      }
      
      return userInfo;
    } catch (error) {
      if (attempt < maxRetries) {
        // Also retry on errors, with exponential backoff
        retryDelay = Math.floor(retryDelay * backoffFactor);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            resolve(await tryGetUserInfo(attempt + 1));
          }, retryDelay);
        });
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return {};
      }
    }
  };
  
  // Start the retry process
  const userInfo = await tryGetUserInfo(1);
  
  const data = {
    user:{
      all: userInfo,
    }
  }
  return data
}
