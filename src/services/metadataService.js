export function normalizeUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getFaviconUrl(url) {
  try {
    const { hostname } = new URL(url);
    return `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '';
  }
}

export async function fetchUrlMetadata(url) {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=false&audio=false&video=false&iframe=false`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.status === 'success') {
      return {
        title: data.data?.title || '',
        description: data.data?.description || '',
      };
    }
    return null;
  } catch {
    return null;
  }
}
