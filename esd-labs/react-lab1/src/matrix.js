// Plain functions on the matrix: no React in this file, so the tests can check them
// with one line each. A matrix is an array of rows; each row is an array of numbers.
//
//   [[1, 2, 3],
//    [4, 5, 6],      matrix[1][2] is row 1, column 2 (counting from 0) → 6
//    [7, 8, 9]]

// The numbers the app starts with (section 07). Given.
export const START = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// Section 08 — a NEW matrix with one cell increased by one.
//   incrementAt([[1, 2], [3, 4]], 1, 0)  →  [[1, 2], [4, 4]]
// Never change `matrix` (the tests freeze it, so changing it throws).
// Rows you don't touch must stay the SAME arrays; only the changed row is new.
// Section 12 (stretch): an optional step, 1 by default.
export function incrementAt(matrix, row, col, step = 1) {
  return matrix.map((rowValues, r) =>
    r === row ? rowValues.map((value, c) => (c === col ? value + step : value)) : rowValues
  );
}

// Section 09 — numbers worked out from the matrix, never stored.
//   stats([[1, 0], [3, 4]])  →  { sum: 8, average: 2, max: 4, nonZero: 3 }
// average = sum ÷ the number of cells. An empty matrix, [], gives 0 for all four.
export function stats(matrix) {
  const values = matrix.flat();
  if (values.length === 0) return { sum: 0, average: 0, max: 0, nonZero: 0 };
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    sum,
    average: sum / values.length,
    max: Math.max(...values),
    nonZero: values.filter((value) => value !== 0).length,
  };
}

// Section 12 (stretch) — the same shape, every cell 0.
//   zeros([[1, 2], [3, 4]])  →  [[0, 0], [0, 0]]
export function zeros(matrix) {
  return matrix.map((rowValues) => rowValues.map(() => 0));
}

// IN-LAB TASK (AI closed) — leave this until the lab. See inlab/decrement.check.jsx.
// A cell already at 0 stays 0, and the SAME matrix comes back (nothing changed).
export function decrementAt(matrix, row, col) {
  if (matrix[row][col] === 0) return matrix;
  return matrix.map((rowValues, r) =>
    r === row ? rowValues.map((value, c) => (c === col ? value - 1 : value)) : rowValues
  );
}
