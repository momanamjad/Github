const API_URL = import.meta.env.VITE_API_URL || 'https://github-backend.vercel.app/api';

export const getBackendBaseUrl = () => {
  return API_URL.replace(/\/api$/, '');
};

export const resolveAvatarUrl = (url) => {
  if (!url) return "/profile.webp";
  if (typeof url === 'string' && url.startsWith('http://localhost')) {
    return url.replace(/http:\/\/localhost:\d+/, getBackendBaseUrl());
  }
  return url;
};

const normalizeUrls = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  // Fast path: Stringify search first for early bailout on arrays/objects
  if (typeof obj === 'object') {
    try {
      const strRepresentation = JSON.stringify(obj);
      if (!strRepresentation || !strRepresentation.includes('localhost:5000/uploads/')) {
        return obj;
      }
    } catch {
      // Fallback to recursive traversal on circular/un-serializable structures
    }
  }

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
  refreshSubscribers.forEach((cb) => cb(null, token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb(error, null));
  refreshSubscribers = [];
};

export class ApiError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('github_token');
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const maxRetries = 2;
  let attempt = 0;
  let response;

  while (attempt <= maxRetries) {
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers,
      });
      break; // Request succeeded, break retry loop
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw new ApiError(err.message || 'Network connectivity error', 0, 'NETWORK_ERROR');
      }
      // Exponential backoff wait (500ms -> 1000ms)
      const delay = Math.pow(2, attempt - 1) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

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
          localStorage.removeItem('github_token');
          localStorage.removeItem('github_user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 0);
          throw new ApiError('Session expired', 401, 'SESSION_EXPIRED');
        }
      } catch (err) {
        isRefreshing = false;
        onRefreshFailed(err);
        throw err;
      }
    }

    const retryOriginalRequest = new Promise((resolve, reject) => {
      subscribeTokenRefresh((err, newToken) => {
        if (err) {
          reject(err);
          return;
        }
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

  const contentType = response.headers.get('content-type');
  let data = contentType?.includes('application/json')
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data.code);
  }

  data = normalizeUrls(data);

  return data;
};