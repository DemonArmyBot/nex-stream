import React from 'react';

function Settings({ theme, setTheme, onLogout }) {
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>Theme: </label>
        <button onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onLogout} style={{ background: 'red', color: 'white', padding: '10px' }}>
          Logout
        </button>
      </div>
      <p>App Version: 1.0.0</p>
      <p>Logout will clear your session. Refresh may require re-login.</p>
    </div>
  );
}

export default Settings;