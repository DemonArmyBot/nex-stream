import React from 'react';
import axios from 'axios';

function ContentRow({ title, items, onPlay }) {
  const isAdmin = localStorage.getItem('role') === 'admin';

  const handleEdit = async (id, field, value) => {
    try {
      await axios.put(`/api/content/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      window.location.reload(); // Refresh to update UI
    } catch (err) {
      console.error(`Edit ${field} error:`, err);
    }
  };

  return (
    <div className="content-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-grid">
        {items.map(item => (
          <div key={item._id} className="card" onClick={() => onPlay(item)}>
            <img src={item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjMzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+'} alt={item.title} />
            <div className="card-type">{item.type.toUpperCase()}</div>
            <p>{item.title}</p>
            {isAdmin && (
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleEdit(item._id, 'title', e.target.value)}
                style={{ marginTop: '5px', width: '80%' }}
              />
            )}
            <p>{item.metadata?.resolution} - {item.metadata?.duration}</p>
            {isAdmin && (
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={item.thumbnail || ''}
                onChange={(e) => handleEdit(item._id, 'thumbnail', e.target.value)}
                style={{ marginTop: '5px', width: '80%' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentRow;