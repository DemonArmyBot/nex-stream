import React from 'react';

function Profile({ isLoggedIn, library }) {
  if (!isLoggedIn) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Please login to view profile.</div>;
  }

  const username = localStorage.getItem('token') ? 'User' : ''; // Decode from token if needed
  const history = JSON.parse(localStorage.getItem('watchHistory')) || []; // Placeholder for history

  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile</h1>
      <p><strong>Username:</strong> {username}</p>
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