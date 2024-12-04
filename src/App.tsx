import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ClassPage from "./pages/ClassPage";
import { Sidebar } from "./components/SideBar";

function App() {
   return (
      <Router>
         <div className="flex">
            <Sidebar />
            <div className="flex-1 p-4">
               <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/class/:id" element={<ClassPage />} />
               </Routes>
            </div>
         </div>
      </Router>
   );
}

export default App;
