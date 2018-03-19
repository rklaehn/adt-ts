import { Constructor, ToDiscriminatedUnion } from './Constructor'

type Protocol = {
  foo: { x: string }
  bar: { y: number }
}

type ADT = ToDiscriminatedUnion<Protocol>

const Protocol = Constructor<Protocol>()

describe('Constructor', () => {
  it('should provide constructor methods for all cases', () => {
    const foo: ADT = Protocol.foo({ x: 'test' })
    expect(foo).toEqual({ type: 'foo', x: 'test' })
    const bar: ADT = Protocol.bar({ y: 1 })
    expect(bar).toEqual({ type: 'bar', y: 1 })
  })
})
