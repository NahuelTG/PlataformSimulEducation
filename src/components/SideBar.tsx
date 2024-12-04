import { Link, useLocation } from "react-router-dom";
import { Home, Book } from "lucide-react";

const levels = [
   { id: 1, name: "Nivel 1" },
   { id: 2, name: "Nivel 2" },
   { id: 3, name: "Nivel 3" },
   { id: 4, name: "Nivel 4" },
   { id: 5, name: "Nivel 5" },
];

export function Sidebar() {
   const location = useLocation();

   return (
      <div className="w-64 bg-white shadow-md">
         <div className="p-4">
            <Link
               to="/"
               className={`flex items-center p-2 rounded-lg hover:bg-gray-100 mb-4 ${location.pathname === "/" ? "bg-gray-100" : ""}`}
            >
               <Home className="mr-2 h-5 w-5" />
               <span className="font-semibold">Inicio</span>
            </Link>
            <h2 className="text-lg font-semibold mb-4">Niveles</h2>
            <nav>
               <ul>
                  {levels.map((level) => (
                     <li key={level.id} className="mb-2">
                        <Link
                           to={`/class/${level.id}`}
                           className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                              location.pathname === `/class/${level.id}` ? "bg-gray-100" : ""
                           }`}
                        >
                           <Book className="mr-2 h-5 w-5" />
                           <span>{level.name}</span>
                        </Link>
                     </li>
                  ))}
               </ul>
            </nav>
         </div>
      </div>
   );
}
