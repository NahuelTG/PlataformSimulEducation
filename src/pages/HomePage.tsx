import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ModalCrearClase } from "../components/ModalCrearClase";
import { NavBar } from "../components/NavBar";

const levels = [
   { id: 1, name: "Nivel 1 - Dados", description: "Simulaciones básicas con dados." },
   { id: 2, name: "Nivel 2 - Monedas", description: "Simulación de lanzamientos de monedas." },
   { id: 3, name: "Nivel 3 - Generación Aleatoria", description: "Números aleatorios y estadísticas." },
   { id: 4, name: "Nivel 4 - Poker", description: "Simulación de manos de poker." },
   { id: 5, name: "Nivel 5 - Aplicación de Simulación", description: "Crea tu propio modelo." },
];

export default function HomePage() {
   const [isModalOpen, setIsModalOpen] = useState(false);

   return (
      <div>
         <h2 className="text-2xl font-semibold mb-6">Bienvenido a Labs-Sim</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
               <Card key={level.id}>
                  <CardHeader>
                     <CardTitle>{level.name}</CardTitle>
                     <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link to={`/class/${level.id}`}>
                        <Button variant="outline" className="w-full">
                           Ver clase
                        </Button>
                     </Link>
                  </CardContent>
               </Card>
            ))}
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
