import deriveExpression from "./derivation.js";

var expressionValue = "39 + (7*x) - (4*x)^2 + (2*x)^3";
console.log(deriveExpression(expressionValue));

var deviationResult = deriveExpression(expressionValue),
  Q = 9,
  result = deviationResult.replace(/x/g, Q);

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
