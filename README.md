# adt-ts
Type-safe algebraic data types and limited pattern matching in typescript 2.8

# What

This library provides some utility functions to work with a very common encoding of algebraic data types in
typescript/javascript. It uses typescript 2.8 features to allow pattern matching with exhaustiveness checking. It also
provides a generator for constructor methods for both convenience and helping type inference.

It uses some advanced features of typescript 2.8, but the ADT type itself remains extremely simple.

# Installation

Use the node package manager of your choice, e.g. `yarn install rklaehn/adt-ts#<tag>` where `tag` can either be a specific release or `master`.

# ADT encoding

The ADT encoding chosen for this library is to use a `type` field as a discriminator. The advantage of this encoding compared
to e.g. using the prototype as a discriminator is that it translates very well into json and json-schema.

```typescript
type Shape =
  | { type: 'circle', r: number }
  | { type: 'rectangle', w: number, h: number }
```

# Shortcut notation

Provides a type transformation that adds the type fields and adds readonly everywhere. This is equivalent to the above ADT encoding:

```typescript
type Shape = FromCases<{
  circle: { r: number }
  rectangle: { w: number, h: number }
}>
```
produces
```typescript
type Shape =
  | { readonly type: 'circle', readonly r: number }
  | { readonly type: 'rectangle', readonly w: number, readonly h: number }
```


# Constructor

Constructor functions are useful for helping type inference. They return the ADT type and thus help typescript infer correct
return values of functions without having to annotate the type

```typescript
const { circle, rectangle } = Constructor<Shape>()
const a = circle({ r: 10 })
const b = rectangle({ w: 10, h: 20 }) 
```

# Fold

Performs an operation on an ADT. Not handling a case or handling a case that is not in the ADT will lead to a compile error.

```typescript
const area = Fold.fold<Shape, number>({
  circle: ({ r }) => r * r * Math.PI,
  rectangle: ({ w, h }) => w * h,
})
console.log(area(b)) // 200
```

# Partial fold

Performs an operation on an ADT. Not all cases need to be handled. Handling a case that is not in the ADT (e.g. due to a typo) will lead to a compile error. Unhandled cases are handled with a default method.

```typescript
const isCircle = Fold.partialFold<Shape, boolean>(
  { circle: () => true },
  () => false
)
isCircle(a) // true
```
