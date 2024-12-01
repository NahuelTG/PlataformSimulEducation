import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEVJvMY7HUerIycZe3rJVwWeiEJWAcnjc",
    authDomain: "plataforma-educativa-tss.firebaseapp.com",
    databaseURL: "https://plataforma-educativa-tss-default-rtdb.firebaseio.com/",
    projectId: "plataforma-educativa-tss",
    storageBucket: "plataforma-educativa-tss.firebasestorage.app",
    messagingSenderId: "735088978265",
    appId: "1:735088978265:web:635b640a72474e95f74448",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);
