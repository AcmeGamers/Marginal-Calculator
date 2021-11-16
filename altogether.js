// The Derivation code is obtained from the following URL
// https://github.com/Michi83/JS-Derivative-Finder/
// Thanking the Author Michi83, without whom this code would have been incomplete
/*
 * The basic idea of this script is to construct a syntax tree from a
 * mathematical expression and to apply differentiation rules to it. Also some
 * algebraic simplifications are applied.
 */

/*
 * The basic building block of syntax trees. The attributes left and right are
 * meant to be other tokens or undefined.
 */
var Token = function (type, value, left, right) {
  this.setAttributes(type, value, left, right);
};

Token.prototype = {
  copyAttributesFrom: function (that) {
    this.setAttributes(that.type, that.value, that.left, that.right);
  },

  deepCopy: function () {
    var left;
    var right;
    if (this.left !== undefined) {
      left = this.left.deepCopy();
    }
    if (this.right !== undefined) {
      right = this.right.deepCopy();
    }
    return new Token(this.type, this.value, left, right);
  },

  setAttributes: function (type, value, left, right) {
    this.type = type;
    this.value = value;
    this.left = left;
    this.right = right;
  },

  /*
   * Determines if this token is the root of a constant subtree (i.e. a
   * subtree that does not contain the identifier x)
   */
  isConstant: function () {
    if (this.type === "identifier" && this.value === "x") {
      return false;
    }
    if (this.left !== undefined && !this.left.isConstant()) {
      return false;
    }
    if (this.right !== undefined && !this.right.isConstant()) {
      return false;
    }
    return true;
  },
};

/*
 * Decomposes an expression string. Usage: Create a new Tokenizer object and
 * repeatedly call its nextToken method, e.g.
 * var tokenizer = new Tokenizer("2 * x")
 * tokenizer.nextToken() --> 2
 * tokenizer.nextToken() --> *
 * tokenizer.nextToken() --> x
 * tokenizer.nextToken() --> end
 */
var Tokenizer = function (expression) {
  this.expression = expression + "\0";
  this.to = 0;
};

Tokenizer.prototype = {
  nextToken: function () {
    this.from = this.to;
    // end
    if (this.expression.charAt(this.to) === "\0") {
      this.to++;
      return new Token("end");
    }
    // identifiers
    else if (
      (this.expression.charAt(this.to) >= "A" &&
        this.expression.charAt(this.to) <= "Z") ||
      this.expression.charAt(this.to) === "_" ||
      (this.expression.charAt(this.to) >= "a" &&
        this.expression.charAt(this.to) <= "z")
    ) {
      this.to++;
      while (
        (this.expression.charAt(this.to) >= "0" &&
          this.expression.charAt(this.to) <= "9") ||
        (this.expression.charAt(this.to) >= "A" &&
          this.expression.charAt(this.to) <= "Z") ||
        this.expression.charAt(this.to) === "_" ||
        (this.expression.charAt(this.to) >= "a" &&
          this.expression.charAt(this.to) <= "z")
      ) {
        this.to++;
      }
      return new Token(
        "identifier",
        this.expression.substring(this.from, this.to)
      );
    }
    // numbers
    else if (
      this.expression.charAt(this.to) >= "0" &&
      this.expression.charAt(this.to) <= "9"
    ) {
      this.to++;
      while (
        this.expression.charAt(this.to) >= "0" &&
        this.expression.charAt(this.to) <= "9"
      ) {
        this.to++;
      }
      if (this.expression.charAt(this.to) === ".") {
        this.to++;
        if (
          this.expression.charAt(this.to) >= "0" &&
          this.expression.charAt(this.to) <= "9"
        ) {
          this.to++;
          while (
            this.expression.charAt(this.to) >= "0" &&
            this.expression.charAt(this.to) <= "9"
          ) {
            this.to++;
          }
        } else {
          throw (
            "unrecognized token " +
            this.expression.substring(this.from, this.to)
          );
        }
      }
      if (
        this.expression.charAt(this.to) === "E" ||
        this.expression.charAt(this.to) === "e"
      ) {
        this.to++;
        if (
          this.expression.charAt(this.to) === "+" ||
          this.expression.charAt(this.to) === "-"
        ) {
          this.to++;
        }
        if (
          this.expression.charAt(this.to) >= "0" &&
          this.expression.charAt(this.to) <= "9"
        ) {
          this.to++;
          while (
            this.expression.charAt(this.to) >= "0" &&
            this.expression.charAt(this.to) <= "9"
          ) {
            this.to++;
          }
        } else {
          throw (
            "unrecognized token " +
            this.expression.substring(this.from, this.to)
          );
        }
      }
      return new Token(
        "number",
        parseFloat(this.expression.substring(this.from, this.to))
      );
    }
    // one char tokens
    else if (
      (this.expression.charAt(this.to) >= "(" &&
        this.expression.charAt(this.to) <= "+") ||
      this.expression.charAt(this.to) === "-" ||
      this.expression.charAt(this.to) === "/" ||
      this.expression.charAt(this.to) === "^"
    ) {
      this.to++;
      return new Token(this.expression.charAt(this.from));
    }
    // whitespace
    else if (
      (this.expression.charAt(this.to) >= "\t" &&
        this.expression.charAt(this.to) <= "\r") ||
      this.expression.charAt(this.to) === " "
    ) {
      this.to++;
      while (
        (this.expression.charAt(this.to) >= "\t" &&
          this.expression.charAt(this.to) <= "\r") ||
        this.expression.charAt(this.to) === " "
      ) {
        this.to++;
      }
      return this.nextToken();
    } else {
      throw "unrecognized token " + this.expression.charAt(this.to);
    }
  },
};

/*
 * Constructs a syntax tree using recursive descent.
 */
var parse = function (expression) {
  var advance = function (expected) {
    if (expected !== undefined && lookahead.type !== expected) {
      throw expected + " expected but " + lookahead.type + " found";
    }
    var token = lookahead;
    lookahead = tokenizer.nextToken();
    return token;
  };

  var sum = function () {
    var token = product();
    while (lookahead.type === "+" || lookahead.type === "-") {
      lookahead.left = token;
      token = advance();
      token.right = product();
    }
    return token;
  };

  var product = function () {
    var token = sign();
    while (lookahead.type === "*" || lookahead.type === "/") {
      lookahead.left = token;
      token = advance();
      token.right = sign();
    }
    return token;
  };

  var sign = function () {
    if (lookahead.type === "+") {
      advance();
      return sign();
    } else if (lookahead.type === "-") {
      var token = advance();
      token.type = "~";
      token.right = sign();
      return token;
    } else {
      return power();
    }
  };

  var power = function () {
    var token = function_();
    if (lookahead.type === "^") {
      lookahead.left = token;
      token = advance();
      token.right = sign();
    }
    return token;
  };

  var function_ = function () {
    var token = factor();
    if (lookahead.type === "(") {
      lookahead.left = token;
      token = advance();
      token.right = sum();
      advance(")");
    }
    return token;
  };

  var factor = function () {
    if (lookahead.type === "(") {
      advance();
      var token = sum();
      advance(")");
      return token;
    } else if (lookahead.type === "identifier" || lookahead.type === "number") {
      return advance();
    } else {
      throw "unexpected " + lookahead.type;
    }
  };

  var tokenizer = new Tokenizer(expression);
  var lookahead;
  advance();
  var token = sum();
  if (lookahead.type !== "end") {
    throw "end expected but " + lookahead.type + " found";
  }
  return token;
};

/*
 * The unparse function needs this to determine when to put parentheses around a
 * subexpression.
 */
var precedence = {
  "*": 1,
  "+": 0,
  "-": 0,
  "/": 1,
  "^": 3,
  identifier: 4,
  number: 4,
  "~": 2,
};

/*
 * Generates an expression string from a syntax tree.
 */
var unparse = function (token) {
  // ()
  if (token.type === "(") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    return left + "(" + right + ")";
  }
  // *
  else if (token.type === "*") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    if (precedence[token.left.type] < 1) {
      left = "(" + left + ")";
    }
    if (precedence[token.right.type] < 1) {
      right = "(" + right + ")";
    }
    return left + " * " + right;
  }
  // +
  else if (token.type === "+") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    return left + " + " + right;
  }
  // -
  else if (token.type === "-") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    if (precedence[token.right.type] < 1) {
      right = "(" + right + ")";
    }
    return left + " - " + right;
  }
  // /
  else if (token.type === "/") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    if (precedence[token.left.type] < 1) {
      left = "(" + left + ")";
    }
    if (precedence[token.right.type] < 2) {
      right = "(" + right + ")";
    }
    return left + " / " + right;
  }
  // ^
  else if (token.type === "^") {
    var left = unparse(token.left);
    var right = unparse(token.right);
    if (precedence[token.left.type] < 4) {
      left = "(" + left + ")";
    }
    if (precedence[token.right.type] < 3) {
      right = "(" + right + ")";
    }
    return left + "^" + right;
  }
  // identifiers
  else if (token.type === "identifier") {
    return token.value;
  }
  // numbers
  else if (token.type === "number") {
    return token.value + "";
  }
  // ~
  else if (token.type === "~") {
    var right = unparse(token.right);
    if (precedence[token.right.type] < 2) {
      right = "(" + right + ")";
    }
    return "-" + right;
  } else {
    throw "unexpected " + token.type;
  }
};

/*
 * Applies some algebraic simplification rules to a syntax tree. Note that this
 * function changes the tree, so if you need the original tree, make a deep copy
 * of it.
 */
var simplify = function (token) {
  if (token === undefined) {
    return;
  }
  simplify(token.left);
  simplify(token.right);
  if (token.type === "(") {
    if (token.left.type !== "identifier") {
      throw "function names must be identifiers";
    }
    if (token.left.value === "sin") {
      var right = unparse(token.right);
      if (right === "0") {
        token.setAttributes("number", 0);
        return;
      } else if (right === "pi / 2") {
        token.setAttributes("number", 1);
        return;
      } else if (right === "pi") {
        token.setAttributes("number", 0);
        return;
      } else if (right === "3 * pi / 2") {
        token.setAttributes("number", -1);
        return;
      }
    } else if (token.left.value === "cos") {
      var right = unparse(token.right);
      if (right === "0") {
        token.setAttributes("number", 1);
        return;
      } else if (right === "pi / 2") {
        token.setAttributes("number", 0);
        return;
      } else if (right === "pi") {
        token.setAttributes("number", -1);
        return;
      } else if (right === "3 * pi / 2") {
        token.setAttributes("number", 0);
        return;
      }
    } else if (token.left.value === "tan") {
      var right = unparse(token.right);
      if (right === "0") {
        token.setAttributes("number", 0);
        return;
      } else if (right === "pi") {
        token.setAttributes("number", 0);
        return;
      }
    } else if (token.left.value === "ln") {
      var right = unparse(token.right);
      if (right === "1") {
        token.setAttributes("number", 0);
        return;
      } else if (right === "e") {
        token.setAttributes("number", 1);
        return;
      }
    }
  } else if (token.type === "*") {
    if (token.left.type === "number" && token.right.type === "number") {
      token.setAttributes("number", token.left.value * token.right.value);
      return;
    }
    if (token.left.type === "number") {
      if (token.left.value === 0) {
        token.setAttributes("number", 0);
        return;
      } else if (token.left.value === 1) {
        token.copyAttributesFrom(token.right);
        return;
      }
    }
    if (token.right.type === "number") {
      if (token.right.value === 0) {
        token.setAttributes("number", 0);
        return;
      } else if (token.right.value === 1) {
        token.copyAttributesFrom(token.left);
        return;
      }
    }
  } else if (token.type === "+") {
    if (token.left.type === "number" && token.right.type === "number") {
      token.setAttributes("number", token.left.value + token.right.value);
      return;
    }
    if (token.left.type === "number") {
      if (token.left.value === 0) {
        token.copyAttributesFrom(token.right);
        return;
      }
    }
    if (token.right.type === "number") {
      if (token.right.value === 0) {
        token.copyAttributesFrom(token.left);
        return;
      }
    }
  } else if (token.type === "-") {
    if (token.left.type === "number" && token.right.type === "number") {
      token.setAttributes("number", token.left.value - token.right.value);
      return;
    }
    if (token.left.type === "number") {
      if (token.left.value === 0) {
        token.setAttributes("~", undefined, undefined, token.right);
        return;
      }
    }
    if (token.right.type === "number") {
      if (token.right.value === 0) {
        token.copyAttributesFrom(token.left);
        return;
      }
    }
  } else if (token.type === "/") {
    if (token.left.type === "number" && token.right.type === "number") {
      var euclid = function (a, b) {
        while (b !== 0) {
          var temp = b;
          b = a % b;
          a = temp;
        }
        return a;
      };
      var gcd = euclid(token.left.value, token.right.value);
      if (Math.sign(gcd) !== Math.sign(token.right.value)) {
        gcd = -gcd;
      }
      if (gcd === token.right.value) {
        token.setAttributes("number", token.left.value / token.right.value);
      } else {
        token.left.setAttributes("number", token.left.value / gcd);
        token.right.setAttributes("number", token.right.value / gcd);
      }
      return;
    }
    if (token.left.type === "number") {
      if (token.left.value === 0) {
        token.setAttributes("number", 0);
        return;
      }
    }
    if (token.right.type === "number") {
      if (token.right.value === 1) {
        token.copyAttributesFrom(token.left);
        return;
      }
    }
  } else if (token.type === "^") {
    if (token.left.type === "number" && token.right.type === "number") {
      token.setAttributes(
        "number",
        Math.pow(token.left.value, token.right.value)
      );
      return;
    }
    if (token.left.type === "number") {
      if (token.left.value === 0) {
        token.setAttributes("number", 0);
        return;
      } else if (token.left.value === 1) {
        token.setAttributes("number", 1);
        return;
      }
    }
    if (token.right.type === "number") {
      if (token.right.value === 0) {
        token.setAttributes("number", 1);
        return;
      } else if (token.right.value === 1) {
        token.copyAttributesFrom(token.left);
        return;
      }
    }
  } else if (token.type === "~") {
    if (token.right.type === "number") {
      token.setAttributes("number", -token.right.value);
      return;
    }
  }
};

/*
 * Derives a syntax tree. Call it on the root token and recursion will take care
 * of the entire tree. Note that this functions constructs a new tree instead of
 * modifying the original tree.
 */
var derive = function (token) {
  // functions
  if (token.type === "(") {
    // left child must be an identifier
    if (token.left.type !== "identifier") {
      throw "function names must be identifiers";
    }
    // sine
    if (token.left.value === "sin") {
      return new Token(
        "*",
        undefined,
        new Token(
          "(",
          undefined,
          new Token("identifier", "cos"),
          token.right.deepCopy()
        ),
        derive(token.right)
      );
    }
    // cosine
    else if (token.left.value === "cos") {
      return new Token(
        "*",
        undefined,
        new Token(
          "~",
          undefined,
          undefined,
          new Token(
            "(",
            undefined,
            new Token("identifier", "sin"),
            token.right.deepCopy()
          )
        ),
        derive(token.right)
      );
    }
    // tangent
    else if (token.left.value === "tan") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        new Token(
          "^",
          undefined,
          new Token(
            "(",
            undefined,
            new Token("identifier", "cos"),
            token.right.deepCopy()
          ),
          new Token("number", 2)
        )
      );
    }
    // asin
    else if (token.left.value === "asin") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        new Token(
          "(",
          undefined,
          new Token("identifier", "sqrt"),
          new Token(
            "-",
            undefined,
            new Token("number", 1),
            new Token(
              "^",
              undefined,
              token.right.deepCopy(),
              new Token("number", 2)
            )
          )
        )
      );
    }
    // acos
    else if (token.left.value === "acos") {
      return new Token(
        "/",
        undefined,
        new Token("~", undefined, undefined, derive(token.right)),
        new Token(
          "(",
          undefined,
          new Token("identifier", "sqrt"),
          new Token(
            "-",
            undefined,
            new Token("number", 1),
            new Token(
              "^",
              undefined,
              token.right.deepCopy(),
              new Token("number", 2)
            )
          )
        )
      );
    }
    // atan
    else if (token.left.value === "atan") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        new Token(
          "+",
          undefined,
          new Token("number", 1),
          new Token(
            "^",
            undefined,
            token.right.deepCopy(),
            new Token("number", 2)
          )
        )
      );
    }
    // sinh
    else if (token.left.value === "sinh") {
      return new Token(
        "*",
        undefined,
        new Token(
          "(",
          undefined,
          new Token("identifier", "cosh"),
          token.right.deepCopy()
        ),
        derive(token.right)
      );
    }
    // cosh
    else if (token.left.value === "cosh") {
      return new Token(
        "*",
        undefined,
        new Token(
          "(",
          undefined,
          new Token("identifier", "sinh"),
          token.right.deepCopy()
        ),
        derive(token.right)
      );
    }
    // tanh
    else if (token.left.value === "tanh") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        new Token(
          "^",
          undefined,
          new Token(
            "(",
            undefined,
            new Token("identifier", "cosh"),
            token.right.deepCopy()
          ),
          new Token("number", 2)
        )
      );
    }
    // square root
    else if (token.left.value === "sqrt") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        new Token("*", undefined, new Token("number", 2), token.deepCopy())
      );
    }
    // natural logarithm
    else if (token.left.value === "ln") {
      return new Token(
        "/",
        undefined,
        derive(token.right),
        token.right.deepCopy()
      );
    } else {
      throw "derivative not implemented";
    }
  }
  // *
  else if (token.type === "*") {
    return new Token(
      "+",
      undefined,
      new Token("*", undefined, derive(token.left), token.right.deepCopy()),
      new Token("*", undefined, token.left.deepCopy(), derive(token.right))
    );
  }
  // +
  else if (token.type === "+") {
    return new Token("+", undefined, derive(token.left), derive(token.right));
  }
  // -
  else if (token.type === "-") {
    return new Token("-", undefined, derive(token.left), derive(token.right));
  }
  // /
  else if (token.type === "/") {
    return new Token(
      "/",
      undefined,
      new Token(
        "-",
        undefined,
        new Token("*", undefined, derive(token.left), token.right.deepCopy()),
        new Token("*", undefined, token.left.deepCopy(), derive(token.right))
      ),
      new Token("^", undefined, token.right.deepCopy(), new Token("number", 2))
    );
  }
  // ^
  else if (token.type === "^") {
    // f(x)^c --> c * f(x)^(c - 1) * f'(x)
    if (token.right.isConstant()) {
      return new Token(
        "*",
        undefined,
        new Token(
          "*",
          undefined,
          token.right.deepCopy(),
          new Token(
            "^",
            undefined,
            token.left.deepCopy(),
            new Token(
              "-",
              undefined,
              token.right.deepCopy(),
              new Token("number", 1)
            )
          )
        ),
        derive(token.left)
      );
    }
    // c^f(x) --> c^f(x) * ln(c) * f'(x)
    else if (token.left.isConstant()) {
      return new Token(
        "*",
        undefined,
        new Token(
          "*",
          undefined,
          token.deepCopy(),
          new Token(
            "(",
            undefined,
            new Token("identifier", "ln"),
            token.left.deepCopy()
          )
        ),
        derive(token.right)
      );
    } else {
      throw "derivative not implemented";
    }
  }
  // constants
  else if (token.type === "identifier") {
    if (token.value === "x") {
      return new Token("number", 1);
    } else {
      return new Token("number", 0);
    }
  } else if (token.type === "number") {
    return new Token("number", 0);
  }
  // unary -
  else if (token.type === "~") {
    return new Token("~", undefined, undefined, derive(token.right));
  } else {
    throw "derivative not implemented";
  }
};

/*
 * Derives an expression string and returns the derivative as a string.
 */
var deriveExpression = function (expression) {
  var token = parse(expression);
  simplify(token);
  token = derive(token);
  // Now we unparse the syntax tree and parse it right back. This seems stupid
  // but sometimes it "cleans" the syntax tree making it easier for simplify
  // to digest.
  token = parse(unparse(token));
  simplify(token);
  return unparse(token);
};

///////////////////////
// Code Written by Acme
///////////////////////

// Marginal Revenue Function
// function MarginalRevenue(expression, Q) {
//   // Obtaining the Expression from first Function
//   var expressionValue = expression,
//     deviationResult = deriveExpression(expressionValue),
//     result = deviationResult.replace(/x/g, Q);
//   console.log(deviationResult);

//   // Split using a space character
//   let arr = result.split(" ");

//   // Making the Array
//   var value1 = [];
//   for (let index = 0; index < arr.length; index++) {
//     value1 += `${arr[index]} `;
//   }

//   // Result
//   var finalAnswer = eval(math.evaluate(value1));
//   console.log(value1);
//   console.log(finalAnswer);

//   // Providing the answers to variables which needs it.
//   answers = {
//     derivative: deriveExpression(expressionValue),
//     puttingValues: value1,
//     answer: finalAnswer,
//   };
//   console.log("-------------------");
//   return answers;
// }
//////////////////////////////
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

//////
// YED
//////
var YED = "(d*q / d * p) * y/q";
