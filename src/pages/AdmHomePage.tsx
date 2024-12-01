import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, collection, getDocs } from "../firebase/firebaseConfig";  // Importa Firestore correctamente
import { ModalCrearClase } from "../components/ModalCrearClase";
import { NavBar } from "../components/NavBar";

// Componente HomePage donde cargamos las clases desde Firestore
export default function HomePage() {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [clases, setClases] = useState<any[]>([]); // Usamos un array para almacenar las clases desde Firestore

   // Esta función carga las clases desde Firestore
   const loadClases = async () => {
      try {
         const clasesCollection = collection(db, "clases"); // Refiriéndonos a la colección "clases"
         const clasesSnapshot = await getDocs(clasesCollection); // Obtenemos todos los documentos de la colección
         const clasesList = clasesSnapshot.docs.map(doc => ({
            id: doc.id, // ID del documento
            ...doc.data() // Los datos del documento
         }));
         setClases(clasesList); // Guardamos las clases en el estado
      } catch (err) {
         console.log("Error cargando las clases:", err);
      }
   };

   // Usamos useEffect para cargar las clases cuando el componente se monta
   useEffect(() => {
      loadClases();
   }, []); // El array vacío asegura que se ejecute solo una vez cuando se monta el componente

   return (
      <div>
         <h2 className="text-2xl font-semibold mb-6">Bienvenido a Labs-Sim</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.length > 0 ? (
               clases.map((clase) => (
                  <Card key={clase.id}>
                     <CardHeader>
                        <CardTitle>{clase.name}</CardTitle>
                        <CardDescription>{clase.description}</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Link to={`/class/${clase.id}`}>
                           <Button variant="outline" className="w-full">
                              Ver clase
                           </Button>
                        </Link>
                     </CardContent>
                  </Card>
               ))
            ) : (
               <p>No hay clases disponibles. ¡Crea una!</p>
            )}
            <Card>
               <CardHeader>
                  <CardTitle>Crear nueva clase</CardTitle>
                  <CardDescription>Añade una nueva clase a tu lista</CardDescription>
               </CardHeader>
               <CardContent>
                  <Button className="w-full" onClick={() => setIsModalOpen(true)}>
                     Crear Clase
                  </Button>
               </CardContent>
            </Card>
         </div>

         {/* Modal para crear una clase */}
         <ModalCrearClase isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
   );
}
