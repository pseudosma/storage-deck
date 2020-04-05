import {
  addAllToStorage,
  addToStorage,
  clearStorage,
  createNewStorage,
  deleteStorage,
  removeAllFromStorage,
  removeFromStorage,
  retrieveAllFromStorage,
  retrieveFromStorage,
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
  it("should be deletable", () => {
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
    addToStorage("test", "1234", "customStorage");
    addToStorage("1234", "test", "customStorage");
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
    }).toThrow();
  });
});

describe("when using custom storage", () => {
  beforeEach(() => {
    createNewStorage("testTwo");
    const a = [
      { key: "test", value: "1234"},
      { key: "1234", value: "test"}
    ];
    addAllToStorage(a, "testTwo");
  });
  it("should allow more keys to be added with addAll", () => {
    const a = [
      { key: "z", value: "1234"},
      { key: "y", value: "test"}
    ];
    addAllToStorage(a, "testTwo");
    const r = retrieveAllFromStorage(["test", "1234", "z", "y"], "testTwo");
    if (r) {
      expect(r.length).toStrictEqual(4);
    } else {
      //force error if it's null
      expect(true).toStrictEqual(false);
    }
  });
  it("should return null if no values are found with returnAll", () => {
    const r = retrieveAllFromStorage(["z", "y"], "testTwo");
    expect(r).toBeNull;
  });
  it("should retrieve all keys specified by keys with returnAll", () => {
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(2);
    expect(r![0].value).toStrictEqual("1234");
    expect(r![1].value).toStrictEqual("test");
  });
  it("should retrieve all keys matching RegExp with returnAll", () => {
    const r = retrieveAllFromStorage([new RegExp(".*","g")], "testTwo");
    expect(r!.length).toStrictEqual(2);
    //order will be different
    r!.forEach((o) => {
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
    const r = retrieveAllFromStorage([new RegExp("[0-9][a-z]*","g"), new RegExp(".*","g")], "testTwo");
    expect(r!.length).toStrictEqual(2);
    //order will be different
    r!.forEach((o) => {
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
  it("should retrieve all keys without dupes matching RegExp and strings with returnAll", () => {
    const r = retrieveAllFromStorage(["test", new RegExp(".*","g")], "testTwo");
    expect(r!.length).toStrictEqual(2);
    //order might be different on because the dupes get removed
    r!.forEach((o) => {
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
    removeAllFromStorage(["test", "1234"], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should removeAll by RegEx", () => {
    removeAllFromStorage([new RegExp(".*","g")], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should removeAll with multiple RegEx", () => {
    removeAllFromStorage([new RegExp("[0-9][a-z]*"), new RegExp(".*")], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should removeAll with mixed values", () => {
    removeAllFromStorage(["test", new RegExp(".*","g")], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r).toBeNull;
  });
  it("should only target specific values with removeAll", () => {
    removeAllFromStorage(["test"], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(1);
    expect(r![0].key).toStrictEqual("1234");
  });
  it("should only target specific values with RegEx with removeAll", () => {
    removeAllFromStorage([new RegExp("test")], "testTwo");
    const r = retrieveAllFromStorage(["test", "1234"], "testTwo");
    expect(r!.length).toStrictEqual(1);
    expect(r![0].key).toStrictEqual("1234");
  });
  afterEach(() => {
    deleteStorage("testTwo");
  });
});
/* tslint:enable:no-string-literal */
