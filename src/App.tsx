import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdmHomePage from "./pages/AdmHomePage";
import ClassPage from "./pages/ClassPage";
import { Sidebar } from "./components/SideBar";

function App() {
   return (
      <Router>
         <div className="flex">
            <Sidebar />
            <div className="flex-1 p-4">
               <Routes>
                  <Route path="/" element={<AdmHomePage />} />
                  <Route path="/class/:id" element={<ClassPage />} />
               </Routes>
            </div>
         </div>
      </Router>
   );
}

export default App;
