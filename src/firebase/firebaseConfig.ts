import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhgkAVtW6hDRGa0MF5W6Pyl9aZKvuf7Fk",
    authDomain: "tss24-c3d19.firebaseapp.com",
    projectId: "tss24-c3d19",
    storageBucket: "tss24-c3d19.firebasestorage.app",
    messagingSenderId: "656922997058",
    appId: "1:656922997058:web:d3d82ab0799397c89c58db",
    measurementId: "G-P6P2KZLG5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, addDoc, storage, getDocs, collection, doc, getDoc, updateDoc, deleteDoc };  // Asegúrate de exportar 'doc' aquí


