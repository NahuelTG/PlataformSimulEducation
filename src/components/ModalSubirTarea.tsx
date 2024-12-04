import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ModalCrearClaseProps {
   isOpen: boolean;
   onClose: () => void;
}

export function ModalCrearClase({ isOpen, onClose }: ModalCrearClaseProps) {
   const [className, setClassName] = useState("");
   const [classDescription, setClassDescription] = useState("");

   const handleCreateClass = () => {
      console.log("Clase creada:", { name: className, description: classDescription });
      // Aquí puedes manejar la lógica para añadir la clase, como actualizar un estado global o llamar a una API
      setClassName("");
      setClassDescription("");
      onClose();
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <Card className="w-full max-w-md">
            <CardHeader>
               <CardTitle>Subir Documentos</CardTitle>
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
