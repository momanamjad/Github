import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 * @param {Array<React.RefObject>} refs - Array of refs to ignore
 * @param {Function} handler - Callback to run on outside click
 */
export const useClickOutside = (refs, handler) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutside = refs.every(ref => ref.current && !ref.current.contains(event.target));
            if (isOutside) {
                handler();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [refs, handler]);
};

/**
 * Hook for managing localStorage state reactively
 * @param {string} key 
 * @param {any} initialValue 
 */
export const useStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch event for other components using this hook (on same page)
            window.dispatchEvent(new Event('local-storage-update'));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    useEffect(() => {
        const handleStorageChange = () => {
            const item = window.localStorage.getItem(key);
            if (item) setStoredValue(JSON.parse(item));
        };

        window.addEventListener('local-storage-update', handleStorageChange);
        window.addEventListener('storage', handleStorageChange); // Across tabs

        return () => {
            window.removeEventListener('local-storage-update', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [storedValue, setValue];
};

/**
 * Hook for a generic timer/interval
 */
export const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};
