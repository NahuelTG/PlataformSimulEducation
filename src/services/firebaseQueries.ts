import { collection, query,doc, where, getDocs,getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Función para obtener las clases asociadas a un grupo
export const fetchClassesForGroup = async (idGrupo: string) => {
    const clasesCollection = collection(db, "clases");
    const q = query(clasesCollection, where("idGrupo", "==", idGrupo)); // Filtra por idGrupo
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

// Función para obtener los detalles de un grupo
export const fetchGroupDetails = async (idGrupo: string) => {
  const groupDoc = doc(db, "grupos", idGrupo);
  const groupSnapshot = await getDoc(groupDoc);
  if (groupSnapshot.exists()) {
    return { id: groupSnapshot.id, ...groupSnapshot.data() };
  }
  throw new Error("El grupo no existe.");
};
