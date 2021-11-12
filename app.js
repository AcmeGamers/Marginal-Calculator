import deriveExpression from "./derivation.js";

console.log(deriveExpression("(x*2)+(x^2)"));

const deviationResult = deriveExpression("(x*2)+(x^2)");
const Q = 12;
const result = deviationResult.replace(/x/g, Q);
console.log(result);
console.log(result);
