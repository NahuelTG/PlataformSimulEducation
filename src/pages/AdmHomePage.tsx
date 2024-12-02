import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchClassesForGroup } from "../services/firebaseQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalCrearClase } from "../components/ModalCrearClase";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const loadClases = async () => {
    try {
      if (!groupId) {
        console.error("No se encontró ningún idGrupo en la URL.");
        setClases([]);
        setLoading(false);
        return;
      }

      // Filtrar clases por idGrupo
      const clasesList = await fetchClassesForGroup(groupId);
      setClases(clasesList);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar las clases:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClases(); // Carga inicial de clases
  }, [groupId]);

  if (loading) {
    return <p>Cargando clases...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Clases del Grupo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clases.length > 0 ? (
          clases.map((clase) => (
            <Card key={clase.id}>
              <CardHeader>
                <CardTitle>{clase.name}</CardTitle>
                <CardDescription>{clase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Ver Clase
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No hay clases asociadas a este grupo.</p>
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
      <ModalCrearClase
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadClases(); // Recargar clases después de crear una nueva
        }}
        groupId={groupId!} // Pasa el ID del grupo al modal
      />
    </div>
  );
}
