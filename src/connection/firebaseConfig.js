import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCCqNHo8BI54sIVDKKMzjZHSdYqXbbkHHs",
  authDomain: "proyectotss-a9125.firebaseapp.com",
  projectId: "proyectotss-a9125",
  storageBucket: "proyectotss-a9125.firebasestorage.app",
  messagingSenderId: "734484557975",
  appId: "1:734484557975:web:57021446ea928dc70339d2",
  measurementId: "G-VE1E5WBMQD"
};

// Inicializa Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // si ya está inicializado, usa esa instancia
}

// Exporta las instancias de Firebase que necesites
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;