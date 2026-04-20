import {
  collection,
  getDocs,
  query,
  where,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export async function fetchCategories(userId) {
  const snap = await getDocs(collection(db, 'users', userId, 'categories'));
  const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return cats.sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchWebsiteCountByCategory(userId) {
  const snap = await getDocs(collection(db, 'users', userId, 'websites'));
  const counts = {};
  snap.docs.forEach(d => {
    const name = d.data().categoryName || 'Other';
    counts[name] = (counts[name] || 0) + 1;
  });
  return counts;
}

export async function deleteCategory(userId, categoryId, categoryName) {
  const websitesRef = collection(db, 'users', userId, 'websites');
  const affected = await getDocs(
    query(websitesRef, where('categoryName', '==', categoryName))
  );

  const batch = writeBatch(db);

  affected.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { categoryName: 'Other' });
  });

  batch.delete(doc(db, 'users', userId, 'categories', categoryId));

  await batch.commit();
  return affected.size;
}
