import React from 'react';
import Hero from './Hero';
import ContentRow from './ContentRow';

function Home({ library, search, setSearch, onPlay }) {
  const filteredLibrary = library.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
  const categories = filteredLibrary.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    acc[cat] = acc[cat] || [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <>
      <Hero library={library} onPlay={onPlay} />
      <div className="library">
        <input
          className="search"
          placeholder="Search library..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {Object.entries(categories).map(([cat, items]) => (
          <ContentRow key={cat} title={cat} items={items} onPlay={onPlay} />
        ))}
        {Object.keys(categories).length === 0 && (
          <p style={{ textAlign: 'center', color: 'gray' }}>No content available. Admin login to upload.</p>
        )}
      </div>
    </>
  );
}

export default Home;