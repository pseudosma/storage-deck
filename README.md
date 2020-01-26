## Features
Storage Deck is a robust interface for interacting with a browser's localStorage and sessionStorage, capable of avoiding some of the common problems that come from using web storage directly. Some of the key features are:

### In-memory fall back

If browser storage is disabled, Storage Deck will automatically create a new window variable with a similar interface. The global objects do not persist data beyond the current page, but are ideal for use in single-page applications seeking to take advantage of an opportunistic storage model.

### Overflow Protection

Available size in either localStorage or sessionStorage varies by browser and can be very limited. If Storage Deck detects that the quota for storage is exceeded, it will automatically create a new global variable to store new items. If overflow has occurred, the Storage Deck functions will interact with both the original storage location and the overflow object seamlessly.

Clearing browser storage will also clear and remove the overflow object until an overflow happens again.

### Custom global storage

Another limitation of localStorage and sessionStorage is that data must be stored as a string. Storage Deck doesn't enforce that same restriction with any global objects that it creates. The core functions for creating and using overflow objects are exposed so that users can easily create their own custom in-memory, non-persistent storage objects for use across a web page.

A typical usage scenario could include using custom storage to temporarily store javascript File objects or even function references, both of which cannot be converted to a string, in a convenient and globally available spot.

## Usage

Storage Deck doesn't require any set up; all of the need to create and configure objects is obfuscated. Instead, Storage Deck exposes functions with similar signatures that can be imported on an as-needed basis.

### Local Storage Functions

```typescript
addToLocalStorage(key: string, value: any)

clearLocalStorage()

removeFromLocalStorage(key: string)

retrieveFromLocalStorage(key: string): any
```

### Session Storage Functions

```typescript
addToSessionStorage(key: string, value: any)

clearSessionStorage()

removeFromSessionStorage = (key: string)

retrieveFromSessionStorage(key: string): any 
```

### Custom Storage Functions

```typescript
addToStorage(key: string, value: any, storageName: string)

clearStorage(storageName: string)

createNewStorage(name: any)

deleteStorage(storageName: string)

removeFromStorage(key: string, storageName: string)

retrieveFromStorage(key: string, storageName: string): any

```

### Do's

* If you're application is using ES6 or better, import just the functions you need. Storage Deck can be imported in its entirety in a `require` statement too, if using CommonJS/ES5.

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

## Install with [npm](npmjs.org)

```bash
npm i storage-deck --save
```
This package is provided in the CommonJS module format.

## Contributing

Pull requests are always welcome. For bugs and feature requests, [please create an issue](https://github.com/pseudosma/storage-deck/issues).

## License

Copyright (c) 2020 David Paige.  
Released under the MIT license.

