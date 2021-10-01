"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromStorageGeneric = exports.retrieveFromStorageGeneric = exports.addToStorageGeneric = void 0;
const searchability_1 = require("searchability");
const addAll = (keys, storageInstance) => {
    keys.forEach(kv => {
        if (!kv.addedSuccessfully) {
            storageInstance.setItem(kv.key, kv.value);
            kv.addedSuccessfully = true;
            // addedSuccessfully prevents duplicates in overflow scenarios
        }
    });
};
const addToStorageGeneric = (keyValue, store) => {
    if (Array.isArray(keyValue)) {
        addAll(keyValue, store);
    }
    else {
        store.setItem(keyValue.key, keyValue.value);
    }
};
exports.addToStorageGeneric = addToStorageGeneric;
const retrieveAll = (keys, storageInstance, isCustomStorage) => {
    const retVal = [];
    keys.forEach(ke => {
        if (typeof ke === "string") {
            const v = storageInstance.getItem(ke);
            if (v !== null) {
                retVal.push({ key: ke, value: v });
            }
        }
        else {
            const storage = isCustomStorage
                ? storageInstance.storage
                : storageInstance;
            if (ke instanceof RegExp) {
                Object.keys(storage).forEach(k => {
                    const m = k.match(ke);
                    if (m !== null && m[0] !== "") {
                        // this does not always come back null
                        const r = {
                            key: k,
                            pattern: ke.source,
                            value: storageInstance.getItem(k)
                        };
                        retVal.push(r);
                    }
                });
            }
            else {
                // this will be a Searchable
                Object.keys(storage).forEach(k => {
                    if ((0, searchability_1.Search)(ke, k)) {
                        const r = {
                            key: k,
                            value: storageInstance.getItem(k)
                        };
                        retVal.push(r);
                    }
                });
            }
        }
    });
    if (retVal.length > 0) {
        // now remove duplicates
        const rv = [];
        retVal.forEach(o => {
            if (rv.findIndex(r => o.key === r.key) === -1) {
                rv.push(o);
            }
        });
        return rv;
    }
    return null;
};
const retrieveFromStorageGeneric = (keys, store, isCustomStorage) => {
    if (typeof keys === "string") {
        return store.getItem(keys);
    }
    else if (Array.isArray(keys)) {
        return retrieveAll(keys, store, isCustomStorage);
    }
    else {
        // this would be a RegExp or Searchable. In both cases we should return an array
        return retrieveAll([keys], store, isCustomStorage);
    }
};
exports.retrieveFromStorageGeneric = retrieveFromStorageGeneric;
const removeAll = (keys, storageInstance, isCustomStorage) => {
    keys.forEach(key => {
        if (typeof key === "string") {
            storageInstance.removeItem(key);
        }
        else {
            const storage = isCustomStorage
                ? storageInstance.storage
                : storageInstance;
            if (key instanceof RegExp) {
                Object.keys(storage).forEach(k => {
                    const m = k.match(key);
                    if (m !== null && m[0] !== "") {
                        storageInstance.removeItem(k);
                    }
                });
            }
            else {
                Object.keys(storage).forEach(k => {
                    if ((0, searchability_1.Search)(key, k)) {
                        storageInstance.removeItem(k);
                    }
                });
            }
        }
    });
};
const removeFromStorageGeneric = (keys, store, isCustomStorage) => {
    if (typeof keys === "string") {
        store.removeItem(keys);
    }
    else if (Array.isArray(keys)) {
        removeAll(keys, store, isCustomStorage);
    }
    else {
        removeAll([keys], store, isCustomStorage);
    }
};
exports.removeFromStorageGeneric = removeFromStorageGeneric;
