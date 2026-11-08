// PREDICT, THEN RUN.   node predict/this.js
// ES modules run in strict mode, so a plain call gets `this === undefined`.

const planner = {
  owner: "Asha",
  hello() {
    return `hello from ${this?.owner}`;
  },
  arrowHello: () => `arrow sees ${typeof this}`,
};

// ---- 1. Called on the object --------------------------------------------
console.log("1:", planner.hello());
// Prediction: 1: hello from Asha. Called on the object, so this = planner.

// ---- 2. Detached, then called -------------------------------------------
const detached = planner.hello;
console.log("2:", detached());
// Prediction: 2: hello from undefined. Detached plain call in strict mode, this is undefined (?. avoids a crash).

// ---- 3. bind fixes it permanently ---------------------------------------
const bound = planner.hello.bind(planner);
console.log("3:", bound());
// Prediction: 3: hello from Asha. bind locks this to planner.

// ---- 4. call / apply set it for one call --------------------------------
console.log("4:", planner.hello.call({ owner: "Ravi" }));
// Prediction: 4: hello from Ravi. call sets this to the object passed for that one call.

// ---- 5. An arrow function has no `this` of its own ----------------------
console.log("5:", planner.arrowHello());
// Prediction: 5: arrow sees undefined. Arrows take this from the surrounding module scope, which is undefined.

// ---- 6. new creates a fresh object for `this` ---------------------------
function Student(name) {
  this.name = name;
}
const s = new Student("Meera");
console.log("6:", s.name);
// Prediction: 6: Meera. new makes a fresh object and binds this to it.

// ---- 7. The callback trap -----------------------------------------------
const owners = ["x", "y"];
console.log("7:", owners.map(planner.hello));
// Prediction: 7: [ 'hello from undefined', 'hello from undefined' ]. map calls the detached method without a this.
