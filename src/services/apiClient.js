const API_URL = import.meta.env.VITE_API_URL || 'https://gtihub-backend.vercel.app/api';

export const getBackendBaseUrl = () => {
  return API_URL.replace(/\/api$/, '');
};

export const resolveAvatarUrl = (url) => {
  if (!url) return "/profile.webp";
  if (typeof url === 'string' && url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', getBackendBaseUrl());
  }
  return url;
};

const normalizeUrls = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('http://localhost:5000/uploads/')) {
      return obj.replace('http://localhost:5000', getBackendBaseUrl());
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeUrls);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = normalizeUrls(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('github_token');
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // If unauthorized (excluding login/register/refresh), try silent token refresh
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register' && endpoint !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        const refreshData = await refreshResponse.json();
        
        if (refreshResponse.ok && refreshData.data?.accessToken) {
          const newToken = refreshData.data.accessToken;
          localStorage.setItem('github_token', newToken);
          isRefreshing = false;
          onRefreshed(newToken);
        } else {
          isRefreshing = false;
          localStorage.removeItem('github_token');
          localStorage.removeItem('github_user');
          window.location.reload(); // Refresh to send guest to login page
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        throw err;
      }
    }

    const retryOriginalRequest = new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        resolve(
          fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers,
          })
        );
      });
    });

    response = await retryOriginalRequest;
  }

  let data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  data = normalizeUrls(data);

  return data;
};