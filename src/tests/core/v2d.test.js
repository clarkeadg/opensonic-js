const { 
  v2d_new,
  v2d_add,
  v2d_subtract,
  v2d_multiply,
  v2d_magnitude,
  v2d_dotproduct,
  v2d_rotate,
  v2d_normalize,
  v2d_lerp
} = require('../../sonic/core/v2d');

test('v2d_new', () => {
  const v2d = v2d_new(1,2);
  expect(v2d.x).toBe(1);
  expect(v2d.y).toBe(2);
});

test('v2d_add', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d_2 = v2d_new(3,4);
  const v2d = v2d_add(v2d_1, v2d_2);
  expect(v2d.x).toBe(4);
  expect(v2d.y).toBe(6);
});

test('v2d_subtract', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d_2 = v2d_new(3,4);
  const v2d = v2d_subtract(v2d_1, v2d_2);
  expect(v2d.x).toBe(-2);
  expect(v2d.y).toBe(-2);
});

test('v2d_multiply', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d = v2d_multiply(v2d_1, 2);
  expect(v2d.x).toBe(2);
  expect(v2d.y).toBe(4);
});

test('v2d_magnitude', () => {
  const v2d_1 = v2d_new(0,2);
  const n = v2d_magnitude(v2d_1);
  expect(n).toBe(2);
});

test('v2d_dotproduct', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d_2 = v2d_new(3,4);
  const n = v2d_dotproduct(v2d_1, v2d_2);
  expect(n).toBe(11);
});

test('v2d_rotate', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d = v2d_rotate(v2d_1, 1.570796);
  expect(v2d.x).toBe(-1.9999996732049967);
  expect(v2d.y).toBe(1.0000006535897397);
});

test('v2d_normalize', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d = v2d_normalize(v2d_1);  
  expect(v2d.x).toBe(0.4472135954999579);
  expect(v2d.y).toBe(0.8944271909999159);
});

test('v2d_normalize 2', () => {
  const v2d_1 = v2d_new(0,0);
  const v2d = v2d_normalize(v2d_1);  
  expect(v2d.x).toBe(0);
  expect(v2d.y).toBe(0);
});

test('v2d_lerp', () => {
  const v2d_1 = v2d_new(1,2);
  const v2d_2 = v2d_new(3,4);
  const v2d = v2d_lerp(v2d_1, v2d_2, 0.5);
  expect(v2d.x).toBe(2);
  expect(v2d.y).toBe(3);
});
