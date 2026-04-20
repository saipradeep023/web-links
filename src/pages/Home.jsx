import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { HiLink, HiSparkles, HiExclamationCircle, HiSearch, HiX } from 'react-icons/hi';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { semanticSearch } from '../services/aiService';
import WebsiteCard from '../components/ui/WebsiteCard';

function HomeSearchBar({ onSearch, onClear, isSearching }) {
  const [query, setQuery] = useState('');

  const submit = () => { if (query.trim()) onSearch(query.trim()); };
  const clear = () => { setQuery(''); onClear(); };

  return (
    <div className="w-full max-w-2xl">
      <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-primary-400 focus-within:shadow-xl focus-within:shadow-primary-100/60 transition-all duration-300 shadow-lg">
        <div className="pl-4 pr-3 flex-shrink-0 text-gray-400">
          {isSearching
            ? <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            : <HiSearch className="w-5 h-5" />}
        </div>
        <input
          id="ai-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Search your library with AI..."
          className="flex-1 py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none font-medium"
        />
        {query && (
          <button onClick={clear} className="px-2 text-gray-300 hover:text-gray-500 transition-colors">
            <HiX className="w-4 h-4" />
          </button>
        )}
        <button
          id="ai-search-btn"
          onClick={submit}
          disabled={!query.trim() || isSearching}
          className="mr-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:shadow-primary-200"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'websites'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setWebsites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingWebsites(false);
    });
    return () => unsub();
  }, [user]);

  const handleSearch = useCallback(async (q) => {
    setIsSearching(true);
    setSearchError('');
    setLastQuery(q);
    try {
      const matched = await semanticSearch(q, websites);
      setResults(matched);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [websites]);

  const handleClear = () => { setResults(null); setLastQuery(''); setSearchError(''); };
  const hasResults = results !== null;

  return (
    <div className="-mx-4 md:-mx-8 -my-4 md:-my-6 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative flex-none overflow-hidden" style={{ height: '72%' }}>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 px-4 md:px-8 transition-all duration-500 ease-in-out"
          style={{
            opacity: hasResults ? 0 : 1,
            transform: hasResults ? 'translateY(-40px) scale(0.97)' : 'translateY(0) scale(1)',
            pointerEvents: hasResults ? 'none' : 'auto',
          }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-300/50">
            <HiLink className="text-white text-5xl" />
          </div>

          <div className="text-center px-2">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
              Web<span className="text-primary-600">Links</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-2 md:mt-3 font-medium tracking-wide">
              Your personal web library, powered by AI
            </p>
          </div>

          {!loadingWebsites && (
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                {websites.length} website{websites.length !== 1 ? 's' : ''} saved
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full shadow-sm">
                <HiSparkles className="w-3.5 h-3.5" />
                AI semantic search
              </span>
            </div>
          )}
        </div>

        <div
          className="absolute inset-0 px-4 md:px-8 pt-6 pb-2 overflow-y-auto transition-all duration-500 ease-in-out"
          style={{
            opacity: hasResults ? 1 : 0,
            transform: hasResults ? 'translateY(0)' : 'translateY(20px)',
            pointerEvents: hasResults ? 'auto' : 'none',
            scrollbarWidth: 'none',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiSearch className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {isSearching ? (
                  <span className="animate-pulse">Searching with AI...</span>
                ) : results?.length > 0 ? (
                  <><span className="font-bold text-gray-900">{results.length}</span> result{results.length !== 1 ? 's' : ''} for <span className="font-semibold text-primary-600">"{lastQuery}"</span></>
                ) : (
                  <>No results for <span className="font-semibold text-gray-700">"{lastQuery}"</span></>
                )}
              </span>
            </div>
            <button onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              <HiX className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {searchError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-3">
              <HiExclamationCircle className="w-5 h-5 flex-shrink-0" />
              {searchError}
            </div>
          )}

          {!isSearching && results?.length === 0 && !searchError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <HiSearch className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No matches found</p>
              <p className="text-xs text-gray-400">Try a different query or add more websites.</p>
            </div>
          )}

          {!isSearching && results?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
              {results.map(w => <WebsiteCard key={w.id} website={w} />)}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-none flex flex-col items-center justify-start pt-4 md:pt-5 px-4 md:px-8 gap-3" style={{ height: '28%' }}>
        <div className="absolute top-0 inset-x-4 md:inset-x-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <HomeSearchBar onSearch={handleSearch} onClear={handleClear} isSearching={isSearching} />
        <p className="text-[10px] md:text-xs text-gray-400 text-center">Press Enter or click Search — Gemini finds what you need</p>
      </div>
    </div>
  );
}
