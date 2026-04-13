import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStoredUser, updateStoredUser, getStoredStatus, updateStoredStatus } from '../services/storageService';

const GitHubContext = createContext();

export const GitHubProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());
    const [status, setStatus] = useState(() => getStoredStatus());
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // Sync with other components/tabs
    useEffect(() => {
        const handleStatusUpdate = (e) => {
            if (e.detail) setStatus(e.detail);
        };
        const handleOpenStatusModal = () => setIsStatusModalOpen(true);

        window.addEventListener('github_status_updated', handleStatusUpdate);
        window.addEventListener('github_open_status_modal', handleOpenStatusModal);

        return () => {
            window.removeEventListener('github_status_updated', handleStatusUpdate);
            window.removeEventListener('github_open_status_modal', handleOpenStatusModal);
        };
    }, []);

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
        updateStatus,
        updateUser,
        isStatusModalOpen,
        setIsStatusModalOpen
    }), [user, status, updateStatus, updateUser, isStatusModalOpen]);

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
