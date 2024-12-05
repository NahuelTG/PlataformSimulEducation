import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCqNHo8BI54sIVDKKMzjZHSdYqXbbkHHs",
  authDomain: "proyectotss-a9125.firebaseapp.com",
  projectId: "proyectotss-a9125",
  storageBucket: "proyectotss-a9125.firebasestorage.app",
  messagingSenderId: "734484557975",
  appId: "1:734484557975:web:57021446ea928dc70339d2",
  measurementId: "G-VE1E5WBMQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);
