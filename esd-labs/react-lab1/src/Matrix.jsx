// Section 06 — the grid: a Matrix made of Cells.
//
// Props:  matrix        an array of rows, each an array of numbers (any size — don't assume 3)
//         onIncrement   a function: onIncrement(row, col)   (you need it in section 08)
//
// Render:
//   <table className="matrix">
//     <tbody>
//       one <tr> per row
//         one <td> per value, with a <Cell> inside it
//
// Lists need a key on the element you return from map — section 06 says which.
// Section 08: each Cell's onClick calls onIncrement with THAT cell's row and column.
import Cell from "./Cell.jsx";

// In-lab: onDecrement(row, col) for a right-click; each row also ends with its total (stretch).
export default function Matrix({ matrix, onIncrement, onDecrement }) {
  // Section 12 (stretch): the biggest number, worked out during render (0 for an empty matrix).
  const max = matrix.length > 0 ? Math.max(...matrix.flat()) : 0;

  return (
    <table className="matrix">
      <tbody>
        {matrix.map((rowValues, r) => (
          // The grid never reorders, adds or removes rows, so the index is a stable key.
          <tr key={r}>
            {rowValues.map((value, c) => (
              <td key={c}>
                <Cell
                  row={r}
                  col={c}
                  value={value}
                  onClick={() => onIncrement(r, c)}
                  onDecrement={() => onDecrement?.(r, c)}
                  isMax={max > 0 && value === max}
                />
              </td>
            ))}
            <td className="total" aria-label={`Row ${r + 1} total`}>
              {rowValues.reduce((sum, value) => sum + value, 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
