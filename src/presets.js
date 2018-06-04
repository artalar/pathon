// TODO: tests
// match unsupported types and throw error?

export const mutablePreset = {
  hasPath(state, key) {
    if (state instanceof Map || state instanceof Set) {
      return state.has(key);
    } else if (typeof state === 'object' && state !== null) {
      return state.hasOwnProperty(key);
    } else {
      return false;
    }
  },
  getValueByKey(state, key) {
    if (state instanceof Map) {
      return state.get(key);
    } else if (state instanceof Set) {
      return [...state][key];
    } else if (typeof state === 'object' && state !== null) {
      return state[key];
    } else {
      // FIXME: ?
      return state;
    }
  },
  mergeStateAndPayload(state, payload) {
    return payload;
  },
  insertValueToStateByPath(state, key, value) {
    if (state instanceof Map) {
      return state.set(key, value);
    } else if (state instanceof Set) {
      return state.add(value);
      // Array to
    } else if (typeof state === 'object' && state !== null) {
      state[key] = value;
      return state;
    } else {
      // FIXME: ?
      return value;
    }
  },
};

export const immutablePreset = {
  hasPath(state, key) {
    if (state instanceof Map || state instanceof Set) {
      return state.has(key);
    } else if (typeof state === 'object' && state !== null) {
      return state.hasOwnProperty(key);
    } else {
      return false;
    }
  },
  getValueByKey(state, key) {
    if (state instanceof Map) {
      return state.get(key);
    } else if (state instanceof Set) {
      return [...state][key];
    } else if (typeof state === 'object' && state !== null) {
      return state[key];
    } else {
      // FIXME: ?
      return state;
    }
  },
  mergeStateAndPayload(state, payload) {
    if (state instanceof Map) {
      return new Map([...state, ...payload]);
    } else if (state instanceof Set) {
      return new Set([...state, ...payload]);
    } else if (Array.isArray(state)) {
      return payload; // ?
    } else if (typeof state === 'object' && state !== null) {
      return { ...state, ...payload };
    } else {
      return payload;
    }
  },
  insertValueToStateByPath(state, key, value) {
    if (state instanceof Map) {
      return new Map(state).set(key, value);
    } else if (state instanceof Set) {
      const newState = [...state];
      newState[key] = value;
      return new Set(newState);
    } else if (Array.isArray(state)) {
      const newState = state.slice();
      newState[key] = value;
      return newState;
    } else if (typeof state === 'object' && state !== null) {
      return { ...state, [key]: value };
    } else {
      // FIXME: ?
      return value;
    }
  },
};
