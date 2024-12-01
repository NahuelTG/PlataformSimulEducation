import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { db, addDoc, collection } from "../firebase/firebaseConfig";  // Asegúrate de importar correctamente las funciones de Firestore

interface ModalCrearClaseProps {
   isOpen: boolean;
   onClose: () => void;
}

export function ModalCrearClase({ isOpen, onClose }: ModalCrearClaseProps) {
   const [className, setClassName] = useState("");
   const [classDescription, setClassDescription] = useState("");

   // Función para agregar clase a Firebase
   const handleCreateClass = async () => {
      if (!className || !classDescription) {
         console.log("Por favor completa todos los campos.");
         return;
      }

      try {
         // Usamos Firestore para agregar la nueva clase
         const docRef = await addDoc(collection(db, "clases"), {
            name: className,
            description: classDescription,
         });

         console.log("Clase creada con ID: ", docRef.id);
         setClassName(""); // Limpiar el input después de agregar la clase
         setClassDescription("");
         onClose(); // Cerrar el modal después de agregar la clase
      } catch (err) {
         console.log("Error al agregar clase", err);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <Card className="w-full max-w-md">
            <CardHeader>
               <CardTitle>Crear Nueva Clase</CardTitle>
            </CardHeader>
            <CardContent>
               <Input
                  type="text"
                  placeholder="Nombre de la clase"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mb-4"
               />
               <Input
                  type="text"
                  placeholder="Descripción de la clase"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="mb-4"
               />
               <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button onClick={handleCreateClass}>Crear</Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
