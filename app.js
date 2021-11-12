import deriveExpression from "./derivation.js";

console.log(deriveExpression("(x*2)+(x^2)"));

const deviationResult = deriveExpression("(x*2)+(x^2)");
const Q = 12;
const result = deviationResult.replace(/x/g, Q);

// Split using a space character
let arr = result.split(" ");

// The array
// console.log(arr);
var value1 = [];
for (let index = 0; index < arr.length; index++) {
  value1 += `${arr[index]} `;
}
console.log(value1);

console.log(eval(value1));
