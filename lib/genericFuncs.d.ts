import { Storage, StorageKey, StorageKeyValuePair } from "./storageDeck";
export declare const addToStorageGeneric: (keyValue: StorageKeyValuePair | StorageKeyValuePair[], store: Storage) => void;
export declare const retrieveFromStorageGeneric: (keys: StorageKey | StorageKey[], store: Storage, isCustomStorage: boolean) => any;
export declare const removeFromStorageGeneric: (keys: StorageKey | StorageKey[], store: Storage, isCustomStorage: boolean) => void;
