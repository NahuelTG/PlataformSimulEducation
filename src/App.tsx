import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdmPageGrupos from "./pages/AdmPageGrupos"; // Importamos la página de grupos
import ClassPage from "./pages/ClassPage";
import HomePage from "./pages/AdmHomePage"; // Página Home
import { Sidebar } from "./components/SideBar"; // Sidebar si es necesario

function App() {
   return (
      <Router>
         <div className="flex">
            <Sidebar />
            <div className="flex-1 p-4">
               <Routes>
                  {/* Ruta predeterminada */}
                  <Route path="/" element={<AdmPageGrupos />} />

                  {/* Ruta para ver los detalles de clases */}
                  <Route path="/class/:id" element={<ClassPage />} />

                  {/* Ruta para la página Home (redirección desde Ver Grupo) */}
                  <Route path="/homepage" element={<HomePage />} />
               </Routes>
            </div>
         </div>
      </Router>
   );
}

export default App;

