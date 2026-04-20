import { useRef, useState } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

/**
 * SearchBar — full-width AI search input.
 *
 * Props:
 *   onSearch   – (query: string) => void  called on submit
 *   onClear    – () => void               called when X is clicked
 *   isSearching – boolean                 shows spinner
 */
export default function SearchBar({ onSearch, onClear, isSearching }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    const q = query.trim();
    if (q) onSearch(q);
  };

  const clear = () => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl relative">
      {/* Glow ring on focus */}
      <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-primary-400 focus-within:shadow-lg focus-within:shadow-primary-100 transition-all duration-200 shadow-md">
        {/* Search icon */}
        <div className="pl-4 pr-3 text-gray-400">
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          ) : (
            <HiSearch className="w-5 h-5" />
          )}
        </div>

        {/* Input */}
        <input
          id="ai-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="Search your library with AI..."
          className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={clear}
            className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}

        {/* Search button */}
        <button
          id="ai-search-btn"
          onClick={submit}
          disabled={!query.trim() || isSearching}
          className="mr-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          Search
        </button>
      </div>
    </div>
  );
}
