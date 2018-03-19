export type Tagged = { type: string }
/**
 * Remove a case from a type
 */
export type Diff<T, U> = T extends U ? never : T
/**
 * Remove the 'type' field from a type
 */
export type RemoveTag<T extends Tagged> = { [K in Diff<keyof T, 'type'>]: T[K] }
/**
 * Select a case from an ADT based on the type of the 'type' field
 */
export type SelectTag<T, Tag> = T extends { type: Tag } ? T : never
/**
 * Methods to handle each case of an ADT
 */
export type Fold<T extends Tagged, R> = { [P in T['type']]: (x: SelectTag<T, P>) => R }
/**
 * Type for a "constructor" that has a method for each adt case
 */
export type Constructor<T extends Tagged> = {
  [P in T['type']]: (x: RemoveTag<SelectTag<T, P>>) => T
}
/**
 * Create a constructor for a given type
 */
export const Constructor = <T extends Tagged>(): Constructor<T> =>
  new Proxy<Constructor<T>>({} as any, {
    get: (_target, type) => (args: any) => ({ ...args, type }),
  })

/**
 * Apply a partial fold to an adt, with a default method as fallback
 */
export const partialFold: <A extends Tagged, R>(
  f: Partial<Fold<A, R>>,
  d: (value?: A) => R,
) => (value: A) => R = (f, d) => value => {
  const pf = f as any
  const handler = pf[value.type]
  return typeof handler === 'function' ? handler(value) : d(value)
}

/**
 * Apply a fold to an adt
 */
const wrongType = () => {
  throw new Error()
}
export const fold: <A extends Tagged, R>(f: Fold<A, R>) => (value: A) => R = f =>
  partialFold(f, wrongType)

type ADT =
  | {
      readonly type: 'a'
      readonly x: string
    }
  | {
      readonly type: 'b'
      readonly y: number
    }
const ADT = Constructor<ADT>()

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
    expect(ADT.a({ x: '1234' })).toEqual({ type: 'a', x: '1234' })
    expect(ADT.b({ y: 1234 })).toEqual({ type: 'b', y: 1234 })
  })
})

describe('partialFold for traditional adts with string discriminator', () => {
  const a: ADT = { type: 'a', x: '1234' }
  const b: ADT = { type: 'b', y: 1234 }
  it('should handle all cases', () => {
    const f: Partial<Fold<ADT, number>> = {
      a: ({ x }) => x.length,
    }
    expect(partialFold(f, () => -1)(a)).toEqual(4)
    expect(partialFold(f, () => -1)(b)).toEqual(-1)
  })
})
