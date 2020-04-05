export const reservedBaseNames: string[] = ["localStorage", "sessionStorage"];
export const reservedOverflowNames: string[] = [
  "localOverflowStorage",
  "sessionOverflowStorage"
];

export enum StorageScheme {
  Basic = 0,
  Overflow = 1,
  Custom = 2
}

interface Store {
  [index: string]: any;
}

export type StorageKey = string | RegExp;

export interface StorageKeyValuePair {
  key: string;
  value: any;
  pattern?: string; //used when this is a return type to show regEx patten that found the key 
}

interface Storage {
  readonly storage: Store;
  // mimics the funcs provided by localStorage and sessionStorage
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

class CustomStorage implements Storage {
  public storage: Store = [];
  get length() {
    return Object.keys(this.storage).length;
  }

  public getItem = (key: string) => {
    if (key in this.storage) {
      return this.storage[key];
    }
    return null; // avoid returning undefined to simulate sessionStorage
  };

  public setItem = (key: string, value: any) => {
    this.storage[key] = value;
  };

  public removeItem = (key: string) => {
    if (key in this.storage) {
      delete this.storage[key];
    }
  };

  public clear = () => {
    this.storage.length = 0;
  };
}

class StorageDeck {
  public store: any;
  public scheme: StorageScheme;
  // wrapper for both global and custom storage
  constructor(sto: any, scm?: StorageScheme) {
    this.store = sto;
    this.scheme = StorageScheme.Custom;
    if (scm) {
      this.scheme = scm;
    }
  }
}

export const createNewCustomStorage = (name: any) => {
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

export const getStorageInstance = (name: string): StorageDeck => {
  let scheme = StorageScheme.Custom;
  let store;
  if (reservedBaseNames.indexOf(name) > -1) {
    // using built-in storage
    if (typeof (window as any)[name] !== "undefined") {
      // this indicates storage is enabled
      scheme = StorageScheme.Basic;
      store = (window as any)[name];
      if (name === reservedBaseNames[0]) {
        // if localOverflowStorage is present, it's in overflow mode
        if (typeof (window as any)[reservedOverflowNames[0]] !== "undefined") {
          scheme = StorageScheme.Overflow;
          // keep the base storage referenced since they both can contain data
        }
      }
      if (name === reservedBaseNames[1]) {
        // if sessionOverflowStorage is present, it's in overflow mode
        if (typeof (window as any)[reservedOverflowNames[1]] !== "undefined") {
          scheme = StorageScheme.Overflow;
        }
      }
    } else {
      // make a global object of the name being used
      scheme = StorageScheme.Custom;
      createNewCustomStorage(name);
      store = (window as any)[name];
      console.warn(
        "Unable to use default storage for " +
          name +
          ". A global variable of the same name will be created but the data will not be persistent."
      );
    }
  } else {
    store = (window as any)[name];
  }
  return new StorageDeck(store, scheme);
};
