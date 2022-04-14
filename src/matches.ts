import { ExpressionFor } from './types';


const operatorMap = {
  eq: (a: any, b: any) => a === b,
  ne: (a: any, b: any) => a !== b,
  lt: (a: number, b: number) => a < b,
  lte: (a: number, b: number) => a <= b,
  gt: (a: number, b: number) => a > b,
  gte: (a: number, b: number) => a >= b,
  re: (a: string, b: RegExp) => b.test(a),
  length: (a: any[], b: ExpressionFor<number>) => matches(a.length, b),
  includes: (a: any[], b: ExpressionFor<any>) => a.some(item => matches(item, b)),
  any: (a: any[], b: ExpressionFor<any>) => a.some(item => matches(item, b)),
  every: (a: any[], b: ExpressionFor<any>) => a.every(item => matches(item, b)),
  none: (a: any[], b: ExpressionFor<any>) => !a.some(item => matches(item, b)),
  keys: (a: object, b: ExpressionFor<keyof typeof a>) => matches(Object.keys(a), b),
  values: (a: object, b: ExpressionFor<any>) => matches(Object.values(a), b),
  and: (a: any, b: ExpressionFor<any>[]) => matchesAllExpressions(a, b),
  or: (a: any, b: ExpressionFor<any>[]) => matchesAnyExpression(a, b),
  escaped: (a: any, b: ExpressionFor<any>) => matches(a, b, true)
};


/**
 * @param item The object to test
 * @param query The match expression
 * @returns True if `obj` matches `query`.
 */
export function matches<T extends any>(item: T, query: ExpressionFor<T>, escaped: boolean = false) : boolean {
  if (isImplicitOr(query))
    return matchesAnyExpression(item, query);

  if (isImplicitAnd(query))
    return matchesAllExpressions(item, entriesAsObjects(query));

  const { operator, rvalue } = parseUnaryExpression(query);

  if (operator in operatorMap && !escaped)
    return applyOperator(operator, item, rvalue);
  else
    return matches(item[operator as keyof T], rvalue);  
}



/**
 * Utility for creating a filter function from an expression.
 * 
 * @param query 
 * @returns A filter function.
 */
export function withExpression(query: ExpressionFor<any>) : (item: any) => boolean {
  return (item: any) => matches(item, query);
};


/**
 * @internal
 * @param query 
 * @returns True if the query is an array of expressions.
 */
function isImplicitOr(query: ExpressionFor<any>) : query is ExpressionFor<any>[] {
  return Array.isArray(query);
}

/**
 * @internal
 * @param query 
 * @returns True if `query` is an object with multiple keys.
 */
function isImplicitAnd(query: ExpressionFor<any>) : query is object {
  return typeof query === 'object' && query !== null && Object.keys(query).length > 1;
}

/**
 * Example:
 * ```typescript
 * const person = {
 *  name: 'Weird Al',
 *  age: 'timeless'
 * };
 * 
 * entriesAsObjects(person);
 * // [
 * //   { name: 'Weird Al' },
 * //   { age: 'timeless' }
 * // ]
 * ```
 * @param obj 
 * @returns The entries in `obj`, as a list of objects with single key-value pairs.
 */
function entriesAsObjects<T extends object, K extends keyof T>(obj: T) : any[] {
  return Object.entries(obj).map(([key, value]) => ({
    [key as keyof T]: value as T[K]
  }));
}


/**
 * @internal
 * @param item 
 * @param queries An array of expressions.
 * @returns True if `item` is matched by ANY expression in `queries`.
 */
function matchesAnyExpression<T extends any>(item: T, queries: ExpressionFor<T>[]) : boolean {
  return queries.some(expr => matches(item, expr));
}

/**
 * @internal
 * @param item 
 * @param query A map of keys to expressions.
 * @returns True if `item` is matched by ALL expressions in `queries`
 */
function matchesAllExpressions<T extends any>(item: T, queries: ExpressionFor<T>[]) : boolean {
  return queries.reduce(
    (result, expr) => result && matches(item, expr),
    true as boolean
  );
}

/**
 * @internal
 * @param expression An expression object containing a single key and value.
 * @returns An object with `operator` and `rvalue` keys.
 */
function parseUnaryExpression(expression: ExpressionFor<any>) {
  if (typeof expression === 'object' && expression !== null)
    return {
      operator: Object.keys(expression)[0],
      rvalue: expression[Object.keys(expression)[0]]
    };
  else
    return {
      operator: 'eq',
      rvalue: expression
    };
}

/**
 * @internal
 * @param operator A key of `operatorMap`
 * @param lvalue 
 * @param rvalue 
 * @returns The result of calling the specified operator with `lvalue` and `rvalue`.
 */
function applyOperator(operator: string, lvalue: any, rvalue: any) : boolean {
  // @ts-ignore
  return operatorMap[operator](lvalue, rvalue); 
}