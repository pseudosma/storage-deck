"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customStorage_1 = require("./customStorage");
const genericFuncs_1 = require("./genericFuncs");
const storageDeck_1 = require("./storageDeck");
const retrieveFromDefaultStorage = (keys, storageName, overflowName) => {
    const s = storageDeck_1.getStorageInstance(storageName);
    if (s.scheme === storageDeck_1.StorageScheme.Overflow) {
        // if it's in overflow mode, we may have our data in either localStorage or overflowStorage
        // check both locations and concat the results
        const a = genericFuncs_1.retrieveFromStorageGeneric(keys, s.store, false);
        const b = genericFuncs_1.retrieveFromStorageGeneric(keys, window[overflowName], true);
        if (a === null) {
            return b;
        }
        if (b === null) {
            return a;
        }
        // if this point is reached, we have results from both a and b
        // the only way we'd get results in both a and b is a regex search
        // if that's the case, the results, even with one match, will still
        // be an array
        return a.concat(b);
    }
    else {
        return genericFuncs_1.retrieveFromStorageGeneric(keys, s.store, false);
    }
};
exports.retrieveFromLocalStorage = (key) => {
    return retrieveFromDefaultStorage(key, storageDeck_1.reservedBaseNames[0], storageDeck_1.reservedOverflowNames[0]);
};
exports.retrieveFromSessionStorage = (key) => {
    return retrieveFromDefaultStorage(key, storageDeck_1.reservedBaseNames[1], storageDeck_1.reservedOverflowNames[1]);
};
const addToDefaultStorage = (keyValue, storageName, overflowStorage) => {
    try {
        genericFuncs_1.addToStorageGeneric(keyValue, storageDeck_1.getStorageInstance(storageName).store);
    }
    catch (e) {
        // this error occurs if the storage limit on storage is exceeded
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
            console.warn("Storage at " +
                name +
                " is full. Overflow storage will be created but all additional data will not persist.");
            if (typeof window[overflowStorage] === "undefined") {
                // spawn overflowStorage and put the value in there
                storageDeck_1.createNewCustomStorage(overflowStorage);
            }
            genericFuncs_1.addToStorageGeneric(keyValue, window[overflowStorage]);
        }
        else {
            throw e;
        }
    }
};
exports.addToLocalStorage = (keyValue) => {
    addToDefaultStorage(keyValue, storageDeck_1.reservedBaseNames[0], storageDeck_1.reservedOverflowNames[0]);
};
exports.addToSessionStorage = (keyValue) => {
    addToDefaultStorage(keyValue, storageDeck_1.reservedBaseNames[1], storageDeck_1.reservedOverflowNames[1]);
};
const removeFromDefaultStorage = (keys, storageName, overflowName) => {
    const s = storageDeck_1.getStorageInstance(storageName);
    if (s.scheme === storageDeck_1.StorageScheme.Overflow) {
        // remove from both. this op is safe if one of the lists doesn't contain the item
        // or if one list doesn't exist
        genericFuncs_1.removeFromStorageGeneric(keys, window[overflowName], false);
    }
    genericFuncs_1.removeFromStorageGeneric(keys, s.store, false);
};
exports.removeFromLocalStorage = (key) => {
    removeFromDefaultStorage(key, storageDeck_1.reservedBaseNames[0], storageDeck_1.reservedOverflowNames[0]);
};
exports.removeFromSessionStorage = (key) => {
    removeFromDefaultStorage(key, storageDeck_1.reservedBaseNames[1], storageDeck_1.reservedOverflowNames[1]);
};
const clearDefaultStorage = (storageName, overflowName) => {
    const s = storageDeck_1.getStorageInstance(storageName);
    if (s.scheme === storageDeck_1.StorageScheme.Overflow) {
        s.store.clear();
        // now delete our overflow since our sessionStorage is free again
        customStorage_1.deleteStorage(overflowName);
    }
    s.store.clear();
};
exports.clearLocalStorage = () => {
    clearDefaultStorage(storageDeck_1.reservedBaseNames[0], storageDeck_1.reservedOverflowNames[0]);
};
exports.clearSessionStorage = () => {
    clearDefaultStorage(storageDeck_1.reservedBaseNames[1], storageDeck_1.reservedOverflowNames[1]);
};
