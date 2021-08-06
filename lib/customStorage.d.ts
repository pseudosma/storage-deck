import { StorageKey, StorageKeyValuePair } from "./storageDeck";
export declare const createNewStorage: (name: string) => void;
export declare const retrieveFromStorage: (keys: StorageKey | StorageKey[], storageName: string) => any;
export declare const addToStorage: (keyValue: StorageKeyValuePair | StorageKeyValuePair[], storageName: string) => void;
export declare const removeFromStorage: (keys: StorageKey | StorageKey[], storageName: string) => void;
export declare const clearStorage: (storageName: string) => void;
export declare const deleteStorage: (storageName: string) => void;
