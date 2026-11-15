// The whole app: App → Header, Matrix → Cell, Stats.
// App owns the numbers. Matrix and Stats only receive them as props.
import { useEffect, useState } from "react";
import Header from "./Header.jsx";
import Matrix from "./Matrix.jsx";
import Stats from "./Stats.jsx";
import { START, incrementAt, decrementAt, zeros } from "./matrix.js";

export default function App() {
  // Section 07: hold the matrix in state, starting from START, and render
  //             <Matrix matrix={…} /> under the header.
  // Section 08: write increment(row, col): it calls the setter with incrementAt.
  //             Pass it down to Matrix as onIncrement.
  // Section 09: render <Stats matrix={…} /> NEXT TO the matrix, not inside it.
  // Section 11: load /matrix.json once, in a useEffect, and put it in the state.
  const [matrix, setMatrix] = useState(START);
  // Section 12 (stretch): how much one click adds.
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch("/matrix.json")
      .then((res) => res.json())
      .then((data) => setMatrix(data));
  }, []);

  function increment(row, col) {
    setMatrix((prev) => incrementAt(prev, row, col, step));
  }

  // In-lab: a right-click takes one off, never below 0.
  function decrement(row, col) {
    setMatrix((prev) => decrementAt(prev, row, col));
  }

  // Section 12 (stretch): every cell back to 0.
  function reset() {
    setMatrix((prev) => zeros(prev));
  }

  return (
    <main className="app">
      <Header />
      <div className="controls">
        <label>
          Step{" "}
          <input
            type="number"
            min="1"
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
          />
        </label>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="board">
        <Matrix matrix={matrix} onIncrement={increment} onDecrement={decrement} />
        <Stats matrix={matrix} />
      </div>
    </main>
  );
}
