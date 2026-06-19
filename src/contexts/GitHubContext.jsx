import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStoredUser, updateStoredUser, getStoredStatus, updateStoredStatus, getStoredRepositories, clearAllStorage } from '../services/storageService';
import { apiClient } from '../services/apiClient';

const GitHubContext = createContext();

export const GitHubProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());
    const [status, setStatus] = useState(() => {
        const u = getStoredUser();
        return u?.status || { emoji: '', text: '', isBusy: false };
    });
    const [repositories, setRepositories] = useState([]);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const login = useCallback(async (email, password) => {
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.data?.accessToken) {
        localStorage.setItem('github_token', res.data.accessToken);
        localStorage.setItem('github_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      return res;
    }, []);

    const register = useCallback(async (loginName, email, password) => {
      const res = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ login: loginName, email, password }),
      });
      if (res?.data?.accessToken) {
        localStorage.setItem('github_token', res.data.accessToken);
        localStorage.setItem('github_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      return res;
    }, []);

    const refreshRepos = useCallback(async () => {
        if (user?.login) {
            try {
                const { getRepos } = await import('../services/GithubApi');
                const repos = await getRepos(user.login);
                setRepositories(repos || []);
                if (repos) {
                    localStorage.setItem('github_repositories', JSON.stringify(repos));
                }
            } catch (err) {
                console.warn("Error refreshing repos from backend, falling back to local storage:", err);
                setRepositories(getStoredRepositories());
            }
        } else {
            setRepositories(getStoredRepositories());
        }
    }, [user?.login]);

    // Initial fetch
    useEffect(() => {
        refreshRepos();
    }, [refreshRepos]);

    // Sync with other components/tabs
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

    const logout = useCallback(() => {
        clearAllStorage();
        localStorage.removeItem('github_token');
        setUser(null);
    }, []);

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

    // Memoize the context value to prevent unnecessary re-renders of
    // every consumer when unrelated parent state changes.
    const value = useMemo(() => ({
        user,
        status,
        repositories,
        refreshRepos,
        updateStatus,
        updateUser,
        isStatusModalOpen,
        setIsStatusModalOpen,
        login,
        register,
        logout
    }), [user, status, repositories, refreshRepos, updateStatus, updateUser, isStatusModalOpen, login, register, logout]);

    return (
        <GitHubContext.Provider value={value}>
            {children}
        </GitHubContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGitHub = () => {
    const context = useContext(GitHubContext);
    if (!context) {
        throw new Error('useGitHub must be used within a GitHubProvider');
    }
    return context;
};
