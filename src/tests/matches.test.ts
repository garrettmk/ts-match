import { matches, withExpression } from "../matches";
import { ExpressionFor } from "../types";


describe('testing number operators', () => {
  it.each`
    item    | expression    | expected
    ${5}    | ${5}          | ${true}
    ${5}    | ${4}          | ${false}
    ${5}    | ${{ eq: 5 }}  | ${true}
    ${5}    | ${{ eq: 4 }}  | ${false}
    ${5}    | ${{ ne: 3 }}  | ${true}
    ${5}    | ${{ ne: 5 }}  | ${false}
    ${5}    | ${{ lt: 7 }}  | ${true}
    ${5}    | ${{ lt: 3 }}  | ${false}
    ${5}    | ${{ lte: 5 }} | ${true}
    ${5}    | ${{ lte: 3 }} | ${false}
    ${5}    | ${{ gt: 3 }}  | ${true}
    ${5}    | ${{ gt: 7 }}  | ${false}
    ${5}    | ${{ gte: 5 }} | ${true}
    ${5}    | ${{ gte: 7 }} | ${false}
  `('returns $expected when matching $item with $expression', ({ item, expression, expected }) => {
    expect(matches(item, expression)).toBe(expected);
  });
});


describe('testing string operators', () => {
  it.each`
    item      | expression        | expected
    ${'foo'}  | ${'foo'}          | ${true}
    ${'foo'}  | ${'bar'}          | ${false}
    ${'foo'}  | ${{ eq: 'foo' }}  | ${true}
    ${'foo'}  | ${{ eq: 'bar' }}  | ${false}
    ${'foo'}  | ${{ ne: 'bar' }}  | ${true}
    ${'foo'}  | ${{ ne: 'foo' }}  | ${false}
    ${'foo'}  | ${{ re: /foo/ }}  | ${true}
    ${'foo'}  | ${{ re: /bar/ }}  | ${false}
  `('returns $expected when matching $item with $expression', ({ item, expression, expected }) => {
    expect(matches(item, expression)).toBe(expected);
  });
});


describe('testing boolean operators', () => {
  it.each`
    item      | expression        | expected
    ${true}   | ${true}           | ${true}
    ${true}   | ${false}          | ${false}
    ${false}  | ${false}          | ${true}
    ${false}  | ${true}           | ${false}
    ${true}   | ${{ eq: true }}   | ${true}
    ${true}   | ${{ eq: false }}  | ${false}
    ${true}   | ${{ ne: false }}  | ${true}
    ${true}   | ${{ ne: true }}   | ${false}
  `('returns $expected when matching $item with $expression', ({ item, expression, expected }) => {
    expect(matches(item, expression)).toBe(expected);
  });
});


describe('testing null/undefined operators', () => {
  it.each`
    item          | expression            | expected
    ${undefined}  | ${undefined}          | ${true}
    ${undefined}  | ${false}              | ${false}
    ${undefined}  | ${{ eq: undefined }}  | ${true}
    ${undefined}  | ${{ eq: false }}      | ${false}
    ${undefined}  | ${{ ne: undefined }}  | ${false}
    ${undefined}  | ${{ ne: false }}      | ${true}
    ${null}       | ${null}               | ${true}
    ${null}       | ${false}              | ${false}
    ${null}       | ${{ eq: null }}       | ${true}
    ${null}       | ${{ eq: false }}      | ${false}
    ${null}       | ${{ ne: null }}       | ${false}
    ${null}       | ${{ ne: false }}      | ${true}
  `('returns $expected when matching $item with $expression', ({ item, expression, expected }) => {
    expect(matches(item, expression)).toBe(expected);
  });
});


describe('testing array operators', () => {
  const items = [1, 2, 3, 4, 5];

  it.each`
    expression                  | expected
    ${{ includes: 2 }}          | ${true}
    ${{ includes: 8 }}          | ${false}
    ${{ length: 5 }}            | ${true}
    ${{ length: 0 }}            | ${false}
    ${{ any: 2 }}               | ${true}
    ${{ any: 8 }}               | ${false}
    ${{ every: { lt: 10 } }}    | ${true}
    ${{ every: { lt: 0 } }}     | ${false}
    ${{ none: { gt: 10 } }}     | ${true}
    ${{ none: { gt: 4 } }}      | ${false}
  `(`returns $expected when matching ${items} with $expression`, ({ expression, expected }) => {
    expect(matches(items, expression)).toBe(expected);
  });
});


describe('testing object operators', () => {
  const obj = {
    foo: 'bar',
    baz: 0
  };

  it.each`
    expression                          | expected
    ${{ keys: { includes: 'foo' } }}    | ${true}
    ${{ keys: { includes: 'bar' } }}    | ${false}
    ${{ values: { includes: 'bar' } }}  | ${true}
    ${{ values: { includes: 'foo' } }}  | ${false}
    ${{ foo: 'bar' }}                   | ${true}
    ${{ foo: 'baz' }}                   | ${false}
    ${{ foo: 'bar', baz: 0 }}           | ${true}
    ${{ foo: 'bar', baz: 1 }}           | ${false}
  `(`returns $expected when matching ${obj} with $expression`, ({ expression, expected }) => {
    expect(matches(obj, expression)).toBe(expected);
  });
});


describe('testing logical operators', () => {
  const item = {
    foo: 'bar',
    baz: 0
  };

  it.each`
    expression                                  | expected
    ${{ and: [ { foo: 'bar' }, { baz: 0 } ] }}  | ${true}
    ${{ and: [ { foo: 'bar' }, { baz: 1 } ] }}  | ${false}
    ${{ or: [ { foo: 'bar' }, { baz: 1 } ] }}   | ${true}
    ${{ or: [ { foo: 'baz' }, { baz: 1 } ] }}   | ${false}
    ${{ foo: 'bar', baz: 0 }}                   | ${true}
    ${{ foo: 'bar', baz: 1 }}                   | ${false}
    ${[ { foo: 'bar' }, { baz: 1 } ]}           | ${true}
    ${[ { foo: 'baz' }, { baz: 1 } ]}           | ${false}
  `(`returns $expected when matching ${JSON.stringify(item)} with $expression`, ({ expression, expected }) => {
    expect(matches(item, expression)).toBe(expected);
  });
});


describe('testing operator escaping', () => {
  const item = {
    includes: 'hello'
  };

  it('should correctly match the object when using escaped', () => {
    expect(matches(item, {
      escaped: { includes: { re: /HELLO/i } }
    })).toBe(true);
  });

  it('should throw an error when not using escaped', () => {
    expect(() => matches(item, {
      includes: { re: /HELLO/i }
    })).toThrow();
  });

  it('should match nested fields when using escaped', () => {
    const person = {
      name: 'bob',
      hobbies: {
        includes: 'dancing'
      }
    };

    const expression = {
      hobbies: {
        escaped: {
          includes: 'dancing'
        }
      }
    };

    expect(matches(person, expression)).toBe(true);
  });

  it('should only escape keys one level deep', () => {
    const person = {
      and: {
        things: [{ foo: 'bar' }]
      }
    };

    const expression = {
      escaped: {
        and: {
          things: {
            includes: { foo: 'bar' }
          }
        }
      }
    };

    expect(matches(person, expression)).toBe(true);
  });
});


describe('testing withExpression()', () => {
  const numbers = [0, 1, 2, 3, 4, 5];

  it.each`
    expression                    | expected
    ${5}                          | ${[5]}
    ${{ lt: 3 }}                  | ${[0, 1, 2]}
    ${{ lt: 4, gt: 2 }}           | ${[3]}
    ${[ { lt: 3 }, { gt: 4 } ]}   | ${[0, 1, 2, 5]}
  `(`returns $expected when matching ${JSON.stringify(numbers)} with $expression`, ({ expression, expected }) => {
    expect(numbers.filter(withExpression(expression))).toMatchObject(expected);
  });
});


describe('testing complex cases', () => {
  type Pet = {
    name: string,
    type: string
  }

  type Person = {
    name: string,
    age: number,
    nicknames: string[],
    favorite: {
      color: string,
      number: number
    },
    pets: Pet[]
  };

  const steve: Person = {
    name: 'Steven',
    age: 25,
    nicknames: ['steve'],
    favorite: {
      color: 'blue',
      number: 6
    },
    pets: [{
      name: 'Rambo',
      type: 'dog'
    }]
  };

  const mike: Person = {
    name: 'Michael',
    age: 10,
    nicknames: ['Mikey'],
    favorite: {
      color: 'green',
      number: 7
    },
    pets: [{
      name: 'Scratches',
      type: 'cat'
    }]
  };

  const bob: Person = {
    name: 'Robert',
    age: 50,
    nicknames: [],
    favorite: {
      color: 'black',
      number: 0
    },
    pets: []
  };

  const people = [steve, mike, bob];

  it('should return only people who like green', () => {
    expect(people.filter(withExpression({
      favorite: {
        color: 'green'
      }
    }))).toMatchObject([mike]);
  });

  it('should return only people who like green or black', () => {
    expect(people.filter(withExpression({
      favorite: {
        color: ['green', 'black']
      }
    }))).toMatchObject([mike, bob]);
  });

  it('should return only people with no nicknames', () => {
    expect(people.filter(withExpression({
      nicknames: {
        length: 0
      }
    }))).toMatchObject([bob]);
  });

  it('should return only people who have a cat', () => {
    expect(people.filter(withExpression({
      pets: {
        any: {
          type: 'cat'
        }
      }
    }))).toMatchObject([mike]);
  });
});