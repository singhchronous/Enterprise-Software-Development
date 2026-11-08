// PREDICT, THEN RUN.   node predict/modules/main.js
import { headerClick } from "./header.js";
import { footerClick } from "./footer.js";

headerClick();
headerClick();
console.log("footer sees:", footerClick());
// Prediction: footer sees: 3. A module runs once, so header and footer share the same clicks variable.
// (is `clicks` shared between header and footer, or does each get its own?)
