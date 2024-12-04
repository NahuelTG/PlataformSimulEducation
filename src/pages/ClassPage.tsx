import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar } from "lucide-react";
import { CustomModal } from "../components/CustomModal";
import { useState } from "react";
import { NavBar } from "../components/NavBar";

const levelsData = {
   1: {
      name: "Dados",
      teacher: "Simulaciones Básicas",
      content: [
         { id: 1, title: "Lanzar dos dados", description: "Simula el lanzamiento de dos dados." },
         { id: 2, title: "Distribución de resultados", description: "Visualiza las combinaciones posibles." },
      ],
   },
   2: {
      name: "Monedas",
      teacher: "Simulación Intermedia",
      content: [
         { id: 1, title: "Cara o cruz", description: "Simula un lanzamiento de monedas." },
         { id: 2, title: "Probabilidad", description: "Calcula las probabilidades de obtener caras o cruces." },
      ],
   },
   3: {
      name: "Generación de Números Aleatorios",
      teacher: "Teoría de Simulación",
      content: [
         { id: 1, title: "Generar números", description: "Obtén números aleatorios en un rango." },
         { id: 2, title: "Histogramas", description: "Genera gráficos de las distribuciones." },
      ],
   },
   4: {
      name: "Poker",
      teacher: "Modelos Avanzados",
      content: [
         { id: 1, title: "Simular manos de poker", description: "Reparte cartas y simula manos reales." },
         { id: 2, title: "Probabilidad de ganar", description: "Calcula probabilidades para cada mano." },
      ],
   },
   5: {
      name: "Aplicación de Simulación",
      teacher: "Proyectos Finales",
      content: [
         { id: 1, title: "Simulación personalizada", description: "Crea un modelo basado en tus necesidades." },
         { id: 2, title: "Optimización", description: "Mejora tu simulación con técnicas avanzadas." },
      ],
   },
};

export default function ClassPage() {
   const { id } = useParams<{ id: string }>(); // Obtén el ID desde la URL
   const level = levelsData[parseInt(id || "1")]; // Encuentra los datos del nivel actual
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalOpenTask, setIsModalOpenTask] = useState(false);

   const handleSaveLink = (link: string) => {
      console.log(`Enlace guardado para nivel ${id}:`, link); // Lógica de guardado
      setIsModalOpen(false);
   };

   if (!level) {
      return <div>Error: Nivel no encontrado</div>;
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
                  {level.content.map((item) => (
                     <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                        <div>
                           <h4 className="font-semibold">{item.title}</h4>
                           <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <Button variant="outline">Ver detalles</Button>
                     </div>
                  ))}
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
         <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLink} />
         <NavBar></NavBar>
      </div>
   );
}
