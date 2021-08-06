import { StorageKey, StorageKeyValuePair } from "./storageDeck";
export declare const retrieveFromLocalStorage: (key: StorageKey | StorageKey[]) => any;
export declare const retrieveFromSessionStorage: (key: StorageKey | StorageKey[]) => any;
export declare const addToLocalStorage: (keyValue: StorageKeyValuePair | StorageKeyValuePair[]) => void;
export declare const addToSessionStorage: (keyValue: StorageKeyValuePair | StorageKeyValuePair[]) => void;
export declare const removeFromLocalStorage: (key: StorageKey | StorageKey[]) => void;
export declare const removeFromSessionStorage: (key: StorageKey | StorageKey[]) => void;
export declare const clearLocalStorage: () => void;
export declare const clearSessionStorage: () => void;
