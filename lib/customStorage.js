"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStorage = exports.clearStorage = exports.removeFromStorage = exports.addToStorage = exports.retrieveFromStorage = exports.createNewStorage = void 0;
const genericFuncs_1 = require("./genericFuncs");
const storageDeck_1 = require("./storageDeck");
const createNewStorage = (name) => {
    // for external calls, enforce reservedNames
    const rNames = storageDeck_1.reservedBaseNames.concat(storageDeck_1.reservedOverflowNames);
    if (rNames.indexOf(name) > -1) {
        throw new Error("StorageDeck reserved names cannot be used:" + rNames.toString());
    }
    storageDeck_1.createNewCustomStorage(name);
};
exports.createNewStorage = createNewStorage;
const retrieveFromStorage = (keys, storageName) => {
    return genericFuncs_1.retrieveFromStorageGeneric(keys, storageDeck_1.getStorageInstance(storageName).store, true);
};
exports.retrieveFromStorage = retrieveFromStorage;
const addToStorage = (keyValue, storageName) => {
    genericFuncs_1.addToStorageGeneric(keyValue, storageDeck_1.getStorageInstance(storageName).store);
};
exports.addToStorage = addToStorage;
const removeFromStorage = (keys, storageName) => {
    genericFuncs_1.removeFromStorageGeneric(keys, storageDeck_1.getStorageInstance(storageName).store, true);
};
exports.removeFromStorage = removeFromStorage;
const clearStorage = (storageName) => {
    storageDeck_1.getStorageInstance(storageName).store.clear();
};
exports.clearStorage = clearStorage;
const deleteStorage = (storageName) => {
    try {
        exports.clearStorage(storageName);
        delete window[storageName];
        // need to also force undefined in some cases
        window[storageName] = undefined;
    }
    catch (_a) {
        // do nothing
    }
};
exports.deleteStorage = deleteStorage;
