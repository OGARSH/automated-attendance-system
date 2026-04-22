import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDR-_ARmGiHKImchkI8G5iQejRAzFMhxO8",
  authDomain: "tunetogether-ff455.firebaseapp.com",
  databaseURL: "https://tunetogether-ff455-default-rtdb.firebaseio.com",
  projectId: "tunetogether-ff455",
  storageBucket: "tunetogether-ff455.firebasestorage.app",
  messagingSenderId: "562818134954",
  appId: "1:562818134954:web:86a201b6cf57057275b1d3",
  measurementId: "G-DE9CENGS2V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
