import { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, getDocs,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUrlMetadata, getFaviconUrl,
  normalizeUrl, isValidUrl,
} from '../../services/metadataService';
import {
  HiX, HiPlus, HiGlobeAlt, HiSparkles,
  HiExclamationCircle, HiTag, HiCheck,
} from 'react-icons/hi';

function sortCategories(cats) {
  return [...cats].sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return a.name.localeCompare(b.name);
  });
}

export default function AddWebsiteModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);

  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaAutoFilled, setMetaAutoFilled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [formError, setFormError] = useState('');

  const urlInputRef = useRef(null);

  const [render, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
    } else if (render) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, render]);

  useEffect(() => {
    if (!render && !isClosing) resetForm();
  }, [render, isClosing]);

  useEffect(() => {
    if (isOpen && user) {
      loadCategories();
      setTimeout(() => urlInputRef.current?.focus(), 80);
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  function resetForm() {
    setUrl(''); setTitle(''); setDescription('');
    setSelectedCatId(''); setShowNewCat(false); setNewCatName('');
    setIsFetchingMeta(false); setMetaAutoFilled(false); setIsSaving(false);
    setUrlError(''); setDuplicateError(''); setFormError('');
  }

  async function loadCategories() {
    setLoadingCats(true);
    try {
      const catsRef = collection(db, 'users', user.uid, 'categories');
      const snap = await getDocs(catsRef);
      let cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (!cats.some(c => c.name === 'Other')) {
        const ref = await addDoc(catsRef, { name: 'Other', isDeletable: false });
        cats.push({ id: ref.id, name: 'Other', isDeletable: false });
      }

      const sorted = sortCategories(cats);
      setCategories(sorted);
      if (sorted.length > 0) setSelectedCatId(sorted[0].id);
    } catch (err) {
      console.error('loadCategories error:', err);
    } finally {
      setLoadingCats(false);
    }
  }

  async function handleUrlBlur() {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    if (!isValidUrl(normalized)) {
      setUrlError('Please enter a valid URL (e.g. https://example.com)');
      return;
    }
    setUrlError('');
    setUrl(normalized);
    setDuplicateError('');

    if (!title && !description) {
      setIsFetchingMeta(true);
      const meta = await fetchUrlMetadata(normalized);
      if (meta) {
        if (meta.title) setTitle(meta.title);
        if (meta.description) setDescription(meta.description);
        if (meta.title || meta.description) setMetaAutoFilled(true);
      }
      setIsFetchingMeta(false);
    }
  }

  async function handleCreateCategory() {
    const name = newCatName.trim();
    if (!name) return;

    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setFormError('A category with that name already exists.');
      return;
    }
    setIsSavingCat(true);
    setFormError('');
    try {
      const catsRef = collection(db, 'users', user.uid, 'categories');
      const ref = await addDoc(catsRef, { name, isDeletable: true });
      const newCat = { id: ref.id, name, isDeletable: true };
      setCategories(prev => sortCategories([...prev, newCat]));
      setSelectedCatId(ref.id);
      setNewCatName('');
      setShowNewCat(false);
    } catch (err) {
      setFormError('Failed to create category. Please try again.');
    } finally {
      setIsSavingCat(false);
    }
  }

  async function handleSave() {
    setFormError(''); setDuplicateError('');

    const normalized = normalizeUrl(url);
    if (!normalized || !isValidUrl(normalized)) {
      setUrlError('Please enter a valid URL.');
      return;
    }
    if (!title.trim()) { setFormError('Title is required.'); return; }
    if (!selectedCatId) { setFormError('Please select a category.'); return; }

    setIsSaving(true);
    try {
      const websitesRef = collection(db, 'users', user.uid, 'websites');
      const dup = await getDocs(query(websitesRef, where('url', '==', normalized)));
      if (!dup.empty) {
        setDuplicateError('This website is already in your library!');
        setIsSaving(false);
        return;
      }

      const cat = categories.find(c => c.id === selectedCatId);
      await addDoc(websitesRef, {
        url: normalized,
        title: title.trim(),
        description: description.trim(),
        faviconUrl: getFaviconUrl(normalized),
        categoryName: cat?.name || 'Other',
        createdAt: serverTimestamp(),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setFormError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!render) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'modal-backdrop-out' : 'modal-backdrop'}`}>
      <div className="absolute inset-0 bg-gray-900/25 backdrop-blur-sm" onClick={onClose} />

      <div className={`${isClosing ? 'modal-card-out' : 'modal-card'} relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg flex flex-col`}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Website</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paste a URL — details are auto-filled ✨</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HiX className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh] scrollbar-thin">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL <span className="text-red-400">*</span></label>
            <div className="relative">
              <HiGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={urlInputRef}
                id="modal-url-input"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(''); setDuplicateError(''); }}
                onBlur={handleUrlBlur}
                placeholder="https://example.com"
                className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all ${urlError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isFetchingMeta && <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />}
                {metaAutoFilled && !isFetchingMeta && <HiSparkles className="w-4 h-4 text-primary-500" title="Auto-filled" />}
              </div>
            </div>
            {urlError && <p className="text-xs text-red-500 flex items-center gap-1"><HiExclamationCircle className="w-3.5 h-3.5" />{urlError}</p>}
            {isFetchingMeta && <p className="text-xs text-primary-500 animate-pulse">Fetching page details...</p>}
          </div>

          {duplicateError && (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <HiExclamationCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Already in your library!</p>
                <p className="text-xs text-amber-600 mt-0.5">This website has already been added.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              Title <span className="text-red-400">*</span>
              {metaAutoFilled && title && <span className="text-[10px] font-medium text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-full normal-case tracking-normal">Auto-filled</span>}
            </label>
            <input
              id="modal-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Favourite Resource"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              Description
              {metaAutoFilled && description && <span className="text-[10px] font-medium text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-full normal-case tracking-normal">Auto-filled</span>}
            </label>
            <textarea
              id="modal-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this website about?"
              rows={3}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none scrollbar-thin"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <HiTag className="w-3.5 h-3.5" /> Category <span className="text-red-400">*</span>
            </label>

            {loadingCats ? (
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div className="flex gap-2">
                <select
                  id="modal-category-select"
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  id="new-category-btn"
                  onClick={() => { setShowNewCat(v => !v); setFormError(''); }}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${showNewCat ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'}`}
                >
                  <HiPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </button>
              </div>
            )}

            {showNewCat && (
              <div className="flex gap-2 mt-1">
                <input
                  id="new-category-input"
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCategory(); }}
                  placeholder="Category name..."
                  className="flex-1 px-3.5 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCatName.trim() || isSavingCat}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isSavingCat
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <HiCheck className="w-4 h-4" />
                  }
                </button>
              </div>
            )}
          </div>

          {formError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{formError}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            id="save-website-btn"
            onClick={handleSave}
            disabled={isSaving || isFetchingMeta}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : <><HiPlus className="w-4 h-4" />Add Website</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
