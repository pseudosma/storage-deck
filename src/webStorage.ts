import { deleteStorage } from "./customStorage";
import {
  createNewCustomStorage,
  getStorageInstance,
  reservedBaseNames,
  reservedOverflowNames,
  StorageScheme
} from "./storageDeck";

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
