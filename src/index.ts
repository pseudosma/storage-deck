const reservedBaseNames: string[] = ["localStorage", "sessionStorage"];
const reservedOverflowNames: string[] = [
  "localOverflowStorage",
  "sessionOverflowStorage"
];

enum StorageScheme {
  Basic = 0,
  Overflow = 1,
  Custom = 2
}

interface IStore {
  [index: string]: any;
}

interface IStorage {
  readonly storage: IStore;
  // mimics the funcs provided by localStorage and sessionStorage
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

class CustomStorage implements IStorage {
  public storage: IStore = [];
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

const createNewCustomStorage = (name: any) => {
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

const getStorageInstance = (name: string): StorageDeck => {
  let scheme = StorageScheme.Custom;
  let store;
  if (reservedBaseNames.includes(name)) {
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
    }
  } else {
    store = (window as any)[name];
  }
  return new StorageDeck(store, scheme);
};


// ------------ Custom Storage ------------ //


export const createNewStorage = (name: any) => {
    // for external calls, enforce reservedNames
    const rNames = reservedBaseNames.concat(reservedOverflowNames);
    if (rNames.includes(name)) {
      throw new Error(
        "StorageDeck reserved names cannot be used:" + rNames.toString()
      );
    }
    createNewCustomStorage(name);
  };
  
  export const retrieveFromStorage = (key: string, storageName: string): any => {
    return getStorageInstance(storageName).store.getItem(key, storageName);
  };
  
  export const addToStorage = (key: string, value: any, storageName: string) => {
    getStorageInstance(storageName).store.setItem(key, value);
  };
  
  export const removeFromStorage = (key: string, storageName: string) => {
    getStorageInstance(storageName).store.removeItem(key);
  };
  
  export const clearStorage = (storageName: string) => {
    getStorageInstance(storageName).store.clear();
  };
  
  export const deleteStorage = (storageName: string) => {
    try {
      clearStorage(storageName);
      delete (window as any)[storageName];
      // need to also force undefined in some cases
      (window as any)[storageName] = undefined;
    } catch {
      // do nothing
    }
  };
  

// ------------ Web Storage ------------ //


const retrieveFromDefaultStorage = (
    key: string,
    storageName: string,
    overflowName: string
  ): any => {
    const s = getStorageInstance(storageName);
    let i = null;
    if (s.scheme === StorageScheme.Overflow) {
      // if it's in overflow mode, we may have our data in either localStorage or overflowStorage
      // do basic check first, which should
      i = s.store.getItem(key);
      if (i === null) {
        i = (window as any)[overflowName].getItem(key);
      }
    } else {
      i = s.store.getItem(key);
    }
    return i;
  };
  
  export const retrieveFromLocalStorage = (key: string): any => {
    return retrieveFromDefaultStorage(
      key,
      reservedBaseNames[0],
      reservedOverflowNames[0]
    );
  };
  
  export const retrieveFromSessionStorage = (key: string): any => {
    return retrieveFromDefaultStorage(
      key,
      reservedBaseNames[1],
      reservedOverflowNames[1]
    );
  };
  
  const addToDefaultStorage = (
    key: string,
    value: any,
    storageName: string,
    overflowStorage: string
  ) => {
    try {
      getStorageInstance(storageName).store.setItem(key, value);
    } catch (e) {
      // this error occurs if the storage limit on localStorage is exceeded
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        // spawn overflowStorage and put the value in there
        if (typeof (window as any)[overflowStorage] === "undefined") {
          createNewCustomStorage(overflowStorage);
        }
        (window as any)[overflowStorage].setItem(key, value);
      }
    }
  };
  
  export const addToLocalStorage = (key: string, value: any) => {
    addToDefaultStorage(
      key,
      value,
      reservedBaseNames[0],
      reservedOverflowNames[0]
    );
  };
  
  export const addToSessionStorage = (key: string, value: any) => {
    addToDefaultStorage(
      key,
      value,
      reservedBaseNames[1],
      reservedOverflowNames[1]
    );
  };
  
  const removeFromDefaultStorage = (
    key: string,
    storageName: string,
    overflowName: string
  ) => {
    const s = getStorageInstance(storageName);
    if (s.scheme === StorageScheme.Overflow) {
      // remove from both. this op is safe if one of the lists doesn't contain the item
      (window as any)[overflowName].removeItem(key);
    }
    (window as any)[storageName].removeItem(key);
  };
  
  export const removeFromLocalStorage = (key: string) => {
    removeFromDefaultStorage(key, reservedBaseNames[0], reservedOverflowNames[0]);
  };
  
  export const removeFromSessionStorage = (key: string) => {
    removeFromDefaultStorage(key, reservedBaseNames[1], reservedOverflowNames[1]);
  };
  
  const clearDefaultStorage = (storageName: string, overflowName: string) => {
    const s = getStorageInstance(storageName);
    if (s.scheme === StorageScheme.Overflow) {
      s.store.clear();
      // now delete our overflow since our sessionStorage is free again
      deleteStorage(overflowName);
    }
    s.store.clear();
  };
  
  export const clearLocalStorage = () => {
    clearDefaultStorage(reservedBaseNames[0], reservedOverflowNames[0]);
  };
  
  export const clearSessionStorage = () => {
    clearDefaultStorage(reservedBaseNames[1], reservedOverflowNames[1]);
  };
  