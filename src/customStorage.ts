import {
  createNewCustomStorage,
  getStorageInstance,
  reservedBaseNames,
  reservedOverflowNames,
  StorageKey,
  StorageKeyValuePair
} from "./storageDeck";

export const createNewStorage = (name: any) => {
  // for external calls, enforce reservedNames
  const rNames = reservedBaseNames.concat(reservedOverflowNames);
  if (rNames.indexOf(name) > -1) {
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

export const retrieveAllFromStorage = (
  keys: Array<StorageKey>,
  storageName: string
): Array<StorageKeyValuePair>|null => {
  const retVal: Array<StorageKeyValuePair> = [];
  const sd = getStorageInstance(storageName);
  keys.forEach(key => {
    if (typeof key === "string") {
      const v = sd.store.getItem(key);
      if (v !== null) {
        retVal.push({key: key, value: v});
      }
    } else {
      Object.keys(sd.store.storage).forEach(k => {
        const m = k.match(key);
        if (m !== null) {
          var r = { 
            key: k, 
             value: sd.store.getItem(k),
            pattern: key.source
          };
          retVal.push(r);
        }
      });
    }
  });
  if (retVal.length > 0) {
    //now remove dupicates
    const rv: Array<StorageKeyValuePair> = [];
    retVal.forEach((o) => {
      if (rv.findIndex((r) => o.key === r.key) === -1) {
        rv.push(o);
      }
    });
    return rv;
  }
  return null;
};

export const addAllToStorage = (
  addArgs: Array<StorageKeyValuePair>,
  storageName: string
) => {
  const sd = getStorageInstance(storageName);
  addArgs.forEach(kv => {
    sd.store.setItem(kv.key, kv.value);
  });
};

export const removeAllFromStorage = (
  keys: Array<StorageKey>,
  storageName: string
) => {
  const sd = getStorageInstance(storageName);
  keys.forEach(key => {
    if (typeof key === "string") {
      sd.store.removeItem(key);
    } else {
      console.log("RegExp on removeAll");
      Object.keys(sd.store.storage).forEach(k => {
        const m = k.match(key);
        if (m !== null) {
          sd.store.removeItem(k);
        }
      });
    }
  });
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
