import { useCallback, useState, useEffect } from "react";
import "./Landing.css";
import { Link } from 'react-router-dom';
import "./Landing.css";
import LoginForm from "../login/LoginForm";

const Landing = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const onPricingClick = useCallback(() => {
    window.location.href = "https://www.umss.edu.bo/";
  }, []);

  const onSupportClick = useCallback(() => {
    window.location.href = "http://www.fcyt.umss.edu.bo/";
  }, []);

  const onImage2Click = useCallback(() => {
    window.location.href = "http://www.fcyt.umss.edu.bo/";
  }, []);

  const onImage3Click = useCallback(() => {
    window.location.href = "https://www.umss.edu.bo/";
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const hamburger = document.querySelector('.hamburger');
      if (hamburger) {
        setIsVisible(window.getComputedStyle(hamburger).display !== 'none');
      }
    };
    handleResize(); // Call once to set initial state
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
  <>
    <div className="hero-06">
      <div className="nav-bar">
        <button className="logon">
          {/* <img className="image-1-icon" alt="" src="/image-1@2x.png" />
          <div className="ovonrueden">SimultechAcademy</div> */}
        </button>
        <div className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu} style={{ marginRight: '20px' }}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="menu">
          <button className="about">        </button>
          <button className="about">        </button>
          <a className="pricing" onClick={onPricingClick}>
            UMSS
          </a>
          <a className="pricing" onClick={onSupportClick}>
            FCYT
          </a>
        </div>
      </div>
      
      <div className="content">
        <div className="landing-content">
          <div className="heading-logo">
                {!isVisible && (
                  <div className="design-parent">
                    <img className="frame-icon" alt="" src="/frame.svg" />
                  </div>
                )}
                <div className="heading-text">
                  <div className="vestibulum-placerat">
                  La plataforma de LMS y centro de contenido integral 
                  para la simulación de sistemas, ofreciendo una experiencia 
                  educativa e interactiva, diseñada para los 
                  estudiantes de la Universidad San Simón.
                  </div>
                </div>
          </div>
          
          <div className="landing-container">
            <LoginForm />
          </div> 
        </div>
      </div>
      
      <footer className="image" />
    </div>
  </>  
  );
};

export default Landing;