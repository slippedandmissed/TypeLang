# TypeLang

A prood-of-concept programming language written entirely in the TypeScript type system.

## For the love of god, why?

The TypeScript type system is incredibly powerful, but like all Turing-complete metaprogramming paradigms, it can result in messy, ugly, unreadable code.

Suppose you wanted to make a helper type that that returns `string` if the input type is exactly `number`, but `boolean` otherwise. You might write something like this:

```typescript
type Helper<T> = T extends number
  ? number extends T
    ? string
    : boolean
  : boolean;
```

How ugly. Sure, you can make it better by making more helper types?

```typescript
type AreSameType<T, U> = T extends U ? (U extends T ? true : false) : false;
type Helper<T> = AreSameType<T, number> extends true ? string : boolean;
```

Still, there's only so readable you can make it.

## Enter TypeLang

Using TypeLang, the above example could be written as

```typescript
import { Compile } from "typelang";

type Helper<T> = Compile<
  [T],
  `
main(T) {
  if T == number {
    string
  } else {
    boolean
  }
}
  `
>;

type _ = Helper<number>;
//   ^ = string

type _ = Helper<string>;
//   ^ = boolean
```

Ah, much better.

### Syntax

The whole language is whitespace agnostic.

#### Expressions

| Syntax                    | Description                                                                                                                                          | TypeScript Equivalent                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `T`                       | Type variable, probably referencing a function parameter                                                                                             | `T`                                                      |
| `number`                  | Number type                                                                                                                                          | `number`                                                 |
| `string`                  | String type                                                                                                                                          | `string`                                                 |
| `T == U`                  | Type equality check                                                                                                                                  | `T extends U ? U extends T ? true : false : false`       |
| `T != U`                  | Type inequality check                                                                                                                                | `T extends U ? U extends T ? false : true : true`        |
| `T <= U`                  | Subtype check                                                                                                                                        | `T extends U ? true : false`                             |
| `T >= U`                  | Supertype check                                                                                                                                      | `U extends T ? true : false`                             |
| `T < U`                   | Proper subtype check                                                                                                                                 | `T extends U ? U extends T ? false : true : false`       |
| `T > U`                   | Proper supertype check                                                                                                                               | `U extends T ? T extends U ? false : true : false`       |
| `T \| U`                  | Union type                                                                                                                                           | `T \| U`                                                 |
| `T & U`                   | Intersection type                                                                                                                                    | `T & U`                                                  |
| `T \|\| U`                | Logical or                                                                                                                                           | `T extends true ? true : U extends true ? true : false`  |
| `T && U`                  | Logical and                                                                                                                                          | `T extends true ? U extends true ? true : false : false` |
| `!T`                      | Logical not                                                                                                                                          | `T extends true ? false : true`                          |
| `if (T) { U } else { V }` | If-else statement (parentheses and curly braces optional). Also supports `else if` blocks. There needs to be at least one `else` or `else if` block. | `T extends true ? U : V`                                 |
| `T(U,V)`                  | Function call                                                                                                                                        | `T<U,V>`                                                 |

#### Functions

Functions are declared and called as follows

```typescript
foo(T, U, V) {
  // Function body (an expression)
}
```

Curly braces are optional. E.g., this is a valid function declaration:

```typescript
foo(A) A
```

When executing, the entrypoint is the function called `main`.

### Examples

```typescript
type MyType<T> = Compile<
  [T],
  `
main(T) {
  if T >= string {
    number | T
  } else {
    identity(T)
  }
}

identity(T) {
  T
}
`
>;

type _ = MyType<string>;
//   ^ = string | number

type _ = MyType<string | boolean>;
//   ^ = string | number | boolean

type _ = MyType<boolean>;
//   ^ = boolean
```

### Future Work

The main limitation of this project is the TypeScript type recursion depth. If your program is too complex, you'll run into the error `Type instantiation is excessively deep and possibly infinite`. Weirdly enough, I've found the point at which this happens varies depending on whether I reboot the TypeScript server, if I comment and then uncomment the code, and various other factors. I'm not sure what's going on there.

I'd also like to add support for more TypeScript base types (`boolean`, `null`, `undefined`, `object`, `bigint`, `symbol`, `void`, `never`, object types like `{foo: string}`, arrays, tuples, literals, etc.)

I'd like to support code comments as well.

It would also be cool to make a VSCode extension that provides syntax highlighting