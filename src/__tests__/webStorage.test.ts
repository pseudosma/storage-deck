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
describe("when using localStorage", () => {
  beforeAll(() => {
    let i: number;
    // the resulting string will be 5314410 chars long, just over 5 MB
    for (i = 0; i < 12; i++) {
      overflowString += overflowString + overflowString;
    }
  });
  it("should use if it's available", () => {
    addToLocalStorage("test", "1234");
    expect(window.localStorage.getItem("test")).toStrictEqual("1234");
    window.localStorage.clear();
  });
  it("should be able to add, retrieve, remove, and clear", () => {
    // add
    addToLocalStorage("test", "1234");
    addToLocalStorage("1234", "test");
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
  it("should use create and use localOverflowStorage if we've exceeded size limits (QuotaExceedError)", () => {
    expect((window as any).localOverflowStorage).toBeUndefined();
    addToLocalStorage("test1", "1234");
    addToLocalStorage("test2", overflowString);
    addToLocalStorage("test3", overflowString); // overflow a second time to make sure both go into overflowStorage
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
  it("should use create a global localStorage var if it's unavailable", () => {
    // running this one last since this can't easliy be mocked or restored
    delete (window as any).localStorage;
    expect(window.localStorage).toBeUndefined();
    addToLocalStorage("cat", "dog");
    expect((window as any).localStorage).not.toBeUndefined();
    expect((window as any).localStorage).not.toBeNull();
    expect(window.localStorage.getItem("cat")).toStrictEqual("dog");
    expect(retrieveFromLocalStorage("cat")).toStrictEqual("dog");
    clearLocalStorage();
  });
});

describe("when using sessionStorage", () => {
  it("should use if it's available", () => {
    addToSessionStorage("test", "1234");
    expect(window.sessionStorage.getItem("test")).toStrictEqual("1234");
    window.sessionStorage.clear();
  });
  it("should be able to add, retrieve, remove, and clear", () => {
    // add
    addToSessionStorage("foo", "1234");
    addToSessionStorage("1234", "bar");
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
  it("should use create and use sessionOverflowStorage if we've exceeded size limits (QuotaExceedError)", () => {
    expect((window as any).sessionOverflowStorage).toBeUndefined();
    addToSessionStorage("testA", "foo");
    addToSessionStorage("testB", overflowString);
    addToSessionStorage("testC", overflowString); // overflow a second time to make sure both go into overflowStorage
    // make sure the values are in the right objects
    expect(window.sessionStorage.getItem("testA")).toStrictEqual("foo");
    expect(window.sessionStorage.getItem("testB")).toBeNull();
    expect(
      (window as any).sessionOverflowStorage.getItem("testB")
    ).not.toBeNull();
    expect((window as any).sessionOverflowStorage.getItem("testA")).toBeNull();
    // make sure the counts are right
    expect(window.sessionStorage.length).toStrictEqual(1);
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
  it("should use create a global sessionStorage var if it's unavailable", () => {
    // running this one last since this can't easliy be mocked or restored
    delete (window as any).sessionStorage;
    expect(window.sessionStorage).toBeUndefined();
    addToSessionStorage("dog", "cat");
    expect((window as any).sessionStorage).not.toBeUndefined();
    expect((window as any).sessionStorage).not.toBeNull();
    expect(window.sessionStorage.getItem("dog")).toStrictEqual("cat");
    expect(retrieveFromSessionStorage("dog")).toStrictEqual("cat");
    clearSessionStorage();
  });
});
/* tslint:enable:no-string-literal */
