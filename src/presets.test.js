const presets = require('./presets');

const { mutablePreset, immutablePreset } = presets;

describe('[preset] mutablePreset', () => {
  it('includes all api methods', () => {
    expect(typeof mutablePreset.hasPath).toBe('function');
    expect(typeof mutablePreset.getValueByKey).toBe('function');
    expect(typeof mutablePreset.mergeStateAndPayload).toBe('function');
    expect(typeof mutablePreset.insertValueToStateByPath).toBe('function');
  });

  describe('[method] hasPath', () => {
    const keyTypeNull = null;

    const keyTypeUndefined = undefined;

    const keyTypeString = 'keyTypeString';
    const keyTypeStringNotPassed = 'keyTypeStringNotPassed';

    const keyTypeNumber = 1;
    const keyTypeNumberNotPassed = 2;

    const keyTypeSymbol = Symbol('keyTypeSymbol');
    const keyTypeSymbolNotPassed = Symbol('keyTypeSymbolNotPassed');

    const keyTypeObject = {};
    const keyTypeObjectNotPassed = {};

    const keyTypeFunction = () => {};
    const keyTypeFunctionNotPassed = () => {};

    it('[structure] Object', () => {
      const structureObject = {};

      structureObject[keyTypeString] = true;
      structureObject[keyTypeSymbol] = true;

      expect(mutablePreset.hasPath(structureObject, keyTypeString)).toBe(true);
      expect(mutablePreset.hasPath(structureObject, keyTypeSymbol)).toBe(true);

      expect(mutablePreset.hasPath(structureObject, keyTypeStringNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(structureObject, keyTypeSymbolNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(structureObject, keyTypeNull)).toBe(false);
      expect(mutablePreset.hasPath(structureObject, keyTypeUndefined)).toBe(false);
    });

    it('[structure] Map', () => {
      const structureMap = new Map();
      structureMap.set(keyTypeNull, true);
      structureMap.set(keyTypeUndefined, true);
      structureMap.set(keyTypeString, true);
      structureMap.set(keyTypeNumber, true);
      structureMap.set(keyTypeSymbol, true);
      structureMap.set(keyTypeObject, true);
      structureMap.set(keyTypeFunction, true);

      expect(mutablePreset.hasPath(structureMap, keyTypeNull)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeUndefined)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeString)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeNumber)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeSymbol)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeObject)).toBe(true);
      expect(mutablePreset.hasPath(structureMap, keyTypeFunction)).toBe(true);

      expect(mutablePreset.hasPath(structureMap, keyTypeStringNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(structureMap, keyTypeNumberNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(structureMap, keyTypeObjectNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(structureMap, keyTypeFunctionNotPassed)).toBe(false);
      expect(mutablePreset.hasPath(new Map(), keyTypeNull)).toBe(false);
      expect(mutablePreset.hasPath(new Map(), keyTypeUndefined)).toBe(false);
    });
  });
});
