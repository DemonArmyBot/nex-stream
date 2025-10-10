import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ContentRow from './components/ContentRow';
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

  useEffect(() => {
  axios.defaults.baseURL = 'https://nex-stream.onrender.com/api';
  console.log('API Base URL:', axios.defaults.baseURL);
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  fetchLibrary();
}, []);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get('/content/library');
      setLibrary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlay = (item) => setCurrentItem(item);

  return (
    <Router>
      <div>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero library={library} onPlay={handlePlay} />
                <div className="library">
                  <input
                    className="search"
                    placeholder="Search library..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {Object.entries(
                    library
                      .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
                      .reduce((acc, item) => {
                        const cat = item.category || 'Uncategorized';
                        acc[cat] = acc[cat] || [];
                        acc[cat].push(item);
                        return acc;
                      }, {})
                  ).map(([cat, items]) => (
                    <ContentRow key={cat} title={cat} items={items} onPlay={handlePlay} />
                  ))}
                </div>
              </>
            }
          />
          <Route path="/profile" element={<div>Profile Page (Under Development)</div>} />
          <Route path="/settings" element={<div>Settings Page (Under Development)</div>} />
        </Routes>
        {currentItem && <PlayerModal item={currentItem} onClose={() => setCurrentItem(null)} />}
        <LoginModal setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
        {isAdmin && <AdminPanel refreshLibrary={fetchLibrary} />}
      </div>
    </Router>
  );
}

export default App;