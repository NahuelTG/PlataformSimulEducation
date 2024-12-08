import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa';
import { UserContext } from '../../context/UserContext';
import './Sidebar.css';
import Logo from "../../assets/Logo.png";
import TextLogo from "../../assets/TextLogo.png";
import Home from "../../assets/Home.png";
import AddClass from "../../assets/AddClass.png";
import SupportClass from "../../assets/SupportClass.png";
import IconForo from "../../assets/Foro.png";

const Sidebar = () => {
  const { setCurrentUser, setRoleC, currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userDataEncriptado');
    setCurrentUser(null);
    setRoleC(null);
    navigate("/");
  };

  const handleClose = () => {
    setIsVisible(false);
    setSidebarOpen(false);
  };

  const handleOpen = () => {
    setSidebarOpen(true);
    setIsVisible(true);
  };

  return (
    <div>
      <div className="admin-sidebar">
        {isVisible && (
          <button className='botond' onClick={handleClose}><FaTimes /></button>
        )}
        <div className="header-container">
          <div className="logo-container">
            <img src={TextLogo} className="logo" width="80" height="80" />
            <img src={Logo} className="img-logo" width="80" height="80" />
          </div>
        </div>
        <ul>
          <li>
            <Link to="/Admin/inicio" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={Home} alt="Inicio" style={{ width: '38px', height: '38px', marginRight: '25px' }} />
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/Admin/crear-curso" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={AddClass} alt="Crear Curso" style={{ width: '38px', height: '38px', marginRight: '25px' }} />
              Crear Clase
            </Link>
          </li>
          <li>
            <Link to="/Admin/recursos-curso" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={SupportClass} alt="Soporte de Curso" style={{ width: '38px', height: '38px', marginRight: '25px' }} />
              Material de apoyo
            </Link>
            <li>
            <Link to="/Admin/mensajes" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={IconForo} alt="Mensajes" style={{ width: '38px', height: '38px', marginRight: '25px' }} />
              Foro
            </Link>
          </li>
          </li>
        </ul>
        <div className="logout-button">
          <button onClick={handleLogout}>
            <FiLogOut size={30} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
