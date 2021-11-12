import deriveExpression from "./derivation.js";

function MarginalRevenue(expression, Q) {
  var expressionValue = expression;
  console.log(deriveExpression(expressionValue));

  var deviationResult = deriveExpression(expressionValue),
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
}

console.log(MarginalRevenue("49 + 8*x + 6*x^2", 9));
