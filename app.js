import deriveExpression from "./derivation.js";

console.log(deriveExpression("(x*2)+(x^2)"));

const deviationResult = deriveExpression("(x*2)+(x^2)");
const Q = 12;
const result = deviationResult.replace(/x/g, Q);

// Split using a space character
let arr = result.split(" ");

// The array
console.log(arr);
console.log(arr[0] + arr[1] + arr[2] + arr[3] + arr[4]);
// console.log(result);
// console.log(result);

var newReslt = arr.map(function (x) {
  if (!NaN) {
    return parseInt(x, 10);
  } else return x;
});
console.log(newReslt);
console.log(
  newReslt[0] + newReslt[1] + newReslt[2] + newReslt[3] + newReslt[4]
);
