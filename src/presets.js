
// TODO: tests
// match unsupported types and throw error?
export const immutablePreset = {
  set: (state, payload) => {
    if (state instanceof Map) {
      return new Map([...state, ...payload]);
    } else if (state instanceof Set) {
      return new Set([...state, ...payload]);
    } else if (Array.isArray(state)) {
      return payload; // ?
    } else {
      return { ...state, ...payload };
    }
  },
  setByPath: path => (state, payload) => {
    if (state instanceof Map) {
      return new Map(state).set(path, payload);
    } else if (state instanceof Set) {
      const newState = [...state];
      newState[path] = payload;
      return new Set(newState);
    } else if (Array.isArray(state)) {
      const newState = state.slice();
      newState[path] = payload;
      return newState;
    } else {
      return { ...state, [path]: payload };
    }
  },
  get: state => state,
  getByPath: path => state => {
    if (state instanceof Map) {
      return state.get(path);
    } else if (state instanceof Set) {
      return [...state][path];
    } else {
      return state[path];
    }
  },
  // optional memorization
  comparator: (prevValue, newValue) => prevValue === newValue
};