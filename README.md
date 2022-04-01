# ts-match

`ts-match` is a versatile pattern-matching library, written in TypeScript. You can use it to easily 
filter or validate any kind of value using simple, declarative JSON. `ts-match` is small, fast and dependency-free!

## Prerequisites
  * TODO: minimum JavaScript version
  * TODO: minimum TypeScript version


## Installation
```
npm install ts-match
```

## Usage
Import `matches` and/or `withExpression`, define an expression, and start matching (or filtering):
```typescript
import { matches, withExpression } from 'ts-match';

const peopleWithCats = {
  pets: {
    any: {
      type: 'cat'
    }
  }
};

matches(person, peopleWithCats);                // true or false
people.filter(withExpression(peopleWithCats));  // An array of people with cats
```


### Expressions
 The simplest expression is an object with a single key-value pair, representing an operator
 and some value:
```typescript
{ eq: 5 }
```

In this case, the expression tells `matches` to compare it's first argument with `5` using the `===` operator:
```typescript
matches(5, { eq: 5 });  // true
matches(5, { eq: 3 });  // false
```

Expressions can be combined using the `and` and `or` operators:
```typescript
// Matches numbers less than 10 and greater than 5
{ and: [
  { lt: 10 },
  { gt: 0 }
]}
// Equivalent: combine both operators into a single object
{
  lt: 10,
  gt: 0
}

// Matches numbers less than 10 or greater than 20
{ or: [
  { lt: 10 },
  { gt: 20 }
]}
// Equivalent: put both expressions in an array
[
  { lt: 10 },
  { gt: 20 }
]
```


## Operator Reference
| Key        | r-value                   | Description                  
| ---------- | ------------------------- | ----------------------------
| `eq`       | any                       | Equals
| `ne`       | any                       | Not Equals
| `lt`       | number                    | Less than
| `lte`      | number                    | Less than or equal to
| `gt`       | number                    | Greater than
| `gte`      | number                    | Greater than or equal to
| `re`       | string                    | Test a string with `RegExp.test()`
| `length`   | ExpressionFor<number>     | Match to an object's `length` property
| `includes` | ExpressionFor<any>        | Check an array's contents with `Array.some()`
| `any`      | Expression<any>           | Same as `includes`
| `every`    | Expression<any>           | Check an array's contents with `Array.every()`
| `none`     | Expression<any>           | Opposite of `every`
| `keys`     | ExpressionFor<Array<any>> | Check an object's keys
| `values`   | ExpressionFor<Array<any>> | Check an object's values
| `and`      | ExpressionFor<any>[]      | Match every expression
| `or`       | ExpressionFor<any>[]      | Match any expression

## Examples
```typescript
import { matches, withExpression } from 'ts-match';

const numbers = [0, 1, 2, 3, 4];
const strings = ['foo', 'bar', 'baz'];
const people = [
  {
    name: 'Alice',
    pets: [{
      name: 'Fido',
      type: 'dog'
    }]
  },
  {
    name: 'Bob',
    pets: [{
      name: 'Scratchy',
      type: 'cat'
    }]
  }
];

// Numbers less than 2
numbers.filter(withExpression({ lt: 2 }));              // [0, 1]
// Numbers less than 4 AND greater than 1
numbers.filter(withExpression({ lt: 4, gt: 1 }))        // [2, 3]
// Numbers less than 1 OR greater than 3
numbers.filter(withExpression([ { lt: 1 }, { gt: 3 }])) // [0, 4]

// Strings equal to 'foo'
strings.filter(withExpression('foo'));                  // ['foo']
// Strings matching a regex
strings.filter(withExpression({ re: /ba./i }));         // ['bar', 'baz']

// People with a cat for a pet
people.filter(withExpression({
  pets: {
    any: {
      type: 'cat'
    }
  }
}));                                                    // [{ Bob }]
// People with any pet
people.filter(withExpression({
  pets: {
    length: { gt: 0 }
  }
}));                                                    // [{ Alice }, { Bob }]
```

## Contributing to `ts-match`
<!--- If your README is long or you have some specific process or steps you want contributors to follow, consider creating a separate CONTRIBUTING.md file--->
To contribute to `ts-match`, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).


## Contact

If you want to contact me you can reach me at <garrettmyrick@gmail.com>.

## License
<!--- If you're not sure which open license to use see https://choosealicense.com/--->

This project uses the following license: [MIT](https://github.com/garrettmk/ts-match/blob/main/LICENSE).
