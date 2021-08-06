import { Searchable } from "searchability";
export declare const reservedBaseNames: string[];
export declare const reservedOverflowNames: string[];
export declare enum StorageScheme {
    Basic = 0,
    Overflow = 1,
    Custom = 2
}
interface Store {
    [index: string]: any;
}
export declare type StorageKey = string | RegExp | Searchable;
export interface StorageKeyValuePair {
    key: string;
    value: any;
    pattern?: string;
    addedSuccessfully?: boolean;
}
export interface Storage {
    readonly storage: Store;
    getItem: (key: string) => any;
    setItem: (key: string, value: any) => void;
    removeItem: (key: string) => void;
    clear: () => void;
}
declare class StorageDeck {
    store: any;
    scheme: StorageScheme;
    constructor(sto: any, scm?: StorageScheme);
}
export declare const createNewCustomStorage: (name: any) => void;
export declare const getStorageInstance: (name: string) => StorageDeck;
export {};
