// Some utility types
export type AnyPrimitive = string | number | boolean | undefined | null;
export type MaybeArray<T> = T | T[];
export type ArrayType<A> = A extends Array<(infer T)> ? T : never;
export type AllKeys<T> = T extends any ? keyof T : never;

export type OperandType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
  ? T[K]
  : undefined;

export type OneKey<K extends string, V = any> = {
  [P in K]: (Record<P, V> &
      Partial<Record<Exclude<K, P>, never>>) extends infer O
      ? { [Q in keyof O]: O[Q] }
      : never
}[K];


/**
 * Any match expression.
 */
export type ExpressionFor<T> =
  T extends AnyPrimitive ? (PrimitiveExpression<T> | LogicalExpression<T>) :
  T extends Array<any> ? (ArrayExpression<T> | LogicalExpression<T>) :
  T extends object ? (ObjectExpression<T> | LogicalExpression<T>) :
  never;

/**
 * A ValueExpression represents a comparison with a primitive of some
 * kind. Different operators are available for different primitive types.
 */
export type PrimitiveExpression<T extends AnyPrimitive> = 
  T extends number ?
    | number
    | { eq: number }
    | { ne: number }
    | { lt: number }
    | { lte: number }
    | { gt: number }
    | { gte: number }
  : T extends string ?
    | string
    | { eq: string }
    | { ne: string }
    | { re: RegExp }
  : T extends boolean ?
    | boolean
    | { eq: boolean }
    | { ne: boolean }
  :
    | T
    | { eq: T }
    | { ne: T }

/**
 * An ArrayExpression lets us apply expressions to an array's contents.
 */
export type ArrayExpression<T extends Array<any>> =
  | { length: ExpressionFor<number> }
  | { includes: ExpressionFor<ArrayType<T>> }
  | { any: ExpressionFor<ArrayType<T>> }
  | { every: ExpressionFor<ArrayType<T>> }
  | { none: ExpressionFor<ArrayType<T>> }

/**
 * An ObjectExpression lets us apply expressions to each field of an object.
 * Multiple fields are treated as an implicit `and` operation.
 */
export type ObjectExpression<T extends object, K extends keyof T = keyof T> =
  | { keys: ExpressionFor<Array<K>> }
  | { values: ExpressionFor<Array<T[K]>> }
  | { [key in K]?: ExpressionFor<T[key]> }

/**
 * A LogicalExpression allows us to combine multiple expressions
 * using logical `and` and `or` operators.
 */
 export type LogicalExpression<T> =
  T extends AnyPrimitive ?
    | { and: ExpressionFor<T>[] }
    | { or: ExpressionFor<T>[] }
    | ExpressionFor<T>[]
  :
    | { and: ExpressionFor<T>[] }
    | { or: ExpressionFor<T>[] }
