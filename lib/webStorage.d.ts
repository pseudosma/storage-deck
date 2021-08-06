import { StorageKey, StorageKeyValuePair } from "./storageDeck";
export declare const retrieveFromLocalStorage: (key: string | RegExp | import("searchability").Searchable | StorageKey[]) => any;
export declare const retrieveFromSessionStorage: (key: string | RegExp | import("searchability").Searchable | StorageKey[]) => any;
export declare const addToLocalStorage: (keyValue: StorageKeyValuePair | StorageKeyValuePair[]) => void;
export declare const addToSessionStorage: (keyValue: StorageKeyValuePair | StorageKeyValuePair[]) => void;
export declare const removeFromLocalStorage: (key: string | RegExp | import("searchability").Searchable | StorageKey[]) => void;
export declare const removeFromSessionStorage: (key: string | RegExp | import("searchability").Searchable | StorageKey[]) => void;
export declare const clearLocalStorage: () => void;
export declare const clearSessionStorage: () => void;
