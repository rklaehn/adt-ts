type ADT =
  | {
      type: 'a'
      x: string
    }
  | {
      type: 'b'
      y: number
    }

// type AdtToProtocol<T> = { [P in keyof T]: Select<T, P> }

// typescript 2.8. Select case from ADT
export type Diff<T, U> = T extends U ? never : T
export type RemoveType<T extends { type: string }> = { [K in Diff<keyof T, 'type'>]: T[K] }
export type Select<ADT, TypeType> = ADT extends { type: TypeType } ? ADT : never
export type Fold<T extends { type: string }, R> = { [P in T['type']]: (x: Select<T, P>) => R }
export const fold: <A extends { type: string }>(value: A) => <R>(f: Fold<A, R>) => R = value => f =>
  (f as any)[value.type](value)
export type Constructor<T extends { type: string }> = {
  [P in T['type']]: (x: RemoveType<Select<T, P>>) => T
}
export const Constructor: <T extends { type: string }>() => Constructor<T> = <
  T extends { type: string }
>() =>
  new Proxy<Constructor<T>>({} as any, {
    get: (_target, type) => (args: any) => ({ ...args, type }),
  })

// type Proto = AdtToProtocol<ADT2>
describe('fold for traditional adts with string discriminator', () => {
  const a: ADT = { type: 'a', x: '1234' }
  const b: ADT = { type: 'b', y: 1234 }
  it('should handle all cases', () => {
    expect(
      fold<ADT>(a)({
        a: ({ x }) => x.length,
        b: ({ y }) => y,
      }),
    ).toEqual(4)
    expect(
      fold<ADT>(b)({
        a: ({ x }) => x.length,
        b: ({ y }) => y,
      }),
    ).toEqual(1234)
  })
})

describe('Constructor for traditional adts with string discriminator', () => {
  it('should allow creating instances', () => {
    const ADT = Constructor<ADT>()
    expect(ADT.a({ x: '1234' })).toEqual({ type: 'a', x: '1234' })
    expect(ADT.b({ y: 1234 })).toEqual({ type: 'b', y: 1234 })
  })
})
