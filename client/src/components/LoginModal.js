import React, { useState } from 'react';
import axios from 'axios';

function LoginModal({ setIsLoggedIn, setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError(''); // Clear previous errors
    try {
      const endpoint = isAdminLogin ? '/login' : '/register';
      const res = await axios.post(`/auth${endpoint}`, { username, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      // Decode token to get role (assuming JWT contains role)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      localStorage.setItem('role', role);
      setIsLoggedIn(true);
      setIsAdmin(role === 'admin');
      document.querySelector(isAdminLogin ? '.admin-form' : '.login-form').classList.remove('active');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <>
      <div className="modal login-form">
        <h3>{isAdminLogin ? 'Admin Login' : 'Login / Register'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>{isAdminLogin ? 'Login' : 'Submit'}</button>
        {!isAdminLogin && (
          <button
            onClick={() => {
              setIsAdminLogin(true);
              document.querySelector('.login-form').classList.remove('active');
              document.querySelector('.admin-form').classList.add('active');
            }}
          >
            Admin Login
          </button>
        )}
      </div>
      <div className="modal admin-form">
        <h3>Admin Login</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>Login</button>
      </div>
    </>
  );
}

export default LoginModal;