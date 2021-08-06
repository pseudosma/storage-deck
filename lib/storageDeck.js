"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservedBaseNames = ["localStorage", "sessionStorage"];
exports.reservedOverflowNames = [
    "localOverflowStorage",
    "sessionOverflowStorage"
];
var StorageScheme;
(function (StorageScheme) {
    StorageScheme[StorageScheme["Basic"] = 0] = "Basic";
    StorageScheme[StorageScheme["Overflow"] = 1] = "Overflow";
    StorageScheme[StorageScheme["Custom"] = 2] = "Custom";
})(StorageScheme = exports.StorageScheme || (exports.StorageScheme = {}));
class CustomStorage {
    constructor() {
        this.storage = [];
        this.getItem = (key) => {
            if (key in this.storage) {
                return this.storage[key];
            }
            return null; // avoid returning undefined to simulate sessionStorage
        };
        this.setItem = (key, value) => {
            this.storage[key] = value;
        };
        this.removeItem = (key) => {
            if (key in this.storage) {
                delete this.storage[key];
            }
        };
        this.clear = () => {
            this.storage.length = 0;
        };
    }
    get length() {
        return Object.keys(this.storage).length;
    }
}
class StorageDeck {
    // wrapper for both global and custom storage
    constructor(sto, scm) {
        this.store = sto;
        this.scheme = StorageScheme.Custom;
        if (scm) {
            this.scheme = scm;
        }
    }
}
exports.createNewCustomStorage = (name) => {
    if (typeof window[name] === "undefined") {
        // only create if it's undefined.
        const sd = new CustomStorage();
        Object.defineProperty(window, name, {
            configurable: true,
            value: sd,
            writable: true
        });
    }
};
exports.getStorageInstance = (name) => {
    let scheme = StorageScheme.Custom;
    let store;
    if (exports.reservedBaseNames.indexOf(name) > -1) {
        // using built-in storage
        if (typeof window[name] !== "undefined") {
            // this indicates storage is enabled
            scheme = StorageScheme.Basic;
            store = window[name];
            if (name === exports.reservedBaseNames[0]) {
                // if localOverflowStorage is present, it's in overflow mode
                if (typeof window[exports.reservedOverflowNames[0]] !== "undefined") {
                    scheme = StorageScheme.Overflow;
                    // keep the base storage referenced since they both can contain data
                }
            }
            if (name === exports.reservedBaseNames[1]) {
                // if sessionOverflowStorage is present, it's in overflow mode
                if (typeof window[exports.reservedOverflowNames[1]] !== "undefined") {
                    scheme = StorageScheme.Overflow;
                }
            }
        }
        else {
            // make a global object of the name being used
            scheme = StorageScheme.Custom;
            exports.createNewCustomStorage(name);
            store = window[name];
            console.warn("Unable to use default storage for " +
                name +
                ". A global variable of the same name will be created but the data will not be persistent.");
        }
    }
    else {
        store = window[name];
        if (typeof store === "undefined") {
            throw new Error('No storage instance named "' + name + '" found');
        }
    }
    return new StorageDeck(store, scheme);
};
