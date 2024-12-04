import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (link: string) => void;
}

export function CustomModal({ isOpen, onClose, onSave }: CustomModalProps) {
   const [link, setLink] = useState("");

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <Card className="w-full max-w-md">
            <CardHeader>
               <CardTitle>Añadir Enlace</CardTitle>
            </CardHeader>
            <CardContent>
               <Input
                  type="url"
                  placeholder="Escribe el enlace..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="mb-4"
               />
               <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button onClick={() => onSave(link)}>Guardar</Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
