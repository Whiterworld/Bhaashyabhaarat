import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './nav.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));
    setIsLoggedIn(loggedIn);
    setUserName(user?.name || user?.email || '');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login');
  };

  const isChatPage = location.pathname === '/chat';

  return (
    <nav className="navbar">
      {!isLoggedIn ? (
        isChatPage ? (
          // Not logged in & on chat page
          <>
            <Link to="/login" className="end">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          // Not logged in & on other pages
          <>
            <Link to="/" className="gap">Home</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )
      ) : (
        isChatPage ? (
          // Logged in & on chat page — ONLY show user + logout
          <>
            <span className="user-icon">👤 {userName}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          // Logged in & on other pages — full nav
          <>
            <Link to="/" className="gap">Home</Link>
            <Link to="/chat">Chat</Link>
            <span className="user-icon">👤 {userName}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        )
      )}
    </nav>
  );
};

export default Navbar;
