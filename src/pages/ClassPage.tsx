import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar } from "lucide-react";
import { CustomModal } from "../components/CustomModal";
import { useState, useEffect } from "react";
import { db, collection, getDoc, doc } from "../firebase/firebaseConfig"; // Importa Firestore correctamente
import { NavBar } from "../components/NavBar";

export default function ClassPage() {
   const { id } = useParams<{ id: string }>(); // Obtén el ID desde la URL
   const [level, setLevel] = useState<any | null>(null); // El estado de la clase
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalOpenTask, setIsModalOpenTask] = useState(false);

   // Carga los datos de la clase desde Firestore
   const loadClassData = async () => {
      try {
         const classDocRef = doc(db, "clases", id || ""); // Ref a la clase usando el ID
         const classSnapshot = await getDoc(classDocRef); // Obtén el documento
         if (classSnapshot.exists()) {
            setLevel(classSnapshot.data()); // Guardamos los datos de la clase
         } else {
            console.log("Clase no encontrada");
         }
      } catch (err) {
         console.error("Error cargando la clase:", err);
      }
   };

   // Llama a la función para cargar la clase cuando el componente se monta
   useEffect(() => {
      loadClassData();
   }, [id]); // Solo se vuelve a ejecutar si el ID cambia

   if (!level) {
      return <div>Cargando clase...</div>; // Mostrar mientras se carga la clase
   }

   return (
      <div>
         {/* Encabezado */}
         <div className="bg-blue-600 text-white p-6 mb-6 rounded-lg">
            <h2 className="text-3xl font-bold">{level.name}</h2>
            <p>{level.teacher}</p>
         </div>
         {/* Contenido dinámico */}
         <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
               <CardHeader>
                  <CardTitle>Actividades</CardTitle>
               </CardHeader>
               <CardContent>
                  {level.content && level.content.length > 0 ? (
                     level.content.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                           <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-gray-500">{item.description}</p>
                           </div>
                           <Button variant="outline">Ver detalles</Button>
                        </div>
                     ))
                  ) : (
                     <p>No hay actividades disponibles para esta clase.</p>
                  )}
               </CardContent>
            </Card>

            {/* Meet y programación */}
            <Card>
               <CardHeader>
                  <CardTitle>Meet de la clase</CardTitle>
               </CardHeader>
               <CardContent>
                  <Button className="w-full mb-2" onClick={() => window.open("https://meet.google.com/abc-defg-hij", "_blank")}>
                     <Video className="mr-2 h-4 w-4" /> Unirse ahora
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
                     <Calendar className="mr-2 h-4 w-4" /> Programar
                  </Button>
                  <Button variant="outline" className="w-full mt-2" onClick={() => setIsModalOpen(true)}>
                     <Calendar className="mr-2 h-4 w-4" /> Subir Documentos
                  </Button>
               </CardContent>
            </Card>
         </div>
         {/* Modal de Añadir Enlace */}
         <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(link: string) => console.log(`Enlace guardado: ${link}`)} />
         <NavBar></NavBar>
      </div>
   );
}
