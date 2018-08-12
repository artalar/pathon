export type Unwatch = () => void
export declare class Path<T> {
  set(value: T): void
  get(): T
  watch(fn: (state: T) => void): Unwatch
  unwatch: Unwatch
  batch(fn: (path: Path<T>) => void): void
  getPath(): string[]
  path<K extends keyof T>(key: K): Path<T[K]>
}
export declare function path<T>(name: string, defaultState: T): Path<T>