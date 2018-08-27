// match unsupported types and throw error?

const mutablePreset = {
  hasPath(state, key) {
    if (state instanceof Map || state instanceof Set) {
      return state.has(key);
    }
    if (typeof state === 'object' && state !== null) {
      return state.hasOwnProperty(key);
    }
    return false;
  },
  getValueByKey(state, key) {
    if (state instanceof Map) {
      return state.get(key);
    }
    if (state instanceof Set) {
      return [...state][key];
    }
    if (typeof state === 'object' && state !== null) {
      return state[key];
    }
    // TODO: ?
    return state;
  },
  mergeStateAndPayload(state, payload) {
    return payload;
  },
  insertValueToStateByPath(state, key, value) {
    if (state instanceof Map) {
      return state.set(key, value);
    }
    if (state instanceof Set) {
      return state.add(value);
      // Array to
    }
    if (typeof state === 'object' && state !== null) {
      state[key] = value;
      return state;
    }
    // TODO: ?
    return state;
  },
  deleteChild(state, key) {
    if (state instanceof Map) {
      state.delete(key);
      return state;
    }
    if (state instanceof Set) {
      state.delete(key);
      return state;
    }
    if (Array.isArray(state) === true) {
      if (key < 0) return state
      state.splice(key, 1);
      return state;
    }
    delete state[key];
    return state;
  },
};

const immutablePreset = {
  hasPath(state, key) {
    if (state instanceof Map || state instanceof Set) {
      return state.has(key);
    }
    if (typeof state === 'object' && state !== null) {
      return state.hasOwnProperty(key);
    }
    return false;
  },
  getValueByKey(state, key) {
    if (state instanceof Map) {
      return state.get(key);
    }
    if (state instanceof Set) {
      return [...state][key];
    }
    if (typeof state === 'object' && state !== null) {
      return state[key];
    }
    // TODO: ?
    return state;
  },
  mergeStateAndPayload(state, payload) {
    if (state instanceof Map) {
      return new Map([...state, ...payload]);
    }
    if (state instanceof Set) {
      return new Set([...state, ...payload]);
    }
    if (Array.isArray(state)) {
      return payload; // ?
    }
    if (typeof state === 'object' && state !== null) {
      return Object.assign({}, state, payload);
    }
    return payload;
  },
  insertValueToStateByPath(state, key, value) {
    if (state instanceof Map) {
      return new Map(state).set(key, value);
    }
    if (state instanceof Set) {
      const newState = [...state];
      newState[key] = value;
      return new Set(newState);
    }
    if (Array.isArray(state)) {
      const newState = state.slice();
      newState[key] = value;
      return newState;
    }
    if (typeof state === 'object' && state !== null) {
      return Object.assign({}, state, { [key]: value });
    }
    // TODO: ?
    return state;
  },
  deleteChild(state, key) {
    if (state instanceof Map) {
      const newState = new Map(state)
      newState.delete(key);
      return newState;
    }
    if (state instanceof Set) {
      const newState = new Set([...state])
      newState.delete(key);
      return newState;
    }
    if (Array.isArray(state) === true) {
      if (key === 0) return state.slice(1);
      if (key < 0) return state
      return state.slice(0, +key).concat(state.slice(+key + 1));
    }
    const { [key]: deleted, ...newState } = state;
    return newState;
  },
};

/* 
// For use callback for update (`.set`) you can replace `mergeStateAndPayload`
{
  ...mutablePreset,
  mergeStateAndPayload(state, payload) {
    return payload(state);
  }
}

*/

module.exports = { mutablePreset, immutablePreset };
