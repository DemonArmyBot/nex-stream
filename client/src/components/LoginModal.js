import React, { useState } from 'react';
import axios from 'axios';

function LoginModal({ setIsLoggedIn, setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleSubmit = async () => {
    try {
      const endpoint = isAdminLogin ? '/login' : '/register';
      const res = await axios.post(`http://localhost:5000/api/auth${endpoint}`, { username, password });
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('role', 'admin');
        setIsAdmin(true);
      }
      document.querySelector(isAdminLogin ? '.admin-form' : '.login-form').classList.remove('active');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="modal login-form">
        <h3>Login / Register</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        <button
          onClick={() => {
            setIsAdminLogin(true);
            document.querySelector('.login-form').classList.remove('active');
            document.querySelector('.admin-form').classList.add('active');
          }}
        >
          Admin Login
        </button>
      </div>
      <div className="modal admin-form">
        <h3>Admin Login</h3>
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>Login</button>
      </div>
    </>
  );
}

export default LoginModal;