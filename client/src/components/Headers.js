import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="material-icons">play_circle</span>
        NexusStream
      </div>
      <nav className="nav">
        <button onClick={() => document.querySelector('.search').focus()}>Search</button>
        {!isLoggedIn && (
          <button onClick={() => document.querySelector('.login-form').classList.add('active')}>
            Login
          </button>
        )}
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        {isAdmin && (
          <button onClick={() => document.querySelector('.upload-panel').classList.add('active')}>
            Admin
          </button>
        )}
      </nav>
    </header>
  );
}

export default Header;