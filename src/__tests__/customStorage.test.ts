import {
  addToStorage,
  clearStorage,
  createNewStorage,
  deleteStorage,
  removeFromStorage,
  retrieveFromStorage,
  StorageKeyValuePair
} from "../index";

/* tslint:disable:no-string-literal */
describe("when using createNewStorage", () => {
  beforeAll(() => {
    createNewStorage("testOne");
    (window as any).testOne["test"] = 1;
  });
  it("should add a new global window variable", () => {
    expect((window as any).testOne).not.toBeNull();
    expect((window as any).testOne).not.toBeUndefined();
    expect((window as any).testOne["test"]).toStrictEqual(1);
  });
  it("should not create a new object if it already exists", () => {
    createNewStorage("testOne");
    // this would normally override the existing prop, so check if the value from the previous test is in there
    expect((window as any).testOne["test"]).toStrictEqual(1);
    expect((window as any).testOne["test"]).not.toStrictEqual(2);
  });
  it("should throw if it is passed a reserved name", () => {
    expect(() => {
      createNewStorage("localStorage");
    }).toThrow();
    expect(() => {
      createNewStorage("localOverflowStorage");
    }).toThrow();
    expect(() => {
      createNewStorage("sessionStorage");
    }).toThrow();
    expect(() => {
      createNewStorage("sessionOverflowStorage");
    }).toThrow();
  });
  it("should be delete-able", () => {
    expect((window as any).testOne).not.toBeUndefined();
    deleteStorage("testOne");
    expect((window as any).testOne).toBeUndefined();
    // multiple deletes shouldn't hurt
    deleteStorage("testOne");
    expect((window as any).testOne).toBeUndefined();
  });
  afterAll(() => {
    deleteStorage("testOne");
  });
});

describe("when using custom storage", () => {
  it("should be able to add, retrieve, remove, and clear", () => {
    // create
    createNewStorage("customStorage");
    expect((window as any)["customStorage"]).not.toStrictEqual(null);
    // add
    addToStorage({ key: "test", value: "1234" }, "customStorage");
    addToStorage({ key: "1234", value: "test" }, "customStorage");
    createNewStorage("customStorage");
    // shouldn't create a new one, which would flush values
    expect(retrieveFromStorage("test", "customStorage")).toStrictEqual("1234");
    // remove
    removeFromStorage("test", "customStorage");
    expect(retrieveFromStorage("test", "customStorage")).toBeNull();
    // make sure it doesn't bomb when we try again
    removeFromStorage("test", "customStorage");
    expect(retrieveFromStorage("1234", "customStorage")).toStrictEqual("test");
    // clear
    clearStorage("customStorage");
    expect(retrieveFromStorage("1234", "customStorage")).toBeNull();
    // delete
    deleteStorage("customStorage");
    // trying to retrieve from a deleted storage should throw
    expect(() => {
      retrieveFromStorage("test", "customStorage");
    }).toThrowError(
      new Error('No storage instance named "customStorage" found')
    );
  });
});

describe("when using custom storage with arrays in the params", () => {
  beforeEach(() => {
    createNewStorage("testTwo");
    const a = [
      { key: "test", value: "1234" },
      { key: "1234", value: "test" }
    ];
    addToStorage(a, "testTwo");
  });
  it("should allow more keys to be added with add", () => {
    const a = [
      { key: "z", value: "1234" },
      { key: "y", value: "test" }
    ];
    addToStorage(a, "testTwo");
    const r = retrieveFromStorage(["test", "1234", "z", "y"], "testTwo");
    if (r) {
      expect(r.length).toStrictEqual(4);
    } else {
      //force error if it's null
      expect(true).toStrictEqual(false);
    }
  });
  it("should return null if no values are found", () => {
    const r = retrieveFromStorage(["z", "y"], "testTwo");
    expect(r).toBeNull;
  });
  it("should retrieve all keys specified by keys", () => {
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(2);
    expect(r![0].value).toStrictEqual("1234");
    expect(r![1].value).toStrictEqual("test");
  });
  it("should retrieve all keys matching RegExp", () => {
    const r = retrieveFromStorage(new RegExp(".*", "g"), "testTwo");
    expect(r!.length).toStrictEqual(2);
    //order will be different
    (r as StorageKeyValuePair[]).forEach(o => {
      expect(o.pattern).toStrictEqual(".*");
      if (o.key === "1234") {
        expect(o.value).toStrictEqual("test");
      } else if (o.key === "test") {
        expect(o.value).toStrictEqual("1234");
      } else {
        //force error if it's something else
        expect(true).toStrictEqual(false);
      }
    });
  });
  it("should retrieve all keys without dupes matching RegExp with returnAll", () => {
    const r = retrieveFromStorage(
      [new RegExp("[0-9][a-z]*", "g"), new RegExp(".*", "g")],
      "testTwo"
    );
    expect(r!.length).toStrictEqual(2);
    //order will be different
    (r as StorageKeyValuePair[]).forEach(o => {
      if (o.key === "1234") {
        expect(o.value).toStrictEqual("test");
      } else if (o.key === "test") {
        expect(o.value).toStrictEqual("1234");
      } else {
        //force error if it's something else
        expect(true).toStrictEqual(false);
      }
    });
  });
  it("should retrieve all keys without dupes using Searchables with returnAll", () => {
    const r = retrieveFromStorage(
      [
        { string: "es", searchType: 1 },
        { string: "23", searchType: 1 }
      ],
      "testTwo"
    );
    expect(r!.length).toStrictEqual(2);
    //order will be different
    (r as StorageKeyValuePair[]).forEach(o => {
      if (o.key === "1234") {
        expect(o.value).toStrictEqual("test");
      } else if (o.key === "test") {
        expect(o.value).toStrictEqual("1234");
      } else {
        //force error if it's something else
        expect(true).toStrictEqual(false);
      }
    });
  });
  it("should retrieve all keys without dupes matching strings, RegExp, and Searchables with returnAll", () => {
    const r = retrieveFromStorage(
      ["test", new RegExp(".*", "g"), { string: "te", searchType: 2 }],
      "testTwo"
    );
    expect(r!.length).toStrictEqual(2);
    //order might be different on because the dupes get removed
    (r as StorageKeyValuePair[]).forEach(o => {
      if (o.key === "1234") {
        expect(o.value).toStrictEqual("test");
      } else if (o.key === "test") {
        expect(o.value).toStrictEqual("1234");
      } else {
        //force error if it's something else
        expect(true).toStrictEqual(false);
      }
    });
  });
  it("should removeAll by key", () => {
    removeFromStorage(["test", "1234"], "testTwo");
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should remove by RegEx", () => {
    removeFromStorage(new RegExp(".*", "g"), "testTwo");
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should remove with multiple RegEx", () => {
    removeFromStorage([new RegExp("[a-z]*"), new RegExp("[0-9]*")], "testTwo");
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should remove by Searchable", () => {
    removeFromStorage({ string: "test", searchType: 2 }, "testTwo");
    const r = retrieveFromStorage(["test5678", "test1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should remove with multiple Searchables", () => {
    removeFromStorage(
      [
        { string: "cat", searchType: 2 },
        { string: "dog", searchType: 0 }
      ],
      "testTwo"
    );
    const r = retrieveFromStorage(["cat1234", "1234dog"], "testTwo");
    expect(r).toBeNull;
  });
  it("should removeAll with mixed values", () => {
    removeFromStorage(
      ["test", new RegExp("[0-9]*"), { string: "cat", searchType: 2 }],
      "testTwo"
    );
    const r = retrieveFromStorage(["test", "1234", "catABC"], "testTwo");
    expect(r).toBeNull;
  });
  it("should only target specific values with remove", () => {
    removeFromStorage(["test"], "testTwo");
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(1);
    expect(r![0].key).toStrictEqual("1234");
  });
  it("should only target specific values with RegEx with remove", () => {
    removeFromStorage([new RegExp("test")], "testTwo");
    const r = retrieveFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(1);
    expect(r![0].key).toStrictEqual("1234");
  });
  afterEach(() => {
    deleteStorage("testTwo");
  });
});
/* tslint:enable:no-string-literal */
