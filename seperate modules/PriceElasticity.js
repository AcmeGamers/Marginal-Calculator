// Price Elasticity of Demand
function PriceElasticity(
  expression,
  paymentOfGoods1,
  paymentOfGoods2,
  paymentOfGoods3,
  income
) {
  // Obtaining the Expression from first Function

  console.log(expression);
  expression.replace(/p1/g, paymentOfGoods1);
  expression.replace(/p2/g, paymentOfGoods2);
  expression.replace(/p3/g, paymentOfGoods3);
  expression.replace(/y/g, income);

  console.log(expression);

  function valueCheck(dataExpression) {
    // Split using a space character
    let arr = dataExpression.split(" ");

    // Making the Array
    var value1 = [];
    for (let index = 0; index < arr.length; index++) {
      value1 += `${arr[index]} `;
    }

    // Result
    // var finalAnswer = eval(math.evaluate(value1));
    var finalAnswer = eval(value1);
    console.log(value1);
    console.log(finalAnswer);

    answers = {
      derivative: deriveExpression(expressionValue),
      puttingValues: value1,
      answer: finalAnswer,
    };
    return answers;
  }
  answers = valueCheck(expression);
  // Providing the answers to variables which needs it.

  console.log("-------------------");
  return answers;
}

var Expressive = "7777 - P1 + 0.75 * P2 - 0.5*p3 + 0.05 * y",
  p1 = "209",
  p2 = "101",
  p3 = "478",
  income = "18361",
  // PriceElasticity(Expressive, p1, p2, p3, income);
  ExpressionResult = Expressive.toLowerCase();
console.log(PriceElasticity(ExpressionResult, p1, p2, p3, income));
