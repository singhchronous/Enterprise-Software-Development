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
export function incrementAt(matrix, row, col) {
  throw new Error("TODO");
}

// Section 09 — numbers worked out from the matrix, never stored.
//   stats([[1, 0], [3, 4]])  →  { sum: 8, average: 2, max: 4, nonZero: 3 }
// average = sum ÷ the number of cells. An empty matrix, [], gives 0 for all four.
export function stats(matrix) {
  throw new Error("TODO");
}

// Section 12 (stretch) — the same shape, every cell 0.
//   zeros([[1, 2], [3, 4]])  →  [[0, 0], [0, 0]]
export function zeros(matrix) {
  throw new Error("TODO");
}

// IN-LAB TASK (AI closed) — leave this until the lab. See inlab/decrement.check.jsx.
export function decrementAt(matrix, row, col) {
  throw new Error("TODO");
}
