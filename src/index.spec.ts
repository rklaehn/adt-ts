import { Constructor, Fold, FromCases } from './index'

type Shape = FromCases<{
  circle: { r: number }
  rectangle: { w: number, h: number }
}>
const Shape = Constructor<Shape>()

describe('Constructor for traditional adts with string discriminator', () => {
  it('should allow creating instances', () => {
    expect(Shape.circle({ r: 10 })).toEqual({ type: 'circle', r: 10 })
    expect(Shape.rectangle({ w: 10, h: 20 })).toEqual({ type: 'rectangle', w: 10, h: 20 })
  })
})

describe('fold for traditional adts with string discriminator', () => {
  const a: Shape = { type: 'circle', r: 10 }
  const b: Shape = { type: 'rectangle', w: 10, h: 20 }
  const area = Fold.fold<Shape, number>({
    circle: ({ r }) => r * r * Math.PI,
    rectangle: ({ w, h }) => w * h,
  })
  it('should handle all cases', () => {
    expect(area(a)).toBeCloseTo(10 * 10 * Math.PI)
    expect(area(b)).toEqual(10 * 20)
  })
  it('should throw in case of wrong types', () => {
    expect(() => area({ type: 'square', a: 10 } as any)).toThrow()
  })
})

describe('partialFold for traditional adts with string discriminator', () => {
  const a: Shape = { type: 'circle', r: 10 }
  const b: Shape = { type: 'rectangle', w: 10, h: 20 }
  it('should handle all cases', () => {
    const isCircle = Fold.partialFold<Shape, boolean>(
      {
        circle: () => true,
      },
      () => false,
    )
    expect(isCircle(a)).toBeTruthy()
    expect(isCircle(b)).toBeFalsy()
  })
})
