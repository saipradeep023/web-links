import { useState, useEffect, useCallback } from 'react';
import { HiX, HiTrash, HiTag, HiLockClosed, HiExclamationCircle, HiCheck, HiFolder } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCategories,
  fetchWebsiteCountByCategory,
  deleteCategory,
} from '../../services/categoryService';

export default function ManageCategoriesModal({ isOpen, onClose, onCategoriesChanged }) {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of category pending confirm
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [cats, countMap] = await Promise.all([
        fetchCategories(user.uid),
        fetchWebsiteCountByCategory(user.uid),
      ]);
      setCategories(cats);
      setCounts(countMap);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      load();
      setConfirmDeleteId(null);
      setSuccessMsg('');
      setError('');
    }
  }, [isOpen, load]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDelete = async (cat) => {
    setDeletingId(cat.id);
    setError('');
    setSuccessMsg('');
    try {
      const moved = await deleteCategory(user.uid, cat.id, cat.name);
      setSuccessMsg(
        moved > 0
          ? `"${cat.name}" deleted. ${moved} website${moved > 1 ? 's' : ''} moved to Other.`
          : `"${cat.name}" deleted.`
      );
      setConfirmDeleteId(null);
      await load();
      onCategoriesChanged?.();
    } catch (err) {
      setError('Failed to delete category. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const customCats = categories.filter(c => c.isDeletable);
  const otherCat = categories.find(c => c.name === 'Other');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-gray-900/25 backdrop-blur-sm" onClick={onClose} />

      <div className="modal-card relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
              <HiTag className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Manage Categories</h2>
              <p className="text-xs text-gray-400 mt-0.5">Delete a category to move its sites to Other</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin">

          {/* Feedback messages */}
          {successMsg && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-1">
              <HiCheck className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-1">
              <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Custom categories */}
              {customCats.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <HiFolder className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No custom categories yet.</p>
                  <p className="text-xs text-gray-400">Create one from the "Add Website" modal.</p>
                </div>
              ) : (
                customCats.map(cat => {
                  const count = counts[cat.name] || 0;
                  const isPendingDelete = confirmDeleteId === cat.id;
                  const isDeleting = deletingId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        isPendingDelete
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800 truncate">{cat.name}</span>
                          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                            {count} site{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {isPendingDelete && (
                          <p className="text-xs text-red-600 mt-0.5">
                            {count > 0
                              ? `${count} site${count > 1 ? 's' : ''} will move to "Other"`
                              : 'This category will be removed'}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {isPendingDelete ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            disabled={isDeleting}
                            className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1"
                          >
                            {isDeleting
                              ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <HiTrash className="w-3 h-3" />
                            }
                            {isDeleting ? 'Deleting...' : 'Confirm'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setConfirmDeleteId(cat.id); setSuccessMsg(''); setError(''); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          title="Delete category"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {otherCat && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 opacity-70 mt-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Other</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                        {counts['Other'] || 0} site{(counts['Other'] || 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Default</span>
                    </div>
                  </div>
                  <HiLockClosed className="w-4 h-4 text-gray-300 flex-shrink-0" title="Cannot be deleted" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
