import { ToDiscriminatedUnion } from './Constructor'
export type Fold<T, U> = { readonly [P in keyof T]: (value: T[P]) => U }
export const fold: <P>(value: ToDiscriminatedUnion<P>) => <R>(f: Fold<P, R>) => R = value => f =>
  f[value.type](value)
