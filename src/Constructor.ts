export type WithTag<T> = { readonly [TKey in keyof T]: { type: TKey } & T[TKey] }
export type ToDiscriminatedUnion<P> = WithTag<P>[keyof P]
export type Constructor<T> = { [P in keyof T]: (value: T[P]) => ToDiscriminatedUnion<T> }
export const Constructor: <P>() => Constructor<P> = <P>() =>
  new Proxy<Constructor<P>>({} as any, {
    get: (_target, type) => (args: any) => ({ ...args, type }),
  })
