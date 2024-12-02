import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, collection, getDocs } from "../firebase/firebaseConfig"; // Importa Firestore correctamente
import { ModalCrearGrupo } from "../components/ModalCrearGrupo"; // Modal para crear el grupo
// Puedes incluir cualquier otro componente que necesites, como NavBar si es necesario, pero sin el Sidebar

export default function AdmPageGrupos() {
   const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar si el modal está abierto
   const [grupos, setGrupos] = useState<any[]>([]); // Lista de grupos desde Firestore
 
   // Cargar los grupos desde Firestore
   const loadGrupos = async () => {
     try {
       const gruposCollection = collection(db, "grupos");
       const gruposSnapshot = await getDocs(gruposCollection);
       const gruposList = gruposSnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
       }));
       setGrupos(gruposList); // Actualizar el estado con los grupos
     } catch (err) {
       console.log("Error cargando los grupos:", err);
     }
   };
 
   useEffect(() => {
     loadGrupos(); // Cargar los grupos cuando se monta el componente
   }, []);
 
   return (
     <div>
       <h2 className="text-2xl font-semibold mb-6">Grupos</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {grupos.length > 0 ? (
           grupos.map((grupo) => (
             <Card key={grupo.id}>
               <CardHeader>
                 <CardTitle>{grupo.name}</CardTitle>
                 <CardDescription>{grupo.description}</CardDescription>
                 {/* Aquí ya no incluimos 'grupo.nivel' o algo relacionado con "Niveles" */}
               </CardHeader>
               <CardContent>
                  <Link to={`/homepage?groupId=${grupo.idGrupo}`}>
                    <Button variant="outline" className="w-full">
                      Ver Grupo
                    </Button>
                  </Link>
                </CardContent>

             </Card>
           ))
         ) : (
           <p>No hay grupos disponibles. ¡Crea uno!</p>
         )}
 
         {/* Card para crear un nuevo grupo */}
         <Card>
           <CardHeader>
             <CardTitle>Crear Nuevo Grupo</CardTitle>
             <CardDescription>Añade un nuevo grupo a tu lista</CardDescription>
           </CardHeader>
           <CardContent>
             <Button className="w-full" onClick={() => setIsModalOpen(true)}>
               Crear Grupo
             </Button>
           </CardContent>
         </Card>
       </div>
 
       {/* Modal de Crear Grupo */}
       <ModalCrearGrupo isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
     </div>
   );
 }
 
