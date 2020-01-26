import {
  createNewCustomStorage,
  getStorageInstance,
  reservedBaseNames,
  reservedOverflowNames
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
