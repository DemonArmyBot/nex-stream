import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ isLoggedIn, library }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/user/profile'); // Placeholder endpoint; add in backend if needed
        setUser(res.data);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (isLoggedIn) fetchUser();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Please login to view profile.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile</h1>
      <p><strong>Username:</strong> {user?.username || 'User'}</p>
      <h2>Watch History</h2>
      <ul>
        {history.map((item, index) => (
          <li key={index}>{item.title} ({item.type})</li>
        ))}
        {history.length === 0 && <p>No watch history yet.</p>}
      </ul>
      <h2>Recent Library Items</h2>
      <ul>
        {library.slice(0, 5).map((item) => (
          <li key={item._id}>{item.title} ({item.category})</li>
        ))}
        {library.length === 0 && <p>No items available.</p>}
      </ul>
    </div>
  );
}

export default Profile;