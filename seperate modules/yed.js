// Price Elasticity of Demand

// Variable Replacer
function variableReplacer(expression, valueToChange, value1, value2) {
  var result;

  if (value2) {
    // First Value will be your new value, second is the value currently
    result = expression.split(valueToChange).join(value1);
    result = expression.split(valueToChange).join(value2);
    return result;
  } else {
    result = expression.split(valueToChange).join(value1);
    return result;
  }
}
// Expression Spliter
function expressionSpliter(expression) {
  // Split using a space character
  let arr = expression.split(" ");

  // Making the Array
  var array = [];
  for (let index = 0; index < arr.length; index++) {
    array += `${arr[index]} `;
  }
  return array;
}

// Q Finder
function findQ(expression) {
  var q_array = expressionSpliter(expression);
  // var q_result = eval(math.evaluate(q_array));
  var q_result = eval(q_array);
  console.log(q_array);
  console.log(q_result);

  var answers = {
    puttingValues: q_array,
    answer: q_result,
  };
  return answers;
}

function checkPED(value) {
  var comment, is_Q, data;
  if (value < 1) {
    comment = `Since the value is less than 1, (${value} < 1), demand is inelastic.`;
    is_Q = `Q is a necessary good`;
    data = {
      comment: comment,
      is_Q: is_Q,
    };
    return data;
  }
  if (value > 1) {
    comment = `Since the value is greater than 1, (${value} > 1), demand is elastic.`;
    is_Q = `Q is a demanding good`;
    data = {
      comment: comment,
      is_Q: is_Q,
    };
    return data;
  } else {
    comment = `Since the value is equal to 1, (${value} == 1), demand is unitary`;
    is_Q = `Demand for Q does not change in response to price.`;
    data = {
      comment: comment,
      is_Q: is_Q,
    };
    return data;
  }
}
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
  var originalExpression, y_replaced_expression, d_Q_div_d_p, answers; // Creating variables.

  // select_html_Value means the value of select in the select.
  // If Value is 1
  if (select_html_Value == 1) {
    // Formula
    // PED = | E_d | = | (d_Q / d_p) * p/q|

    // For Deviation
    originalExpression = expression;
    y_replaced_expression = variableReplacer(expression, "y", income);

    // For Q
    /p1/.test(expression)
      ? (expression = variableReplacer(expression, "p1", paymentOfGoods1))
      : (expression = variableReplacer(expression, "p", paymentOfGoods1));
    expression = variableReplacer(expression, "y", income);
    console.log(expression);

    // Getting Q
    var qValue = findQ(expression); // Answer of Q
    console.log(qValue);
    console.log("####### Q End #######");
    console.log("");

    // d_Q_div_d_p
    var expression_derivation = variableReplacer(
      y_replaced_expression,
      "p",
      "x"
    );
    console.log("####### d_Q_div_d_p #######");

    console.log(
      "Since value of Price changes, it won't make a change on Y because it will be the exact amount of sum of Price."
    );
    // Adding Value of Y
    console.log(y_replaced_expression);

    // Taking Deviation
    d_Q_div_d_p = deriveExpression(expression_derivation);
    console.log(d_Q_div_d_p);

    // Putting answers in one bracket
    var d_Q_div_d_p_answer = {
      puttingValues: y_replaced_expression,
      answer: parseFloat(d_Q_div_d_p),
    };

    // Find PED
    console.log("");
    console.log("####### PED #######");
    var PED_formula = "(d*q / d * p) * p/q";
    console.log(PED_formula);
    var PED_answer =
        d_Q_div_d_p_answer.answer * (paymentOfGoods1 / qValue.answer),
      PED_answer = Math.abs(PED_answer).toPrecision(3);
    console.log(PED_answer);

    var PED_commentary = checkPED(PED_answer);
    console.log(PED_commentary);
  }
  // If Value is 2
  if (select_html_Value == 2) {
    expression.replace(/p1/g, paymentOfGoods1);
    expression.replace(/p2/g, paymentOfGoods2);
    expression.replace(/y/g, income);
    console.log(expression);
  }
  // If Value is 3
  if (select_html_Value == 3) {
    expression.replace(/p1/g, paymentOfGoods1);
    expression.replace(/p2/g, paymentOfGoods2);
    expression.replace(/p3/g, paymentOfGoods3);
    expression.replace(/y/g, income);
    console.log(expression);
  }

  console.log("-------------------");
  return (answers = [
    {
      // Q Values
      name: "Q Value",
      q_PuttingValues: qValue.puttingValues,
      qValue: qValue.answer,
    },
    {
      // d_Q_div_d_p
      name: "Deviation",
      deviation_PuttingValues: d_Q_div_d_p_answer.puttingValues,
      deviationAnswer: d_Q_div_d_p_answer.answer,
    },
    {
      // PED
      name: "PED",
      ped_PuttingValues: PED_formula,
      ped_answer: PED_answer,
      PED_commentary: PED_commentary,
    },
  ]);
}

var Expressive = "700-2*p+0.02*y",
  p = "25" || 0,
  p1 = p,
  p2 = "101" || 0,
  p3 = "478" || 0,
  income = "5000",
  // PriceElasticity(Expressive, p1, p2, p3, income);
  expression = Expressive.toLowerCase();
// console.log(PriceElasticity(expression, p1, p2, p3, income, 1));
console.log(PriceElasticity(expression, p1, p2, p3, income, 1));
