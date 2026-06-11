const API_URL = import.meta.env.VITE_API_URL || 'https://gtihub-backend.vercel.app/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('github_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};