import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NavBar() {
   return (
      <div className="flex items-center justify-between bg-blue-600 text-white p-4 mb-4 rounded-lg">
         <Link to="/" className="text-xl font-bold">
            Labs-Sim
         </Link>
         <Button variant="outline" className="bg-white text-blue-600">
            Calificar
         </Button>
      </div>
   );
}
