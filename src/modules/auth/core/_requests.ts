import axios from 'axios'
import {AuthModel, UserModel} from './_models'
import * as FirestoreService from '../../../services/firestore'

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

export async function getUserByToken(token: string | null) { // get user info from user tab
  type user = {
    photoURL?:string; 
    email?:string | undefined;
    name?:string | undefined;

  };
  let p1:user = {}
  await FirestoreService.getUserInfo(token)
  .then(querySnapshot => {
    querySnapshot.forEach((doc) => {
      p1 = doc.data();
    });
  })
  //check if user is logged else reload page
  if (Object.keys(p1).length === 0 ) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  const data = {user:{api_token: token,
  created_at: "novalue",
  email: p1.email,
  email_verified_at: "novalue",
  first_name: p1.name,
  id: 0,
  last_name: "Stark",
  updated_at: "novalue",
  username:'novalue',
  password:'novalue',
  photoURL: p1.photoURL,
  all : p1, 
}}
  return data
/*   return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  }) */
}
