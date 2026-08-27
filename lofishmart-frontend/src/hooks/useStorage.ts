import { useState, useEffect } from "react";

type StorageType = "local" | "session";

/**
 * A custom hook to manage state synchronized with localStorage or sessionStorage.
 *
 * @param key The key to store the data under in storage.
 * @param initialValue The initial value to use if no data is found in storage.
 * @param storageType The type of storage to use ('local' or 'session'). Defaults to 'local'.
 * @returns A tuple containing the stored value and a function to set the value.
 */
export function useStorage<T>(
	key: string,
	initialValue: T,
	storageType: StorageType = "local"
) {
	const isSSR = typeof window === "undefined";
	const storage = isSSR
		? null
		: storageType === "local"
		? window.localStorage
		: window.sessionStorage;

	// Initialize state
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (isSSR) return initialValue;
		try {
			const item = storage?.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Error reading ${storageType}Storage key "${key}":`, error);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to storage.
	const setValue = (value: T | ((val: T) => T)) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;

			// Save state
			setStoredValue(valueToStore);

			// Save to storage
			if (!isSSR) {
				storage?.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.warn(`Error setting ${storageType}Storage key "${key}":`, error);
		}
	};

	// Optional: Listen for storage events to sync across tabs (only works for localStorage)
	useEffect(() => {
		if (isSSR || storageType !== "local") return;

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					console.warn(
						`Error parsing localStorage change for key "${key}":`,
						error
					);
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, [key, storageType, isSSR]);

	return [storedValue, setValue] as const;
}
