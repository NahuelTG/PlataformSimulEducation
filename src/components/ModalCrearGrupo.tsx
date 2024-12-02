import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, addDoc, collection } from "../firebase/firebaseConfig"; // Asegúrate de importar correctamente las funciones de Firestore
import { doc, setDoc } from "firebase/firestore"; 

interface ModalCrearGrupoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalCrearGrupo({ isOpen, onClose }: ModalCrearGrupoProps) {
  const [groupName, setGroupName] = useState(""); // Nombre del grupo
  const [groupDescription, setGroupDescription] = useState(""); // Descripción
  const [groupNumber, setGroupNumber] = useState(""); // Número de grupo
  const [error, setError] = useState(""); // Manejo de errores
  const [loading, setLoading] = useState(false); // Estado de carga

  const handleCreateGroup = async () => {
    if (!groupName || !groupDescription || !groupNumber) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Crear el grupo en Firestore
      const gruposCollection = collection(db, "grupos");
      const docRef = await addDoc(gruposCollection, {
        name: groupName,
        description: groupDescription,
        number: groupNumber,
      });

      // Actualizar el grupo con su propio `id`
      await setDoc(doc(db, "grupos", docRef.id), {
        name: groupName,
        description: groupDescription,
        number: groupNumber,
        idGrupo: docRef.id, // Agregar el id del documento
      });

      console.log("Grupo creado con ID: ", docRef.id);

      // Limpiar los campos del modal
      setGroupName("");
      setGroupDescription("");
      setGroupNumber("");
      onClose(); // Cerrar el modal
    } catch (err) {
      console.error("Error al agregar grupo:", err);
      setError("Hubo un error al crear el grupo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Nuevo Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Input
            type="text"
            placeholder="Nombre del Grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="Descripción"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="Número de Grupo"
            value={groupNumber}
            onChange={(e) => setGroupNumber(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGroup} disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}