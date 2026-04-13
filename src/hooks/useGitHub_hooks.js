import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that fires a callback when a click occurs outside of any of the given refs.
 * Uses a stable ref for the handler to avoid re-registering the listener on every render.
 * @param {Array<React.RefObject>} refs - Array of refs to consider "inside"
 * @param {Function} handler - Callback to invoke on outside click
 */
export const useClickOutside = (refs, handler) => {
    // Stable handler ref — prevents listener churn when handler identity changes
    const handlerRef = useRef(handler);
    useEffect(() => { handlerRef.current = handler; }, [handler]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutside = refs.every(ref => ref.current && !ref.current.contains(event.target));
            if (isOutside) handlerRef.current();
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs]); // refs identity is stable when callers use useMemo/useRef
};

/**
 * Hook for managing localStorage state reactively across components and tabs.
 * @param {string} key
 * @param {any} initialValue
 */
export const useStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('useStorage read error:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.dispatchEvent(new Event('local-storage-update'));
        } catch (error) {
            console.error('useStorage write error:', error);
        }
    }, [key, storedValue]);

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item !== null) setStoredValue(JSON.parse(item));
            } catch (error) {
                console.error('useStorage sync error:', error);
            }
        };

        window.addEventListener('local-storage-update', handleStorageChange);
        window.addEventListener('storage', handleStorageChange); // Cross-tab sync

        return () => {
            window.removeEventListener('local-storage-update', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [storedValue, setValue];
};

/**
 * Hook for a generic interval that always calls the latest version of callback.
 * @param {Function} callback
 * @param {number|null} delay - set to null to pause
 */
export const useInterval = (callback, delay) => {
    const savedCallback = useRef(callback);

    useEffect(() => { savedCallback.current = callback; }, [callback]);

    useEffect(() => {
        if (delay === null) return;
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
};
