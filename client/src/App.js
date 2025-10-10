import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import Settings from './components/Settings';
import PlayerModal from './components/PlayerModal';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [library, setLibrary] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');
  const [currentItem, setCurrentItem] = useState(null);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Persist theme

  useEffect(() => {
    // Set API base URL to Render backend
    axios.defaults.baseURL = 'https://nex-stream.onrender.com/api';
    console.log('API Base URL:', axios.defaults.baseURL);
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

    // Persist login state on refresh
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const savedTheme = localStorage.getItem('theme');
    if (token && role) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'admin');
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }

    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get('/content/library');
      setLibrary(res.data);
    } catch (err) {
      console.error('Library fetch error:', err);
    }
  };

  const handlePlay = (item) => setCurrentItem(item);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentItem(null);
    window.location.href = '/'; // Immediate navigation to home
  };

  return (
    <Router>
      <div className={theme}>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <Routes>
          <Route path="/" element={
            <Home library={library} search={search} setSearch={setSearch} onPlay={handlePlay} />
          } />
          <Route path="/profile" element={
            <Profile isLoggedIn={isLoggedIn} library={library} />
          } />
          <Route path="/settings" element={
            <Settings theme={theme} setTheme={setTheme} onLogout={handleLogout} />
          } />
        </Routes>
        {currentItem && <PlayerModal item={currentItem} onClose={() => setCurrentItem(null)} />}
        <LoginModal setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
        {isAdmin && <AdminPanel refreshLibrary={fetchLibrary} />}
      </div>
    </Router>
  );
}

export default App;