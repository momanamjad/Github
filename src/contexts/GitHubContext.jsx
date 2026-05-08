import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStoredUser, updateStoredUser, getStoredStatus, updateStoredStatus, getStoredRepositories } from '../services/storageService';

const GitHubContext = createContext();

export const GitHubProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());
    const [status, setStatus] = useState(() => getStoredStatus());
    const [repositories, setRepositories] = useState([]);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const refreshRepos = useCallback(() => {
        setRepositories(getStoredRepositories());
    }, []);

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

    const updateStatus = useCallback((newStatus) => {
        const success = updateStoredStatus(newStatus);
        if (success) setStatus(newStatus);
        return success;
    }, []);

    const updateUser = useCallback((newData) => {
        const success = updateStoredUser(newData);
        if (success) setUser(newData);
        return success;
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
        setIsStatusModalOpen
    }), [user, status, repositories, refreshRepos, updateStatus, updateUser, isStatusModalOpen]);

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
