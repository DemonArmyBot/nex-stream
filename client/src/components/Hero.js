import React, { useState, useEffect } from 'react';

function Hero({ library, onPlay }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (library.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % library.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [library]);

  if (!library[current]) return <div className="hero"></div>;

  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${library[current].thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48L3N2Zz4='})` }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>{library[current].title}</h1>
        <p>{library[current].type === 'video' ? 'Watch now' : 'Read now'}</p>
        <button onClick={() => onPlay(library[current])}>
          <span className="material-icons">play_arrow</span> Play
        </button>
      </div>
    </section>
  );
}

export default Hero;