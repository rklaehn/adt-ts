import { ToDiscriminatedUnion } from './Constructor'
import { fold } from './fold'

type Protocol = {
  foo: { x: string }
  bar: { y: number }
}

type ADT = ToDiscriminatedUnion<Protocol>
describe('fold', () => {
  it('should allow handling the cases of an adt', () => {
    const foo: ADT = { type: 'foo', x: '1234' }
    expect(fold<Protocol>(foo)({ foo: ({ x }) => x.length, bar: ({ y }) => y })).toEqual(4)
    const bar: ADT = { type: 'bar', y: 1234 }
    expect(fold<Protocol>(bar)({ foo: ({ x }) => x.length, bar: ({ y }) => y })).toEqual(1234)
  })
})
