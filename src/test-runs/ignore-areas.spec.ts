import { mergeIgnoreAreas, parseIgnoreAreas } from './ignore-areas';

describe('parseIgnoreAreas', () => {
  it('reads stored areas, and none from a missing or broken value', () => {
    expect(parseIgnoreAreas('[{"x":1,"y":2,"width":3,"height":4}]')).toEqual([{ x: 1, y: 2, width: 3, height: 4 }]);
    expect(parseIgnoreAreas(undefined)).toEqual([]);
    expect(parseIgnoreAreas('not json')).toEqual([]);
    expect(parseIgnoreAreas('{"x":1}')).toEqual([]);
  });
});

describe('mergeIgnoreAreas', () => {
  const a = { x: 1, y: 2, width: 3, height: 4 };
  const b = { x: 5, y: 6, width: 7, height: 8 };

  it('keeps every area once, in order, with the id it was first stored with', () => {
    const merged = mergeIgnoreAreas([{ ...a, id: 'first' }], [{ ...a, id: 'second' }, b]);

    expect(merged.map(({ id, ...area }) => area)).toEqual([a, b]);
    expect(merged[0].id).toBe('first');
  });

  it('gives an area without an id a new, distinct one', () => {
    const [first, second] = mergeIgnoreAreas([a, b]);

    expect(first.id).toEqual(expect.any(String));
    expect(second.id).not.toBe(first.id);
  });
});
