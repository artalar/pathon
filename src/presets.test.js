const { mutablePreset, immutablePreset } = require('./presets');

// TODO: `Set`

describe('[presets]', () => {
  it('includes all api methods', () => {
    expect(typeof mutablePreset.hasPath).toBe('function');
    expect(typeof mutablePreset.getValueByKey).toBe('function');
    expect(typeof mutablePreset.mergeStateAndPayload).toBe('function');
    expect(typeof mutablePreset.insertValueToStateByPath).toBe('function');
  });

  const presets = { mutablePreset, immutablePreset };

  Object.keys({ mutablePreset, immutablePreset }).forEach(presetName => {
    const preset = presets[presetName];
    const uniqueValue = Math.random();

    describe(`[preset] ${presetName} [method] hasPath`, () => {
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

        structureObject[keyTypeString] = uniqueValue;
        structureObject[keyTypeSymbol] = uniqueValue;

        expect(preset.hasPath(structureObject, keyTypeString)).toBe(true);
        expect(preset.hasPath(structureObject, keyTypeSymbol)).toBe(true);

        expect(preset.hasPath(structureObject, keyTypeStringNotPassed)).toBe(false);
        expect(preset.hasPath(structureObject, keyTypeSymbolNotPassed)).toBe(false);
        expect(preset.hasPath(structureObject, keyTypeNull)).toBe(false);
        expect(preset.hasPath(structureObject, keyTypeUndefined)).toBe(false);
      });

      it('[structure] Array', () => {
        const structureArray = [uniqueValue];

        expect(preset.hasPath(structureArray, 0)).toBe(true);

        expect(preset.hasPath(structureArray, keyTypeNull)).toBe(false);
        expect(preset.hasPath(structureArray, keyTypeUndefined)).toBe(false);
      });

      it('[structure] Map', () => {
        const structureMap = new Map();
        structureMap.set(keyTypeNull, uniqueValue);
        structureMap.set(keyTypeUndefined, uniqueValue);
        structureMap.set(keyTypeString, uniqueValue);
        structureMap.set(keyTypeNumber, uniqueValue);
        structureMap.set(keyTypeSymbol, uniqueValue);
        structureMap.set(keyTypeObject, uniqueValue);
        structureMap.set(keyTypeFunction, uniqueValue);

        expect(preset.hasPath(structureMap, keyTypeNull)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeUndefined)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeString)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeNumber)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeSymbol)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeObject)).toBe(true);
        expect(preset.hasPath(structureMap, keyTypeFunction)).toBe(true);

        expect(preset.hasPath(structureMap, keyTypeStringNotPassed)).toBe(false);
        expect(preset.hasPath(structureMap, keyTypeNumberNotPassed)).toBe(false);
        expect(preset.hasPath(structureMap, keyTypeObjectNotPassed)).toBe(false);
        expect(preset.hasPath(structureMap, keyTypeFunctionNotPassed)).toBe(false);
        expect(preset.hasPath(new Map(), keyTypeNull)).toBe(false);
        expect(preset.hasPath(new Map(), keyTypeUndefined)).toBe(false);
      });
    });

    describe(`[preset] ${presetName} [method] getValueByKey`, () => {
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

        structureObject[keyTypeString] = uniqueValue;
        structureObject[keyTypeSymbol] = uniqueValue;

        expect(preset.getValueByKey(structureObject, keyTypeString)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureObject, keyTypeSymbol)).toBe(uniqueValue);

        expect(preset.getValueByKey(structureObject, keyTypeStringNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(structureObject, keyTypeSymbolNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(structureObject, keyTypeNull)).toBe(undefined);
        expect(preset.getValueByKey(structureObject, keyTypeUndefined)).toBe(undefined);
      });

      it('[structure] Array', () => {
        const structureArray = [uniqueValue];

        expect(preset.getValueByKey(structureArray, 0)).toBe(uniqueValue);

        expect(preset.getValueByKey(structureArray, 1)).toBe(undefined);
        expect(preset.getValueByKey(structureArray, keyTypeUndefined)).toBe(undefined);
      });

      it('[structure] Map', () => {
        const structureMap = new Map();
        structureMap.set(keyTypeNull, uniqueValue);
        structureMap.set(keyTypeUndefined, uniqueValue);
        structureMap.set(keyTypeString, uniqueValue);
        structureMap.set(keyTypeNumber, uniqueValue);
        structureMap.set(keyTypeSymbol, uniqueValue);
        structureMap.set(keyTypeObject, uniqueValue);
        structureMap.set(keyTypeFunction, uniqueValue);

        expect(preset.getValueByKey(structureMap, keyTypeNull)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeUndefined)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeString)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeNumber)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeSymbol)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeObject)).toBe(uniqueValue);
        expect(preset.getValueByKey(structureMap, keyTypeFunction)).toBe(uniqueValue);

        expect(preset.getValueByKey(structureMap, keyTypeStringNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(structureMap, keyTypeNumberNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(structureMap, keyTypeObjectNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(structureMap, keyTypeFunctionNotPassed)).toBe(undefined);
        expect(preset.getValueByKey(new Map(), keyTypeNull)).toBe(undefined);
        expect(preset.getValueByKey(new Map(), keyTypeUndefined)).toBe(undefined);
      });
    });
  });

  describe(`[preset] immutablePreset [method] mergeStateAndPayload`, () => {
    it('[structure] Object', () => {
      const obj1 = {};

      expect(immutablePreset.mergeStateAndPayload({}, {})).toEqual({});
      expect(immutablePreset.mergeStateAndPayload({ foo: 'bar' }, {})).toEqual({ foo: 'bar' });
      expect(immutablePreset.mergeStateAndPayload({}, { foo: 'bar' })).toEqual({ foo: 'bar' });
      expect(immutablePreset.mergeStateAndPayload(obj1, {}) !== obj1).toBe(true);
      expect(immutablePreset.mergeStateAndPayload({}, obj1) !== obj1).toBe(true);
    });

    it('[structure] Array', () => {
      const arr1 = [];

      expect(immutablePreset.mergeStateAndPayload([], [])).toEqual([]);
      expect(immutablePreset.mergeStateAndPayload([1], [])).toEqual([]);
      expect(immutablePreset.mergeStateAndPayload([], [1])).toEqual([1]);
      expect(immutablePreset.mergeStateAndPayload(arr1, []) !== arr1).toBe(true);
    });

    it('[structure] Map', () => {
      const map1 = new Map([[1,2]]);

      expect(immutablePreset.mergeStateAndPayload(new Map([[1,2]]), new Map())).toEqual(new Map([[1,2]]));
      expect(immutablePreset.mergeStateAndPayload(new Map(), new Map([[1,2]]))).toEqual(new Map([[1,2]]));
      expect(immutablePreset.mergeStateAndPayload(map1, new Map()) !== map1).toBe(true);
      expect(immutablePreset.mergeStateAndPayload(new Map(), map1) !== map1).toBe(true);
    });
  });

  describe(`[preset] mutablePreset [method] mergeStateAndPayload`, () => {
    it('[structure] Object', () => {
      const obj1 = {};
      const obj2 = {};

      expect(mutablePreset.mergeStateAndPayload(obj1, obj2)).toBe(obj2);
      expect(mutablePreset.mergeStateAndPayload(obj2, obj1)).toBe(obj1);
    });

    it('[structure] Array', () => {
      const arr1 = {};
      const arr2 = {};

      expect(mutablePreset.mergeStateAndPayload(arr1, arr2)).toBe(arr2);
      expect(mutablePreset.mergeStateAndPayload(arr2, arr1)).toBe(arr1);
    });

    it('[structure] Map', () => {
      const map1 = {};
      const map2 = {};

      expect(mutablePreset.mergeStateAndPayload(map1, map2)).toBe(map2);
      expect(mutablePreset.mergeStateAndPayload(map2, map1)).toBe(map1);
    });
  });
});
