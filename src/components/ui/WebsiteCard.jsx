import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { HiExternalLink, HiTrash, HiX, HiExclamation } from 'react-icons/hi';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DeleteDialog({ title, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="absolute inset-0 bg-gray-900/25 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6 flex flex-col gap-4 modal-card">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <HiExclamation className="text-red-500 text-xl" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mt-0.5">Delete website?</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              <span className="font-medium text-gray-700">"{title}"</span> will be permanently removed from your library.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiTrash className="w-4 h-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteCard({ website }) {
  const { user } = useAuth();
  const [faviconError, setFaviconError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { id, url, title, description, faviconUrl, categoryName, createdAt } = website;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'websites', id));
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setIsDeleting(false);
    }
  };

  let displayDomain = '';
  try {
    displayDomain = new URL(url).hostname.replace('www.', '');
  } catch {}

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-gray-200 transition-all duration-200 p-4 flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {!faviconError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">
                {(title || displayDomain || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 leading-tight"
            >
              {title || displayDomain}
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-gray-300 hover:text-primary-500 transition-colors mt-0.5"
            >
              <HiExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-xs text-gray-400 truncate">{displayDomain}</p>

          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-0.5">{description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100">
              {categoryName || 'Other'}
            </span>
            <span className="text-[11px] text-gray-300">•</span>
            <span className="text-[11px] text-gray-400">{formatDate(createdAt)}</span>

            <div className="ml-auto">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                title="Delete website"
              >
                <HiTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteDialog
          title={title || displayDomain}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
