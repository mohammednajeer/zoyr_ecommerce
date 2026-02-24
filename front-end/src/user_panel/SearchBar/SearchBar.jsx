import React, { useState } from 'react';
import './SearchBar.css';


function SearchBar({ placeholder, onSearch }) {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(query);
      setQuery('');
    }
  }

  const handleClick = () => {
    onSearch(query);
    setQuery('');
  }

  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleClick}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;
