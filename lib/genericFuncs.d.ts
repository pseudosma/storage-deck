import { Storage, StorageKey, StorageKeyValuePair } from "./storageDeck";
export declare const addToStorageGeneric: (keyValue: StorageKeyValuePair | StorageKeyValuePair[], store: Storage) => void;
export declare const retrieveFromStorageGeneric: (keys: string | RegExp | import("searchability").Searchable | StorageKey[], store: Storage, isCustomStorage: boolean) => any;
export declare const removeFromStorageGeneric: (keys: string | RegExp | import("searchability").Searchable | StorageKey[], store: Storage, isCustomStorage: boolean) => void;
