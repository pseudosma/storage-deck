# Storage Deck  [![Test](https://github.com/pseudosma/storage-deck/actions/workflows/push.yml/badge.svg?branch=master)](https://github.com/pseudosma/storage-deck/actions/workflows/push.yml) [![Coverage Status](https://coveralls.io/repos/github/pseudosma/storage-deck/badge.svg?branch=master)](https://coveralls.io/github/pseudosma/storage-deck?branch=master) ![License](https://img.shields.io/npm/l/storage-deck)

## Features
Storage Deck is a robust interface for interacting with a browser's localStorage and sessionStorage, capable of avoiding some of the common problems that come from using web storage directly. Some of the key features are:

### In-memory fall back

If browser storage is disabled, Storage Deck will automatically create a new window variable with a similar interface. The global objects do not persist data beyond the current page, but are ideal for use in single-page applications seeking to take advantage of an opportunistic storage model.

### Overflow Protection

Available size in either localStorage or sessionStorage varies by browser and can be very limited. If Storage Deck detects that the quota for storage is exceeded, it will automatically create a new global variable to store new items. If overflow has occurred, the Storage Deck functions will interact with both the original storage location and the overflow object seamlessly.

Clearing browser storage will also clear and remove the overflow object until an overflow happens again.

### Custom global storage

Another limitation of localStorage and sessionStorage is that data must be stored as a string. Storage Deck doesn't enforce that same restriction with any global objects that it creates. The core functions for creating and using overflow objects are exposed so that users can easily create their own custom in-memory, non-persistent storage objects for use across a web page.

A typical usage scenario could include using custom storage to temporarily store javascript File objects or even function references, both of which cannot be converted with JSON.stringify, in a convenient and globally available spot.

### What's new in version 2.1.0?

Storage-Deck now makes use of a [Searchable](https://github.com/pseudosma/searchability) object inside a StorageKey, as well as the original String and RegExp types. Searchables pair a string, which is the partial key to be searched for, along with the built-in search that needs to be performed: *EndsWith*, *Includes*, or *StartsWith*.

```typescript
{searchTerm: "example", searchType: SearchType.EndsWith }
```

## Usage

Storage Deck doesn't require any set up; all of the need to create and configure objects is obfuscated. Instead, Storage Deck exposes functions with similar signatures that can be imported on an as-needed basis.

### Local Storage Functions

#### Add items
```typescript
// add a single item
addToLocalStorage(keyValue: StorageKeyValuePair)
// or add multiple items
addToLocalStorage(keyValue: [...StorageKeyValuePair])
```

#### Clear all items
```typescript
clearLocalStorage()
```

#### Remove items
```typescript
// remove a single item from storage
removeFromLocalStorage(key: string)
// remove multiple items from storage
removeFromLocalStorage(key: RegExp)
removeFromLocalStorage(key: Searchable)
removeFromLocalStorage(key: [string, string])
removeFromLocalStorage(key: [string, RegExp])
```

#### Get items
```typescript
// retrieve a single item from storage
retrieveFromLocalStorage(key: string): null | string | StorageKeyValuePair[]
// retrieve multiple items from storage
retrieveFromLocalStorage(key: RegExp)
retrieveFromLocalStorage(key: Searchable)
retrieveFromLocalStorage(key: [string, string])
retrieveFromLocalStorage(key: [string, RegExp])
```

### Session Storage Functions

#### Add items
```typescript
//add a single item
addToSessionStorage(keyValue: StorageKeyValuePair)
// or add multiple items
addToSessionStorage(keyValue: [...StorageKeyValuePair )
```

#### Clear all items
```typescript
clearSessionStorage()
```

#### Remove items
```typescript
// remove a single item from storage
removeFromSessionStorage(key: string)
// remove multiple items from storage
removeFromSessionStorage(key: RegExp)
removeFromSessionStorage(key: Searchable)
removeFromSessionStorage(key: [string, string])
removeFromSessionStorage(key: [string, RegExp])
```

#### Get items
```typescript
// retrieve a single item from storage
retrieveFromSessionStorage(key: string): null | string | StorageKeyValuePair[]
// retrieve multiple items from storage
retrieveFromSessionStorage(key: RegExp)
retrieveFromSessionStorage(key: Searchable)
retrieveFromSessionStorage(key: [string, string])
retrieveFromSessionStorage(key: [string, RegExp])
```

### Custom Storage Functions

#### Add items
```typescript
// add single item
addToStorage(keyValue: StorageKeyValuePair, storageName: string)
// add multiple items
addToStorage(keyValue: [...StorageKeyValuePair], storageName: string)
```

#### Clear all items
``` typescript
clearStorage(storageName: string)
```

#### Create a new global storage instance
``` typescript
createNewStorage(name: string)
```
#### Delete a global storage instance
``` typescript
deleteStorage(storageName: string)
```

#### Remove items
``` typescript
// remove single item
removeFromStorage(key: string, storageName: string)
// remove multiple items
removeFromStorage(key: RegExp, storageName: string)
removeFromStorage(key: [string, string], storageName: string)
removeFromStorage(key: [string, RegExp], storageName: string)
```

#### Get items
``` typescript
// retrieve single item
retrieveFromStorage(key: string, storageName: string): any | StorageKeyValuePair[]
// retrieve multiple items from storage
retrieveFromStorage(key: RegExp, storageName: string)
retrieveFromStorage(key: [string, string], storageName: string)
retrieveFromStorage(key: [string, RegExp], storageName: string)
```

### Custom Types
```typescript
type StorageKey = string | RegExp;

interface StorageKeyValuePair {
  key: string;
  value: any;
  pattern?: string;
  addedSuccessfully?: boolean;
}
```

* The **StorageKey** type, or an array of that same type, is the input for the remove and retrieve functions.
* An object conforming to the  **StorageKeyValuePair** interface, or an array of that same type, is the input for the add functions.
  
> :warning: When using any of Storage Deck's retrieve function, if RegEx or an array of items is supplied, rather than a single value returned an array of **StorageKeyValuePair** is returned. The *key* or *pattern* fields denote which item the value returned matched.


### Do's

* If you're application is using ES6 or better, import just the functions you need. Storage Deck can be imported in its entirety in a `require` statement too, if using CommonJS.
* Use very specific RegEx for key searches. If part of the pattern matches the key, the corresponding value will be returned. 

### Don'ts

* There are four reserved names that can't be used with the `createNewStorage` function: 
  * "localStorage"
  * "sessionStorage"
  * "localOverflowStorage"
  * "localSessionStorage"

  Using these names will result in an error being thrown.
* It's possible to use the Custom Storage Functions to interact with localStorage and sessionStorage by specifying those for the `storageName` parameter, but doing so bypasses overflow handling.
* After using `createNewStorage` to make a new object, it's possible to interact with it using dot syntax as if it's a standard browser storage object:
  ```javascript
  import { createNewStorage } from "storage-deck";

  createNewStorage("customStorage");
  window.customStorage.setItem("foo", "bar");
  ```
  Doing this will work, but introduces an inconsistency in code structure. It's much better just to use the wrapper functions in all cases.

## Install with [npm](https://www.npmjs.com/)

```bash
npm i storage-deck --save
```
This package is provided in the CommonJS module format.

## Contributing

Pull requests are always welcome. For bugs and feature requests, [please create an issue](https://github.com/pseudosma/storage-deck/issues).

## License

Copyright (c) 2020 David Paige.  
Released under the MIT license.

