import { deleteStorage } from "./customStorage";

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
  StorageKeyValuePair,
  StorageScheme
} from "./storageDeck";

const retrieveFromDefaultStorage = (
  keys: StorageKey | StorageKey[],
  storageName: string,
  overflowName: string
): any => {
  const s = getStorageInstance(storageName);
  if (s.scheme === StorageScheme.Overflow) {
    // if it's in overflow mode, we may have our data in either localStorage or overflowStorage
    // check both locations and concat the results
    const a: any = retrieveFromStorageGeneric(keys, s.store, false);
    const b: any = retrieveFromStorageGeneric(
      keys,
      (window as any)[overflowName],
      true
    );
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
  } else {
    return retrieveFromStorageGeneric(keys, s.store, false);
  }
};

export const retrieveFromLocalStorage = (
  key: StorageKey | StorageKey[]
): null | string | StorageKeyValuePair[] => {
  return retrieveFromDefaultStorage(
    key,
    reservedBaseNames[0],
    reservedOverflowNames[0]
  );
};

export const retrieveFromSessionStorage = (
  key: StorageKey | StorageKey[]
): null | string | StorageKeyValuePair[] => {
  return retrieveFromDefaultStorage(
    key,
    reservedBaseNames[1],
    reservedOverflowNames[1]
  );
};

const addToDefaultStorage = (
  keyValue: StorageKeyValuePair | StorageKeyValuePair[],
  storageName: string,
  overflowStorage: string
) => {
  try {
    addToStorageGeneric(keyValue, getStorageInstance(storageName).store);
  } catch (e) {
    // this error occurs if the storage limit on storage is exceeded
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn(
        "Storage at " +
          name +
          " is full. Overflow storage will be created but all additional data will not persist."
      );
      if (typeof (window as any)[overflowStorage] === "undefined") {
        // spawn overflowStorage and put the value in there
        createNewCustomStorage(overflowStorage);
      }
      addToStorageGeneric(keyValue, (window as any)[overflowStorage]);
    } else {
      throw e;
    }
  }
};

export const addToLocalStorage = (
  keyValue: StorageKeyValuePair | StorageKeyValuePair[]
) => {
  addToDefaultStorage(keyValue, reservedBaseNames[0], reservedOverflowNames[0]);
};

export const addToSessionStorage = (
  keyValue: StorageKeyValuePair | StorageKeyValuePair[]
) => {
  addToDefaultStorage(keyValue, reservedBaseNames[1], reservedOverflowNames[1]);
};

const removeFromDefaultStorage = (
  keys: StorageKey | StorageKey[],
  storageName: string,
  overflowName: string
) => {
  const s = getStorageInstance(storageName);
  if (s.scheme === StorageScheme.Overflow) {
    // remove from both. this op is safe if one of the lists doesn't contain the item
    // or if one list doesn't exist
    removeFromStorageGeneric(keys, (window as any)[overflowName], false);
  }
  removeFromStorageGeneric(keys, s.store, false);
};

export const removeFromLocalStorage = (key: StorageKey | StorageKey[]) => {
  removeFromDefaultStorage(key, reservedBaseNames[0], reservedOverflowNames[0]);
};

export const removeFromSessionStorage = (key: StorageKey | StorageKey[]) => {
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
