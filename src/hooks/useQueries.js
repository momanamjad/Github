import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { queryClient } from '../lib/queryClient';

// Query Keys Factory
export const queryKeys = {
  user: (username) => ['user', username?.toLowerCase()],
  repo: (owner, repo) => ['repo', owner?.toLowerCase(), repo?.toLowerCase()],
  starredRepos: (username) => ['starredRepos', username?.toLowerCase()],
  pinnedRepos: (username) => ['pinnedRepos', username?.toLowerCase()],
  repoContents: (owner, repo, path) => ['repoContents', owner?.toLowerCase(), repo?.toLowerCase(), path || ''],
};

// Fetchers
export const fetchUserWithRepos = async (username) => {
  if (!username) return null;
  const res = await apiClient(`/auth/user/${encodeURIComponent(username)}`);
  return res?.data ?? res;
};

export const fetchRepo = async (owner, repo) => {
  if (!owner || !repo) return null;
  // Try indexed direct lookup endpoint first
  try {
    const res = await apiClient(`/repos/owner/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    if (res?.data) return res.data;
  } catch {}
  
  // Fallback to searching user's repos
  const userProfile = await fetchUserWithRepos(owner);
  const found = userProfile?.repos?.find(r => r.name.toLowerCase() === repo.toLowerCase());
  if (found) {
    try {
      const detailRes = await apiClient(`/repos/${found._id || found.id}`);
      if (detailRes?.data) return detailRes.data;
    } catch {}
    return found;
  }
  throw new Error(`Repository ${owner}/${repo} not found`);
};

// Custom React Query Hooks
export const useUserProfile = (username, options = {}) => {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchUserWithRepos(username),
    enabled: Boolean(username),
    ...options,
  });
};

export const useRepo = (owner, repo, options = {}) => {
  return useQuery({
    queryKey: queryKeys.repo(owner, repo),
    queryFn: () => fetchRepo(owner, repo),
    enabled: Boolean(owner && repo),
    ...options,
  });
};

// Prefetch helpers (for route preloading / hover states)
export const prefetchRepoQuery = (owner, repo) => {
  if (!owner || !repo) return;
  return queryClient.prefetchQuery({
    queryKey: queryKeys.repo(owner, repo),
    queryFn: () => fetchRepo(owner, repo),
    staleTime: 1000 * 60,
  });
};

export const prefetchUserQuery = (username) => {
  if (!username) return;
  return queryClient.prefetchQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchUserWithRepos(username),
    staleTime: 1000 * 60,
  });
};
