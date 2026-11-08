// Section 09 — the stats, shown NEXT TO the matrix (never inside it).
//
// Props:  matrix
//
// Work the numbers out with stats(matrix) from matrix.js — during the render, every
// render. Don't store them anywhere. Then render:
//   <section className="stats">
//     <h2>Stats</h2>
//     <dl>  four pairs of <dt> and <dd>:
//       Sum        the sum
//       Average    the average with 2 decimals:  (5).toFixed(2) → "5.00"
//       Max        the biggest number
//       Non-zero   how many cells aren't 0
import { stats } from "./matrix.js";

export default function Stats({ matrix }) {
  throw new Error("TODO");
}
