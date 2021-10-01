import * as sd from "../storageDeck";
import {
  addToLocalStorage,
  addToSessionStorage,
  clearLocalStorage,
  clearSessionStorage,
  removeFromLocalStorage,
  removeFromSessionStorage,
  retrieveFromLocalStorage,
  retrieveFromSessionStorage
} from "../index";

let overflowString: string = "0123456789";

describe("when using webStorage", () => {
  it("should throw on setItem for non domExceptions", () => {
    const s = {
      store: {
        setItem: () => {
          throw new Error("sdkjfjsk");
        }
      },
      scheme: 1
    };
    const m = jest.spyOn(sd, "getStorageInstance");
    m.mockImplementation((n: string) => {
      return s;
    });
    expect(() => {
      addToSessionStorage({ key: "foo", value: "1234" });
    }).toThrow();
    m.mockRestore();
  });
  it("should throw on setItem for non quota errors", () => {
    const s = {
      store: {
        setItem: () => {
          throw { type: DOMException, name: "FakeError" };
        }
      },
      scheme: 1
    };
    const m = jest.spyOn(sd, "getStorageInstance");
    m.mockImplementation((n: string) => {
      return s;
    });
    expect(() => {
      addToSessionStorage({ key: "foo", value: "1234" });
    }).toThrow();
    m.mockRestore();
  });
});

describe("when using localStorage", () => {
  beforeAll(() => {
    let i: number;
    // the resulting string will be 5314410 chars long, just over 5 MB
    for (i = 0; i < 12; i++) {
      overflowString += overflowString + overflowString;
    }
  });
  it("should use if it's available", () => {
    addToLocalStorage({ key: "test", value: "1234" });
    expect(window.localStorage.getItem("test")).toStrictEqual("1234");
    window.localStorage.clear();
  });
  it("should be able to add, retrieve, remove, and clear", () => {
    // add
    addToLocalStorage({ key: "test", value: "1234" });
    addToLocalStorage({ key: "1234", value: "test" });
    expect(window.localStorage.getItem("test")).toStrictEqual("1234");
    // retrieve
    expect(retrieveFromLocalStorage("test")).toStrictEqual("1234");
    expect(window.localStorage.getItem("1234")).toStrictEqual("test");
    removeFromLocalStorage("test");
    // remove
    expect(retrieveFromLocalStorage("test")).toBeNull();
    expect(window.localStorage.getItem("test")).toBeNull();
    expect(retrieveFromLocalStorage("1234")).toStrictEqual("test");
    expect(window.localStorage.getItem("1234")).toStrictEqual("test");
    // clear
    clearLocalStorage();
    expect(retrieveFromLocalStorage("1234")).toBeNull();
    expect(window.localStorage.getItem("1234")).toBeNull();
  });
  it("should allow retrieval by arrays, regEx, and searchables", () => {
    // add
    addToLocalStorage({ key: "foo", value: "1234" });
    addToLocalStorage({ key: "1234", value: "bar" });
    const a = retrieveFromLocalStorage(["foo", "1234"]);
    expect((a as string).length).toStrictEqual(2);
    const b = retrieveFromLocalStorage(new RegExp(".*"));
    expect((b as string).length).toStrictEqual(2);
    const c = retrieveFromLocalStorage(new RegExp("[a-z]*"));
    expect((c as string).length).toStrictEqual(1);
    const d = retrieveFromLocalStorage(new RegExp("[0-9]*"));
    expect((d as string).length).toStrictEqual(1);
    const e = retrieveFromLocalStorage([
      new RegExp("[0-9]*"),
      new RegExp("[a-z]*")
    ]);
    expect((e as string).length).toStrictEqual(2);
    const f = retrieveFromLocalStorage(["1234", new RegExp("[a-z]*")]);
    expect((f as string).length).toStrictEqual(2);
    const g = retrieveFromLocalStorage(new RegExp("cat"));
    expect(g).toBeNull;
    const h = retrieveFromLocalStorage({ searchTerm: "f", searchType: 2 });
    expect((h as string).length).toStrictEqual(1);
    const i = retrieveFromLocalStorage({ searchTerm: "foo", searchType: 2 });
    expect((i as string).length).toStrictEqual(1);
    const j = retrieveFromLocalStorage({ searchTerm: "d", searchType: 2 });
    expect(j).toBeNull;
    const k = retrieveFromLocalStorage({ searchTerm: "o", searchType: 1 });
    expect((k as string).length).toStrictEqual(1);
    const l = retrieveFromLocalStorage({ searchTerm: "fo", searchType: 1 });
    expect((l as string).length).toStrictEqual(1);
    const m = retrieveFromLocalStorage({ searchTerm: "foo", searchType: 1 });
    expect((m as string).length).toStrictEqual(1);
    const n = retrieveFromLocalStorage({ searchTerm: "a", searchType: 1 });
    expect(n).toBeNull;
    const o = retrieveFromLocalStorage({ searchTerm: "34", searchType: 0 });
    expect((o as string).length).toStrictEqual(1);
    const p = retrieveFromLocalStorage({ searchTerm: "o", searchType: 0 });
    expect((p as string).length).toStrictEqual(1);
    const q = retrieveFromLocalStorage({ searchTerm: "1234", searchType: 0 });
    expect((q as string).length).toStrictEqual(1);
    const r = retrieveFromLocalStorage({ searchTerm: "z", searchType: 0 });
    expect(r).toBeNull;
    // clear
    clearLocalStorage();
  });
  it("should allow removal by arrays and regEx", () => {
    // by keys
    addToLocalStorage({ key: "foo", value: "1234" });
    addToLocalStorage({ key: "1234", value: "bar" });
    removeFromLocalStorage(["foo", "1234"]);
    expect(retrieveFromLocalStorage(["foo", "1234"])).toBeNull;
    // by RegEx
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage(new RegExp(".*"));
    expect(retrieveFromLocalStorage(["foo", "1234"])).toBeNull;
    // by single RegEx match
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage(new RegExp("[a-z]*"));
    expect((retrieveFromLocalStorage(["foo", "1234"]) as []).length).toStrictEqual(1);
    clearLocalStorage();
    // by multiple RegEx matches
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" },
      { key: "ABCD", value: "abcd" }
    ]);
    removeFromLocalStorage([new RegExp("[0-9]*"), new RegExp("[a-z]*")]);
    expect((retrieveFromLocalStorage(new RegExp(".*")) as []).length).toStrictEqual(1);
    clearLocalStorage();
    // mixed inputs
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage(["1234", new RegExp("[a-z]*")]);
    expect(retrieveFromLocalStorage(new RegExp(".*"))).toBeNull;
    // no match regEx
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage(new RegExp("cat"));
    expect((retrieveFromLocalStorage(new RegExp(".*")) as []).length).toStrictEqual(2);
    clearLocalStorage();
    // endsWith searchable
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage({ searchTerm: "o", searchType: 0 });
    expect((retrieveFromLocalStorage(new RegExp(".*")) as []).length).toStrictEqual(1);
    clearLocalStorage();
    // contains searchable
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage({ searchTerm: "23", searchType: 1 });
    expect((retrieveFromLocalStorage(new RegExp(".*")) as []).length).toStrictEqual(1);
    clearLocalStorage();
    // beginsWith searchable
    addToLocalStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromLocalStorage({ searchTerm: "fo", searchType: 2 });
    expect((retrieveFromLocalStorage(new RegExp(".*")) as []).length).toStrictEqual(1);
    clearLocalStorage();
  });
  it("should use create and use localOverflowStorage if we've exceeded size limits (QuotaExceedError)", () => {
    expect((window as any).localOverflowStorage).toBeUndefined();
    addToLocalStorage({ key: "test1", value: "1234" });
    addToLocalStorage({ key: "test2", value: overflowString });
    addToLocalStorage({ key: "test3", value: overflowString }); // overflow a second time to make sure both go into overflowStorage
    // make sure the values are in the right objects
    expect(window.localStorage.getItem("test1")).toStrictEqual("1234");
    expect(window.localStorage.getItem("test2")).toBeNull();
    expect(
      (window as any).localOverflowStorage.getItem("test2")
    ).not.toBeNull();
    expect((window as any).localOverflowStorage.getItem("test1")).toBeNull();
    // make sure the counts are right
    expect(window.localStorage.length).toStrictEqual(1);
    expect((window as any).localOverflowStorage.length).toStrictEqual(2);
    // now make sure retrieve will go get them
    expect(retrieveFromLocalStorage("test1")).toStrictEqual("1234");
    expect(retrieveFromLocalStorage("test2")).not.toBeNull();
    removeFromLocalStorage("test3");
    expect(retrieveFromLocalStorage("test3")).toBeNull();
    clearLocalStorage();
    // finally, make sure it nukes the overflowStorage table
    expect((window as any).localOverflowStorage).toBeUndefined();
  });
  it("should do searches in localStorage and overflow", () => {
    addToLocalStorage([
      { key: "test1", value: "foo" },
      { key: "test2", value: "bar" },
      { key: "testB", value: overflowString },
      { key: "test3", value: "foo" },
      { key: "test4", value: "bar" }
    ]);
    expect((retrieveFromLocalStorage(["test1", "test3"]) as []).length).toStrictEqual(
      2
    );
    expect(retrieveFromLocalStorage("testB")).not.toBeNull();
    expect(
      (retrieveFromLocalStorage(new RegExp("[a-z]*?[0-9]")) as []).length
    ).toStrictEqual(4);
    clearLocalStorage();
  });
  it("should use create a global localStorage var if it's unavailable", () => {
    // running this one last since this can't easliy be mocked or restored
    delete (window as any).localStorage;
    expect(window.localStorage).toBeUndefined();
    addToLocalStorage({ key: "cat", value: "dog" });
    expect((window as any).localStorage).not.toBeUndefined();
    expect((window as any).localStorage).not.toBeNull();
    expect(window.localStorage.getItem("cat")).toStrictEqual("dog");
    expect(retrieveFromLocalStorage("cat")).toStrictEqual("dog");
    clearLocalStorage();
  });
});

describe("when using sessionStorage", () => {
  it("should use if it's available", () => {
    addToSessionStorage({ key: "test", value: "1234" });
    expect(window.sessionStorage.getItem("test")).toStrictEqual("1234");
    window.sessionStorage.clear();
  });
  it("should be able to add, retrieve, remove, and clear", () => {
    // add
    addToSessionStorage({ key: "foo", value: "1234" });
    addToSessionStorage({ key: "1234", value: "bar" });
    expect(window.sessionStorage.getItem("foo")).toStrictEqual("1234");
    // retrieve
    expect(retrieveFromSessionStorage("foo")).toStrictEqual("1234");
    expect(window.sessionStorage.getItem("foo")).toStrictEqual("1234");
    // remove
    removeFromSessionStorage("foo");
    expect(retrieveFromLocalStorage("foo")).toBeNull();
    expect(window.sessionStorage.getItem("foo")).toBeNull();
    expect(retrieveFromSessionStorage("1234")).toStrictEqual("bar");
    expect(window.sessionStorage.getItem("1234")).toStrictEqual("bar");
    // clear
    clearSessionStorage();
    expect(retrieveFromSessionStorage("1234")).toBeNull();
    expect(window.sessionStorage.getItem("1234")).toBeNull();
  });
  it("should allow retrieval by arrays, regEx, and searchables", () => {
    // add
    addToSessionStorage({ key: "foo", value: "1234" });
    addToSessionStorage({ key: "1234", value: "bar" });
    const a = retrieveFromSessionStorage(["foo", "1234"]);
    expect((a as []).length).toStrictEqual(2);
    const b = retrieveFromSessionStorage(new RegExp(".*"));
    expect((b as []).length).toStrictEqual(2);
    const c = retrieveFromSessionStorage(new RegExp("[a-z]*"));
    expect((c as []).length).toStrictEqual(1);
    const d = retrieveFromSessionStorage(new RegExp("[0-9]*"));
    expect((d as []).length).toStrictEqual(1);
    const e = retrieveFromSessionStorage([
      new RegExp("[0-9]*"),
      new RegExp("[a-z]*")
    ]);
    expect((e as []).length).toStrictEqual(2);
    const f = retrieveFromSessionStorage(["1234", new RegExp("[a-z]*")]);
    expect((f as []).length).toStrictEqual(2);
    const g = retrieveFromSessionStorage(new RegExp("cat"));
    expect(g).toBeNull;
    const h = retrieveFromSessionStorage({ searchTerm: "f", searchType: 2 });
    expect((h as []).length).toStrictEqual(1);
    const i = retrieveFromSessionStorage({ searchTerm: "foo", searchType: 2 });
    expect((i as []).length).toStrictEqual(1);
    const j = retrieveFromSessionStorage({ searchTerm: "d", searchType: 2 });
    expect(j).toBeNull;
    const k = retrieveFromSessionStorage({ searchTerm: "o", searchType: 1 });
    expect((k as []).length).toStrictEqual(1);
    const l = retrieveFromSessionStorage({ searchTerm: "fo", searchType: 1 });
    expect((l as []).length).toStrictEqual(1);
    const m = retrieveFromSessionStorage({ searchTerm: "foo", searchType: 1 });
    expect((m as []).length).toStrictEqual(1);
    const n = retrieveFromSessionStorage({ searchTerm: "a", searchType: 1 });
    expect(n).toBeNull;
    const o = retrieveFromSessionStorage({ searchTerm: "34", searchType: 0 });
    expect((o as []).length).toStrictEqual(1);
    const p = retrieveFromSessionStorage({ searchTerm: "o", searchType: 0 });
    expect((p as []).length).toStrictEqual(1);
    const q = retrieveFromSessionStorage({ searchTerm: "1234", searchType: 0 });
    expect((q as []).length).toStrictEqual(1);
    const r = retrieveFromSessionStorage({ searchTerm: "z", searchType: 0 });
    expect(r).toBeNull;
    // clear
    clearLocalStorage();
  });
  it("should allow removal by arrays and regEx", () => {
    // by keys
    addToSessionStorage({ key: "foo", value: "1234" });
    addToSessionStorage({ key: "1234", value: "bar" });
    removeFromSessionStorage(["foo", "1234"]);
    expect(retrieveFromSessionStorage(["foo", "1234"])).toBeNull;
    // by RegEx
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage(new RegExp(".*"));
    expect(retrieveFromSessionStorage(["foo", "1234"])).toBeNull;
    // by single RegEx match
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage(new RegExp("[a-z]*"));
    expect((retrieveFromSessionStorage(["foo", "1234"])as []).length).toStrictEqual(1);
    clearSessionStorage();
    // by multiple RegEx matches
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" },
      { key: "ABCD", value: "abcd" }
    ]);
    removeFromSessionStorage([new RegExp("[0-9]*"), new RegExp("[a-z]*")]);
    expect((retrieveFromSessionStorage(new RegExp(".*")) as []).length).toStrictEqual(
      1
    );
    clearSessionStorage();
    // mixed inputs
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage(["1234", new RegExp("[a-z]*")]);
    expect(retrieveFromSessionStorage(new RegExp(".*"))).toBeNull;
    // no match regEx
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage(new RegExp("cat"));
    expect((retrieveFromSessionStorage(new RegExp(".*")) as []).length).toStrictEqual(
      2
    );
    clearSessionStorage();
    // endsWith searchable
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage({ searchTerm: "o", searchType: 0 });
    expect((retrieveFromSessionStorage(new RegExp(".*")) as []).length).toStrictEqual(
      1
    );
    clearSessionStorage();
    // contains searchable
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage({ searchTerm: "23", searchType: 1 });
    expect((retrieveFromSessionStorage(new RegExp(".*")) as []).length).toStrictEqual(
      1
    );
    clearSessionStorage();
    // beginsWith searchable
    addToSessionStorage([
      { key: "foo", value: "1234" },
      { key: "1234", value: "bar" }
    ]);
    removeFromSessionStorage({ searchTerm: "fo", searchType: 2 });
    expect((retrieveFromSessionStorage(new RegExp(".*")) as []).length).toStrictEqual(
      1
    );
    clearSessionStorage();
  });
  it("should create and use sessionOverflowStorage if we've exceeded size limits (QuotaExceedError)", () => {
    expect((window as any).sessionOverflowStorage).toBeUndefined();
    addToSessionStorage([
      { key: "testA", value: "foo" },
      { key: "testB", value: overflowString },
      { key: "testC", value: overflowString }
    ]);
    // slightly different from the first overflow test in that they're being
    // added as an array
    expect((window as any).sessionStorage.getItem("testA")).toStrictEqual(
      "foo"
    );
    expect(
      (window as any).sessionOverflowStorage.getItem("testB")
    ).not.toBeNull();
    expect(
      (window as any).sessionOverflowStorage.getItem("testC")
    ).not.toBeNull();
    // make sure the counts are right
    expect((window as any).sessionStorage.length).toStrictEqual(1);
    expect((window as any).sessionOverflowStorage.length).toStrictEqual(2);
    // now make sure retrieve will go get them
    expect(retrieveFromSessionStorage("testA")).toStrictEqual("foo");
    expect(retrieveFromSessionStorage("testB")).not.toBeNull();
    removeFromSessionStorage("testC");
    expect(retrieveFromSessionStorage("testC")).toBeNull();
    clearSessionStorage();
    // finally, make sure it nukes the overflowStorage table
    expect((window as any).sessionOverflowStorage).toBeUndefined();
  });
  it("should do searches in sessionStorage and overflow", () => {
    addToSessionStorage([
      { key: "test1", value: "foo" },
      { key: "test2", value: "bar" },
      { key: "testB", value: overflowString },
      { key: "test3", value: "foo" },
      { key: "test4", value: "bar" }
    ]);
    expect((retrieveFromSessionStorage(["test1", "test3"]) as []).length).toStrictEqual(
      2
    );
    expect(retrieveFromSessionStorage("testB")).not.toBeNull();
    expect(
      (retrieveFromSessionStorage(new RegExp("[a-z]*?[0-9]")) as []).length
    ).toStrictEqual(4);
    clearSessionStorage();
  });
  it("should create a global sessionStorage var if it's unavailable", () => {
    // running this one last since this can't easliy be mocked or restored
    delete (window as any).sessionStorage;
    expect(window.sessionStorage).toBeUndefined();
    addToSessionStorage({ key: "dog", value: "cat" });
    expect((window as any).sessionStorage).not.toBeUndefined();
    expect((window as any).sessionStorage).not.toBeNull();
    expect(window.sessionStorage.getItem("dog")).toStrictEqual("cat");
    expect(retrieveFromSessionStorage("dog")).toStrictEqual("cat");
    clearSessionStorage();
  });
});

/* tslint:enable:no-string-literal */
