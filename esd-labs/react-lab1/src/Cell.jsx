// Section 05 — one cell of the matrix.
//
// Props:  row, col   where the cell is, counted from 0
//         value      the number to show
//         onClick    a function to call when the cell is clicked
//
// Render ONE <button className="cell"> that shows the value. Give it an aria-label,
// so a screen reader (and the tests) can tell the cells apart. People count from 1:
//   row 0, col 1, value 5   →   aria-label "Row 1, column 2: 5"
// Clicking it calls onClick. Pass the function — don't call it.
//
// Section 12 (stretch): isMax adds the "max" class, so the biggest number is highlighted.
// In-lab: a right-click calls onDecrement, and stops the browser's own menu.
export default function Cell({ row, col, value, onClick, onDecrement, isMax = false }) {
  return (
    <button
      type="button"
      className={isMax ? "cell max" : "cell"}
      aria-label={`Row ${row + 1}, column ${col + 1}: ${value}`}
      onClick={onClick}
      onContextMenu={(event) => {
        event.preventDefault();
        onDecrement?.();
      }}
    >
      {value}
    </button>
  );
}
