// Price Elasticity of Demand
function PriceElasticity(
  expression,
  paymentOfGoods1,
  paymentOfGoods2,
  paymentOfGoods3,
  income,
  select_html_Value
) {
  // Obtaining the Expression from first Function

  console.log(expression);
  // select_html_Value means the value of select in the select.
  if (select_html_Value == 1) {
    // Formula
    // PED = | E_d | = | (d_Q / d_p) * p/q|

    expression.replace(/p1/g, paymentOfGoods1);
    expression.replace(/y/g, income);
    console.log(expression);

    expression.replace(/p/g, "x");
    d_Q_div_d_p = deriveExpression(expression);
    conole.log(d_Q_div_d_p);
  }
  if (select_html_Value == 2) {
    expression.replace(/p1/g, paymentOfGoods1);
    expression.replace(/p2/g, paymentOfGoods2);
    expression.replace(/y/g, income);
    console.log(expression);
  }
  if (select_html_Value == 3) {
    expression.replace(/p1/g, paymentOfGoods1);
    expression.replace(/p2/g, paymentOfGoods2);
    expression.replace(/p3/g, paymentOfGoods3);
    expression.replace(/y/g, income);
    console.log(expression);
  }

  console.log(AddingValue);

  // function valueCheck(dataExpression) {
  // Split using a space character
  let arr = AddingValue.split(" ");

  // Making the Array
  var q_array = [];
  for (let index = 0; index < arr.length; index++) {
    q_array += `${arr[index]} `;
  }

  // Result
  // var q_result = eval(math.evaluate(q_array));
  var q_result = eval(q_array);
  console.log(q_array);
  console.log(q_result);

  var answers = {
    puttingValues: q_array,
    answer: q_result,
  };
  //   return answers;
  // }
  // answers = valueCheck(expression);
  // Providing the answers to variables which needs it.

  console.log("-------------------");
  return answers;
}

var Expressive = "7777 - P1 + 0.75 * P2 - 0.5*p3 + 0.05 * y",
  p1 = "209",
  p2 = "101",
  p3 = "478",
  TheIncome = "18361",
  // PriceElasticity(Expressive, p1, p2, p3, income);
  ExpressionResult = Expressive.toLowerCase();
console.log(PriceElasticity(ExpressionResult, p1, p2, p3, TheIncome));
console.log(7777 - 209 + 0.75 * 101 - 0.5 * 478 + 0.05 * 18361);
console.log(eval(p1) + eval(p2) + eval(p3));
