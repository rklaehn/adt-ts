// type AdtToProtocol<T> = { [P in keyof T]: Select<T, P> }

// typescript 2.8. Select case from ADT
/**
 * Remove a case from a type
 */
export type Diff<T, U> = T extends U ? never : T
/**
 * Remove the 'type' field from a type
 */
export type RemoveType<T extends { type: string }> = { [K in Diff<keyof T, 'type'>]: T[K] }
/**
 * Select a case from an ADT based on the type of the 'type' field
 */
export type Select<T, TypeType> = T extends { type: TypeType } ? T : never
/**
 * Methods to handle each case of an ADT
 */
export type Fold<T extends { type: string }, R> = { [P in T['type']]: (x: Select<T, P>) => R }
/**
 * Type for a "constructor" that has a method for each adt case
 */
export type Constructor<T extends { type: string }> = {
  [P in T['type']]: (x: RemoveType<Select<T, P>>) => T
}
/**
 * Create a constructor for a given type
 */
export const Constructor: <T extends { type: string }>() => Constructor<T> = <
  T extends { type: string }
>() =>
  new Proxy<Constructor<T>>({} as any, {
    get: (_target, type) => (args: any) => ({ ...args, type }),
  })
/**
 * Apply a fold to an adt
 */
export const fold: <A extends { type: string }, R>(f: Fold<A, R>) => (value: A) => R = f => value =>
  (f as any)[value.type](value)

type ADT =
  | {
      type: 'a'
      x: string
    }
  | {
      type: 'b'
      y: number
    }

// type Proto = AdtToProtocol<ADT2>
describe('fold for traditional adts with string discriminator', () => {
  const a: ADT = { type: 'a', x: '1234' }
  const b: ADT = { type: 'b', y: 1234 }
  it('should handle all cases', () => {
    const f: Fold<ADT, number> = {
      a: ({ x }) => x.length,
      b: ({ y }) => y,
    }
    expect(fold(f)(a)).toEqual(4)
    expect(fold(f)(b)).toEqual(1234)
  })
})

describe('Constructor for traditional adts with string discriminator', () => {
  it('should allow creating instances', () => {
    const ADT = Constructor<ADT>()
    expect(ADT.a({ x: '1234' })).toEqual({ type: 'a', x: '1234' })
    expect(ADT.b({ y: 1234 })).toEqual({ type: 'b', y: 1234 })
  })
})
