import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { HiBookmark, HiSearch } from 'react-icons/hi';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../services/categoryService';
import FilterTabs from '../components/ui/FilterTabs';
import WebsiteCard from '../components/ui/WebsiteCard';

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse">
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
        <div className="h-2.5 bg-gray-100 rounded-full w-full mt-1" />
        <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
        {filtered ? (
          <HiSearch className="w-7 h-7 text-gray-400" />
        ) : (
          <HiBookmark className="w-7 h-7 text-gray-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600">
          {filtered ? 'No websites in this category' : 'No websites saved yet'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {filtered
            ? 'Switch to "All" or add a new website in this category.'
            : 'Click "Add Website" in the top right to get started.'}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Websites() {
  const { user } = useAuth();

  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ── Real-time websites subscription ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'websites'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setWebsites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingWebsites(false);
    });
    return () => unsub();
  }, [user]);

  // ── Real-time categories subscription ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'categories'),
      () => {
        fetchCategories(user.uid).then(cats => {
          setCategories(cats);
          setLoadingCategories(false);
        });
      }
    );
    return () => unsub();
  }, [user]);

  // ── Build filter tabs ────────────────────────────────────────────────────────
  const customCats = categories.filter(c => c.name !== 'Other');
  const otherCount = websites.filter(w => w.categoryName === 'Other').length;

  const tabs = [
    { id: 'All', label: 'All', count: websites.length },
    ...customCats.map(c => ({
      id: c.name,
      label: c.name,
      count: websites.filter(w => w.categoryName === c.name).length,
    })),
    { id: 'Other', label: 'Other', count: otherCount },
  ];

  // ── Filtered websites ────────────────────────────────────────────────────────
  const filtered = activeTab === 'All'
    ? websites
    : websites.filter(w => w.categoryName === activeTab);

  // Reset activeTab if it no longer exists (e.g. category was deleted)
  useEffect(() => {
    if (activeTab === 'All') return;
    const tabStillExists = tabs.some(t => t.id === activeTab);
    if (!tabStillExists) setActiveTab('All');
  }, [tabs, activeTab]);

  const isLoading = loadingWebsites || loadingCategories;

  return (
    /* overflow-y-auto + no-scrollbar: page stays fixed, content scrolls invisibly */
    <div className="flex flex-col gap-4 md:gap-6 h-[calc(100vh-89px)] md:h-[calc(100vh-105px)] overflow-y-auto no-scrollbar -mx-4 md:mx-0 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="fade-up">
        <h1 className="text-xl font-bold text-gray-900">My Library</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {isLoading ? 'Loading...' : `${websites.length} website${websites.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="fade-up">
          <FilterTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* ── Website Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filtered={activeTab !== 'All'} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-6">
          {filtered.map(website => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      )}
    </div>
  );
}
