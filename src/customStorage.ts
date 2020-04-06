import {
  addToStorageGeneric,
  removeFromStorageGeneric,
  retrieveFromStorageGeneric
} from "./genericFuncs";

import {
  createNewCustomStorage,
  getStorageInstance,
  reservedBaseNames,
  reservedOverflowNames,
  StorageKey,
  StorageKeyValuePair
} from "./storageDeck";

export const createNewStorage = (name: string) => {
  // for external calls, enforce reservedNames
  const rNames = reservedBaseNames.concat(reservedOverflowNames);
  if (rNames.indexOf(name) > -1) {
    throw new Error(
      "StorageDeck reserved names cannot be used:" + rNames.toString()
    );
  }
  createNewCustomStorage(name);
};

export const retrieveFromStorage = (
  keys: StorageKey | StorageKey[],
  storageName: string
): any => {
  return retrieveFromStorageGeneric(
    keys,
    getStorageInstance(storageName).store,
    true
  );
};

export const addToStorage = (
  keyValue: StorageKeyValuePair | StorageKeyValuePair[],
  storageName: string
) => {
  addToStorageGeneric(keyValue, getStorageInstance(storageName).store);
};

export const removeFromStorage = (
  keys: StorageKey | StorageKey[],
  storageName: string
) => {
  removeFromStorageGeneric(keys, getStorageInstance(storageName).store, true);
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
