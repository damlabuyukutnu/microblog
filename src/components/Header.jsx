import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  return (
    <header className="x-header py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link to="/" className="text-decoration-none">
          <img src="/Black and Gold Modern Starlight Logo.png" alt=""  className="logo-img"/>
            </Link>
          </div>
          
          <nav className="d-flex">

            {isLoggedIn && (
              <>             
              <Link 
              to="/" 
              className={`x-nav-link me-2 ${location.pathname === '/' ? 'active' : ''}`}
            >
              Ana Sayfa
            </Link> 
            <Link 
                to="/profile" 
                className={`x-nav-link me-2 ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profil
              </Link>
            </>
  
            )}
            {!isLoggedIn && (
              <>
               <Link 
              to="/login" 
              className={`x-nav-link me-2 ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Giriş
            </Link>
            <Link 
              to="/register" 
              className={`x-nav-link ${location.pathname === '/register' ? 'active' : ''}`}
            >
              Kayıt Ol
            </Link>
              </>
            )}
           
          </nav>
        </div>
      </div>
    </header>
  );
};

 