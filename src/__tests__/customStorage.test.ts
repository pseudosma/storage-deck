import {
  addToStorage,
  clearStorage,
  createNewStorage,
  deleteStorage,
  removeFromStorage,
  retrieveFromStorage
} from "../customStorage";

describe("when using createNewStorage", () => {
  /* tslint:disable:no-string-literal */
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
  /* tslint:enable:no-string-literal */
});
