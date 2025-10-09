import React from 'react';

function ContentRow({ title, items, onPlay }) {
  return (
    <div className="content-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-grid">
        {items.map(item => (
          <div key={item._id} className="card" onClick={() => onPlay(item)}>
            <img src={item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjMzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+'} alt={item.title} />
            <div className="card-type">{item.type.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentRow;