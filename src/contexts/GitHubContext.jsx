import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getStoredUser, updateStoredUser, getStoredStatus, updateStoredStatus, getStoredRepositories, clearAllStorage, writeCached, STORAGE_KEYS } from '../services/storageService';
import { apiClient, resolveAvatarUrl } from '../services/apiClient';
import { getRepos, clearClientCache } from '../services/GithubApi';
import { prefetchUserQuery, prefetchActivityFeed } from '../hooks/useQueries';

const AuthContext = createContext();
const RepoContext = createContext();
const UIContext   = createContext();

export const GitHubProvider = ({ children }) => {
    // 1. Auth Context State
    const [user, setUser] = useState(() => {
        const u = getStoredUser();
        if (u && u.avatar_url) {
            u.avatar_url = resolveAvatarUrl(u.avatar_url);
        }
        return u;
    });

    const completeAuthSession = useCallback((authData) => {
      if (!authData?.accessToken) return;
      localStorage.setItem('github_token', authData.accessToken);
      localStorage.setItem('github_user', JSON.stringify(authData.user));
      setUser(authData.user);
      // Kick off Home feed + user profile/repos requests in parallel before navigation completes
      if (authData.user?.login) {
        prefetchUserQuery(authData.user.login);
      }
      prefetchActivityFeed(1, 20);
    }, []);

    const login = useCallback(async (email, password) => {
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res?.data?.accessToken) {
        throw new Error(res?.data?.message || 'Login failed: no token received');
      }
      completeAuthSession(res.data);
      return res;
    }, [completeAuthSession]);

    const loginWithGoogle = useCallback(async (credential) => {
      const res = await apiClient('/auth/google-signin', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });
      if (res?.data?.accessToken) {
        completeAuthSession(res.data);
      }
      return res;
    }, [completeAuthSession]);

    const register = useCallback(async (loginName, email, password) => {
      const res = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ login: loginName, email, password }),
      });
      if (res?.data?.accessToken) {
        completeAuthSession(res.data);
      }
      return res;
    }, [completeAuthSession]);

    const logout = useCallback(() => {
        clearAllStorage();
        clearClientCache();
        setUser(null);
    }, []);

    const updateUser = useCallback(async (newData) => {
        try {
            const updatePayload = {
                name: newData.name,
                bio: newData.bio,
                avatar_url: newData.avatar_url,
                company: newData.company,
                location: newData.location,
                blog: newData.blog,
                pronouns: newData.pronouns,
                socialLinks: newData.socialLinks,
            };
            const res = await apiClient('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(updatePayload),
            });
            if (res?.data) {
                localStorage.setItem('github_user', JSON.stringify(res.data));
                setUser(res.data);
                return true;
            }
        } catch (err) {
            console.error('Failed to update profile on backend:', err);
        }
        return false;
    }, []);

    // 2. Repo Context State — Initialized synchronously from storage (0ms instant render)
    const [repositories, setRepositories] = useState(() => getStoredRepositories() || []);
    const hasReposRef = useRef(repositories.length > 0);
    hasReposRef.current = repositories.length > 0;

    const [isLoading, setIsLoading] = useState(() => !hasReposRef.current);

    const refreshRepos = useCallback(async () => {
        // Only show skeleton if we have zero cached repositories to display
        if (!hasReposRef.current) {
            setIsLoading(true);
        }

        if (user?.login) {
            try {
                const repos = await getRepos(user.login);
                setRepositories(repos || []);
                if (repos) {
                    writeCached(STORAGE_KEYS.REPOSITORIES, repos);
                }
            } catch (err) {
                console.warn("Error refreshing repos from backend, falling back to local storage:", err);
                setRepositories(getStoredRepositories());
            } finally {
                setIsLoading(false);
            }
        } else {
            setRepositories(getStoredRepositories());
            setIsLoading(false);
        }
    }, [user?.login]);

    useEffect(() => {
        refreshRepos();
    }, [refreshRepos]);

    // 3. UI/Status Context State
    const [status, setStatus] = useState(() => {
        const u = getStoredUser();
        return u?.status || { emoji: '', text: '', isBusy: false };
    });
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const updateStatus = useCallback(async (newStatus) => {
        try {
            const res = await apiClient('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            if (res?.data) {
                localStorage.setItem('github_user', JSON.stringify(res.data));
                setUser(res.data);
                setStatus(res.data.status || { emoji: '', text: '', isBusy: false });
                window.dispatchEvent(new CustomEvent('github_status_updated', { detail: res.data.status }));
                return true;
            }
        } catch (err) {
            console.error('Failed to update status on backend:', err);
        }
        return false;
    }, []);

    useEffect(() => {
        const handleStatusUpdate = (e) => {
            if (e.detail) setStatus(e.detail);
        };
        const handleOpenStatusModal = () => setIsStatusModalOpen(true);
        const handleReposUpdate = () => refreshRepos();

        window.addEventListener('github_status_updated', handleStatusUpdate);
        window.addEventListener('github_open_status_modal', handleOpenStatusModal);
        window.addEventListener('github_repos_updated', handleReposUpdate);

        return () => {
            window.removeEventListener('github_status_updated', handleStatusUpdate);
            window.removeEventListener('github_open_status_modal', handleOpenStatusModal);
            window.removeEventListener('github_repos_updated', handleReposUpdate);
        };
    }, [refreshRepos]);

    // Memoize each individual sub-context value
    const authVal = useMemo(() => ({
        user, login, loginWithGoogle, register, logout, updateUser
    }), [user, login, loginWithGoogle, register, logout, updateUser]);

    const repoVal = useMemo(() => ({
        repositories, isLoading, refreshRepos
    }), [repositories, isLoading, refreshRepos]);

    const uiVal = useMemo(() => ({
        status, isStatusModalOpen, setIsStatusModalOpen, updateStatus
    }), [status, isStatusModalOpen, updateStatus]);

    return (
        <AuthContext.Provider value={authVal}>
            <RepoContext.Provider value={repoVal}>
                <UIContext.Provider value={uiVal}>
                    {children}
                </UIContext.Provider>
            </RepoContext.Provider>
        </AuthContext.Provider>
    );
};

// Focused context hooks to avoid unnecessary re-renders
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within a GitHubProvider');
    return ctx;
};

export const useRepos = () => {
    const ctx = useContext(RepoContext);
    if (!ctx) throw new Error('useRepos must be used within a GitHubProvider');
    return ctx;
};

export const useUI = () => {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within a GitHubProvider');
    return ctx;
};

// Unified hook exposing sub-contexts transparently to consumers
export const useGitHub = () => {
    return { ...useAuth(), ...useRepos(), ...useUI() };
};
