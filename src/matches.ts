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
};


/**
 * @param item The object to test
 * @param query The match expression
 * @returns True the `obj` matches `query`.
 */
export function matches<T extends any>(item: T, query: ExpressionFor<T>) : boolean {
  if (Array.isArray(query))
    return matchesAnyExpression(item, query);

  if (typeof query === 'object' && Object.keys(query).length > 1)
    return matchesAllExpressions(item, query);

  const { operator, rvalue } = parseUnaryExpression(query);

  if (operator in operatorMap)
    return applyOperator(operator, item, rvalue);
  else
    return matches(item[operator], rvalue);  
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
function matchesAllExpressions<T extends any>(item: T, queries: ExpressionFor<T>) : boolean {
  return Object.entries(queries).reduce(
    (result, [operator, expr]) => result && matches(item, { [operator]: expr } as ExpressionFor<any>),
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
  return operatorMap[operator](lvalue, rvalue); 
}