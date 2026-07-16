// Use a dynamic import for node-fetch to support both CommonJS and ESM if needed, 
// though for modern Node.js environments, standard fetch might be available.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const APIs = {
  1: 'https://apkcombo.com',
  2: 'https://apk-dl.com', // Added https:// for consistency
  3: 'https://apk.support',
  4: 'https://apps.evozi.com/apk-downloader',
  5: 'http://ws75.aptoide.com/api/7',
  6: 'https://cafebazaar.ir'
};

/**
 * Generates a Google Translate proxy URL.
 * @param {string} url - The target URL to proxy.
 * @returns {string} The proxied URL or an empty string.
 */
const Proxy = (url) => {
  if (!url) return '';
  try {
    return `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp`;
  } catch (e) {
    console.error('Error encoding URL for Proxy:', e);
    return '';
  }
};

/**
 * Constructs an API URL with optional path and query parameters.
 * @param {string|number} ID - The API ID from the APIs object or a base URL.
 * @param {string} path - The endpoint path.
 * @param {object} query - Key-value pairs for query parameters.
 * @returns {string} The constructed URL.
 */
const api = (ID, path = '/', query = {}) => {
  const baseURL = APIs[ID] || ID;
  
  // Ensure path starts with /
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Build query string safely
  let queryString = '';
  if (query && Object.keys(query).length > 0) {
    try {
      queryString = '?' + new URLSearchParams(query).toString();
    } catch (e) {
      console.error('Error creating query parameters:', e);
    }
  }
  
  return baseURL + formattedPath + queryString;
};

module.exports = { 
  APIs, 
  Proxy, 
  api 
};
