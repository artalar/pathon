const path = require('./pathon').path;
const immutablePreset = require('./presets').immutablePreset;

describe("pathon", () => {
  it("new root path structure", () => {
    const pathRoot = path("root", {}, immutablePreset);
    expect(typeof pathRoot.set).toBe("function");
    expect(typeof pathRoot.get).toBe("function");
    expect(typeof pathRoot.watch).toBe("function");
    expect(typeof pathRoot.unwatch).toBe("function");
  });
  it("new path structure", () => {
    const pathCount = path(
      "root",
      { count: 0 },
      immutablePreset
    ).path("count");
    expect(typeof pathCount.set).toBe("function");
    expect(typeof pathCount.get).toBe("function");
    expect(typeof pathCount.watch).toBe("function");
    expect(typeof pathCount.unwatch).toBe("function");
  });
  it("root path state", () => {
    const initialState = {};
    const pathRoot = path("root", initialState, immutablePreset);
    expect(pathRoot.get()).toBe(initialState);

    let tracking;
    const watcher = newState => (tracking = newState);
    const deepField = {};
    pathRoot.watch(watcher);
    pathRoot.set({ deepField });
    expect(pathRoot.get()).toBe(tracking);
    expect(pathRoot.get().deepField).toBe(deepField);
  });
});
