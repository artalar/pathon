export type Unsubscribe = () => void
export declare class Path<T> {
  set(value: T): void
  get(): T
  watch(fn: () => void): Unsubscribe
  path<K extends keyof T>(key: K): Path<T[K]>
}
export declare function path<T>(name: string, defaultState: T): Path<T>