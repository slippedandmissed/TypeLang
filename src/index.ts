type Top = { __top: true };
type Bottom = { __bottom: true };

type HeadChar<T> = T extends `${infer Head}${infer _}` ? Head : never;

type TailChars<T> = T extends `${infer _}${infer Tail}` ? Tail : never;

type IsEmpty<T> = T extends `${infer _}${infer __}` ? Bottom : Top;

type ConsumeChars<T, P> = IsEmpty<P> extends Top
  ? T
  : IsEmpty<T> extends Top
  ? never
  : HeadChar<T> extends HeadChar<P>
  ? ConsumeChars<TailChars<T>, TailChars<P>>
  : never;

type StartsWith<T, P> = ConsumeChars<T, P> extends never ? Bottom : Top;

type Token = { __token: string; __value: string };

type ConsumeStringToken<T, Tok extends Token> = StartsWith<
  T,
  Tok["__value"]
> extends Top
  ? [Tok, ConsumeChars<T, Tok["__value"]>]
  : never;

type ConsumeAnyStringToken<T, Toks extends Token[]> = Toks extends [
  infer Head,
  ...infer Tail
]
  ? Head extends Token
    ? Tail extends Token[]
      ? ConsumeStringToken<T, Head> extends never
        ? ConsumeAnyStringToken<T, Tail>
        : ConsumeStringToken<T, Head>
      : never
    : never
  : never;

type BaseDataType = [
  { __token: "String"; __value: "string" },
  { __token: "Number"; __value: "number" }
];

type ReservedWordTokens = [
  ...BaseDataType,
  { __token: "If"; __value: "if" },
  { __token: "Else"; __value: "else" }
];

type ConsumeReservedWordToken<T> = ConsumeAnyStringToken<
  T,
  ReservedWordTokens
>[1] extends `${AllowedIdentifierChars}${infer _}`
  ? never
  : ConsumeAnyStringToken<T, ReservedWordTokens>;

type NonWordTokens = [
  { __token: "OpenParen"; __value: "(" },
  { __token: "CloseParen"; __value: ")" },
  { __token: "OpenBrace"; __value: "{" },
  { __token: "CloseBrace"; __value: "}" },
  { __token: "Comma"; __value: "," },
  { __token: "DoubleEquals"; __value: "==" },
  { __token: "BangEquals"; __value: "!=" },
  { __token: "LessThanEquals"; __value: "<=" },
  { __token: "GreaterThanEquals"; __value: ">=" },
  { __token: "LessThan"; __value: "<" },
  { __token: "GreaterThan"; __value: ">" },
  { __token: "DoubleAmpersand"; __value: "&&" },
  { __token: "DoublePipe"; __value: "||" },
  { __token: "Bang"; __value: "!" },
  { __token: "Pipe"; __value: "|" },
  { __token: "Ampersand"; __value: "&" }
];

type ConsumeNonWordToken<T> = ConsumeAnyStringToken<T, NonWordTokens>;

type ConsumeAndExtractChar<T, P> = T extends ""
  ? ["", ""]
  : HeadChar<T> extends P
  ? [HeadChar<T>, TailChars<T>]
  : never;
type ConsumeAndExtractAllChars<T, P> = ConsumeAndExtractChar<T, P> extends never
  ? ["", T]
  : [
      `${ConsumeAndExtractChar<T, P>[0]}${ConsumeAndExtractAllChars<
        TailChars<T>,
        P
      >[0]}`,
      ConsumeAndExtractAllChars<TailChars<T>, P>[1]
    ];

type AllowedIdentifierChars =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type ConsumeIdentifier<T> = ConsumeAndExtractChar<
  T,
  AllowedIdentifierChars
> extends never
  ? never
  : ConsumeAndExtractAllChars<
      T,
      AllowedIdentifierChars
    >[0] extends ReservedWordTokens[number]["__value"]
  ? never
  : [
      {
        __token: "Identifier";
        __value: ConsumeAndExtractAllChars<T, AllowedIdentifierChars>[0];
      },
      ConsumeAndExtractAllChars<T, AllowedIdentifierChars>[1]
    ];

type Whitespace = " " | "\n" | "\t";

type ConsumeToken<T> = HeadChar<T> extends Whitespace
  ? ConsumeToken<TailChars<T>>
  : ConsumeNonWordToken<T> | ConsumeReservedWordToken<T> | ConsumeIdentifier<T>;

type ConsumeAllTokens<T> = ConsumeToken<T> extends never
  ? never
  : ConsumeToken<T>[1] extends ""
  ? [ConsumeToken<T>[0]]
  : [ConsumeToken<T>[0], ...ConsumeAllTokens<ConsumeToken<T>[1]>];

type TrimStart<T> = T extends ""
  ? ""
  : HeadChar<T> extends Whitespace
  ? TrimStart<TailChars<T>>
  : T;
type TrimEnd<T> = T extends `${infer H}${Whitespace}` ? TrimEnd<H> : T;

type Trim<T> = TrimEnd<TrimStart<T>>;

type Lex<T> = Trim<T> extends "" ? [] : ConsumeAllTokens<Trim<T>>;

type ParseExpression<L> =
  | (L extends [{ __token: BaseDataType[number]["__token"] }]
      ? { __expression: L[0]["__token"] }
      : L extends [{ __token: "Identifier"; __value: infer V }]
      ? { __expression: "Identifier"; __value: V }
      : L extends [
          { __token: "OpenParen" },
          ...infer R,
          { __token: "CloseParen" }
        ]
      ? ParseExpression<R>
      : L extends [
          { __token: "OpenBrace" },
          ...infer R,
          { __token: "CloseBrace" }
        ]
      ? ParseExpression<R>
      : L extends [{ __token: "Bang" }, ...infer R]
      ? ParseExpression<R> extends never
        ? never
        : { __expression: "LogicalNot"; __operand: ParseExpression<R> }
      : never)
  | ParseBinaryExpression<[], L>
  | ParseFunctionCall<L>
  | ParseConditionalExpression<L>;

type ParseBinaryExpression<L extends any[], R> = R extends [
  infer Head,
  ...infer Rhs
]
  ?
      | (ParseExpression<L> extends never
          ? never
          : ParseExpression<Rhs> extends never
          ? never
          : Head extends { __token: "DoubleEquals" }
          ? {
              __expression: "Equals";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "BangEquals" }
          ? {
              __expression: "NotEquals";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "LessThanEquals" }
          ? {
              __expression: "LessThanOrEquals";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "GreaterThanEquals" }
          ? {
              __expression: "GreaterThanOrEquals";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "LessThan" }
          ? {
              __expression: "LessThan";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "GreaterThan" }
          ? {
              __expression: "GreaterThan";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "DoubleAmpersand" }
          ? {
              __expression: "LogicalAnd";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "DoublePipe" }
          ? {
              __expression: "LogicalOr";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "Pipe" }
          ? {
              __expression: "Union";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : Head extends { __token: "Ampersand" }
          ? {
              __expression: "Intersection";
              __lhs: ParseExpression<L>;
              __rhs: ParseExpression<Rhs>;
            }
          : never)
      | ParseBinaryExpression<[...L, Head], Rhs>
  : never;

type ConsumeExpression<L extends any[], R> = ParseExpression<L> extends never
  ? R extends [infer H, ...infer T]
    ? ConsumeExpression<[...L, H], T>
    : never
  : [ParseExpression<L>, R];

type ParseExpressionList<L> = ConsumeExpression<[], L> extends [
  infer E,
  [{ __token: "Comma" }, ...infer R]
]
  ? R["length"] extends 0
    ? never
    : [E, ...ParseExpressionList<R>]
  : ConsumeExpression<[], L> extends [infer E, []]
  ? [E]
  : never;

type ParseFunctionCall<L> = L extends [
  { __token: "Identifier"; __value: infer F },
  { __token: "OpenParen" },
  ...infer P,
  { __token: "CloseParen" }
]
  ? ParseExpressionList<P> extends never
    ? never
    : {
        __expression: "FunctionCall";
        __func: F;
        __args: ParseExpressionList<P>;
      }
  : never;

type ParseExpressionPair<L extends any[], R> =
  | (ParseExpression<L> extends never
      ? never
      : ParseExpression<R> extends never
      ? never
      : [ParseExpression<L>, ParseExpression<R>])
  | (R extends [infer H, ...infer T]
      ? ParseExpressionPair<[...L, H], T>
      : never);

type ParseIfBlock<L> = L extends [{ __token: "If" }, ...infer R]
  ? ParseExpressionPair<[], R> extends never
    ? never
    : {
        __expression: "IfStatement";
        __condition: ParseExpressionPair<[], R>[0];
        __body: ParseExpressionPair<[], R>[1];
        __else: null;
      }
  : never;

type ParseElseIfBlock<L> = L extends [{ __token: "Else" }, ...infer R]
  ? ParseIfBlock<R> extends never
    ? never
    : ParseIfBlock<R>
  : never;

type ParseElseBlock<L> = L extends [{ __token: "Else" }, ...infer R]
  ? ParseExpression<R> extends never
    ? never
    : ParseExpression<R>
  : never;

type AppendElseBlock<T, E> = T extends { __else: null }
  ? { [key in keyof T]: key extends "__else" ? E : T[key] }
  : T extends { __else: infer E2 }
  ? { [key in keyof T]: key extends "__else" ? AppendElseBlock<E2, E> : T[key] }
  : never;

type ParseIfElseIfAndElseBlocks<
  L,
  R extends any[]
> = ParseElseBlock<R> extends never
  ? ParseElseIfBlock<R> extends never
    ? L extends [...infer H, infer T]
      ? ParseIfElseIfAndElseBlocks<H, [T, ...R]>
      : never
    : ParseIfElseIfAndElseBlocks<L, []> | ParseIfBlock<L> extends never
    ? never
    : AppendElseBlock<
        ParseIfElseIfAndElseBlocks<L, []> | ParseIfBlock<L>,
        ParseElseIfBlock<R>
      >
  : ParseIfElseIfAndElseBlocks<L, []> | ParseIfBlock<L> extends never
  ? never
  : AppendElseBlock<
      ParseIfElseIfAndElseBlocks<L, []> | ParseIfBlock<L>,
      ParseElseBlock<R>
    >;

type ParseConditionalExpression<L> = ParseIfElseIfAndElseBlocks<L, []>;

type ParseArgumentName<L> = L extends [
  { __token: "Identifier"; __value: infer V }
]
  ? V
  : never;

type ConsumeArgumentName<
  L extends any[],
  R
> = ParseArgumentName<L> extends never
  ? R extends [infer H, ...infer T]
    ? ConsumeArgumentName<[...L, H], T>
    : never
  : [ParseArgumentName<L>, R];

type ParseArgumentNameList<L> = L extends [infer _, ...infer __]
  ? ConsumeArgumentName<[], L> extends [
      infer E,
      [{ __token: "Comma" }, ...infer R]
    ]
    ? R["length"] extends 0
      ? never
      : [E, ...ParseArgumentNameList<R>]
    : ConsumeArgumentName<[], L> extends [infer E, []]
    ? [E]
    : never
  : [];

type ParseFunctionDeclarationStub<L> = L extends [
  {
    __token: "Identifier";
    __value: infer F;
  },
  {
    __token: "OpenParen";
  },
  ...infer R,
  {
    __token: "CloseParen";
  }
]
  ? ParseArgumentNameList<R> extends never
    ? never
    : { __name: F; __argumentNames: ParseArgumentNameList<R>; __body: null }
  : never;

type ParseFunctionDeclaration<
  L extends any[],
  R
> = ParseFunctionDeclarationStub<L> extends never
  ? R extends [infer H, ...infer T]
    ? ParseFunctionDeclaration<[...L, H], T>
    : never
  : ParseExpression<R> extends never
  ? never
  : {
      [key in keyof ParseFunctionDeclarationStub<L>]: key extends "__body"
        ? ParseExpression<R>
        : ParseFunctionDeclarationStub<L>[key];
    };

type FindFunctionDeclaration<L, R extends any[], N> = ParseFunctionDeclaration<
  [],
  L
> extends never
  ? L extends [...infer H, infer T]
    ? FindFunctionDeclaration<H, [T, ...R], N>
    : never
  : ParseFunctionDeclaration<[], L>["__name"] extends N
  ? ParseFunctionDeclaration<[], L>
  : FindFunctionDeclaration<R, [], N>;

type LessThanOrEqual<A, B> = A extends B ? true : false;
type GreaterThanOrEqual<A, B> = B extends A ? true : false;
type Not<A> = A extends true ? false : true;
type And<A, B> = A extends true ? (B extends true ? true : false) : false;
type Or<A, B> = A extends true ? true : B extends true ? true : false;
type Equals<A, B> = And<LessThanOrEqual<A, B>, LessThanOrEqual<B, A>>;

type Evaluate<E, T, S extends Record<any, any>> = E extends {
  __expression: "String";
}
  ? string
  : E extends {
      __expression: "Number";
    }
  ? number
  : E extends {
      __expression: "Identifier";
      __value: infer F;
    }
  ? S[F]
  : E extends {
      __expression: "Equals";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Equals<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>
  : E extends {
      __expression: "NotEquals";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Not<Equals<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>>
  : E extends {
      __expression: "LessThanOrEquals";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? LessThanOrEqual<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>
  : E extends {
      __expression: "GreaterThanOrEquals";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? GreaterThanOrEqual<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>
  : E extends {
      __expression: "LessThan";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Not<GreaterThanOrEqual<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>>
  : E extends {
      __expression: "GreaterThan";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Not<LessThanOrEqual<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>>
  : E extends {
      __expression: "LogicalAnd";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? And<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>
  : E extends {
      __expression: "LogicalOr";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Or<Evaluate<Lhs, T, S>, Evaluate<Rhs, T, S>>
  : E extends {
      __expression: "Union";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Evaluate<Lhs, T, S> | Evaluate<Rhs, T, S>
  : E extends {
      __expression: "Intersection";
      __lhs: infer Lhs;
      __rhs: infer Rhs;
    }
  ? Evaluate<Lhs, T, S> & Evaluate<Rhs, T, S>
  : E extends {
      __expression: "LogicalNot";
      __operand: infer Operand;
    }
  ? Not<Evaluate<Operand, T, S>>
  : E extends {
      __expression: "IfStatement";
      __condition: infer C;
      __body: infer B;
      __else: infer EE;
    }
  ? Evaluate<C, T, S> extends true
    ? Evaluate<B, T, S>
    : Evaluate<EE, T, S>
  : E extends {
      __expression: "FunctionCall";
      __func: infer F;
      __args: infer A;
    }
  ? FindFunctionDeclaration<Lex<T>, [], F> extends never
    ? never
    : Evaluate<
        FindFunctionDeclaration<Lex<T>, [], F>["__body"],
        T,
        ObjZip<
          FindFunctionDeclaration<Lex<T>, [], F>["__argumentNames"],
          EvaluateAll<A, T, S>
        >
      >
  : never;

type EvaluateAll<Es, T, S extends Record<any, any>> = Es extends [
  infer EH,
  ...infer ET
]
  ? [Evaluate<EH, T, S>, ...EvaluateAll<ET, T, S>]
  : [];

type ObjZip<A, B> = A extends [infer AH, ...infer AT]
  ? B extends [infer BH, ...infer BT]
    ? AH extends string
      ? { [key in AH]: BH } & ObjZip<AT, BT>
      : never
    : {}
  : {};

export type Compile<Args, T> = Evaluate<
  FindFunctionDeclaration<Lex<T>, [], "main">["__body"],
  T,
  ObjZip<FindFunctionDeclaration<Lex<T>, [], "main">["__argumentNames"], Args>
>;
