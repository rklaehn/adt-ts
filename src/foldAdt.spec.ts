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

type Shape =
  | {
      readonly type: 'circle'
      readonly r: number
    }
  | {
      readonly type: 'rectangle'
      readonly w: number
      readonly h: number
    }
const Shape = Constructor<Shape>()

describe('fold for traditional adts with string discriminator', () => {
  const a: Shape = { type: 'circle', r: 10 }
  const b: Shape = { type: 'rectangle', w: 10, h: 20 }
  it('should handle all cases', () => {
    const area: Fold<Shape, number> = {
      circle: ({ r }) => r * r * Math.PI,
      rectangle: ({ w, h }) => w * h,
    }
    expect(fold(area)(a)).toBeCloseTo(10 * 10 * Math.PI)
    expect(fold(area)(b)).toEqual(10 * 20)
  })
})

describe('Constructor for traditional adts with string discriminator', () => {
  it('should allow creating instances', () => {
    expect(Shape.circle({ r: 10 })).toEqual({ type: 'circle', r: 10 })
    expect(Shape.rectangle({ w: 10, h: 20 })).toEqual({ type: 'rectangle', w: 10, h: 20 })
  })
})

describe('partialFold for traditional adts with string discriminator', () => {
  const a: Shape = { type: 'circle', r: 10 }
  const b: Shape = { type: 'rectangle', w: 10, h: 20 }
  it('should handle all cases', () => {
    const isCircle: Partial<Fold<Shape, boolean>> = {
      circle: () => true,
    }
    const pf = partialFold(isCircle, () => false)
    expect(pf(a)).toBeTruthy()
    expect(pf(b)).toBeFalsy()
  })
})
