// Section 07 — `this`

// A class that keeps its own list. It works when you call list.add(4).
// It breaks when add() is passed around as a callback:
//     [4, 10, 18].forEach(list.add)
// because the method loses `this`. Fix it so add works even when detached.
// Two accepted fixes: bind in the constructor, or make add an arrow-function
// class field. Pick one and be able to explain why it works.
//
// Fix used: an arrow-function class field. Arrow functions don't get their own
// `this`; they capture the `this` of the place they were created, which for a
// class field is the instance being constructed. So add stays tied to this list
// even when it is passed around on its own.
export class PlannerList {
  constructor(owner) {
    this.owner = owner;
    this.ids = [];
  }

  add = (id) => {
    this.ids.push(id);
  };

  describe() {
    return `${this.owner} has ${this.ids.length} course(s) planned`;
  }
}
