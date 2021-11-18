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
//////////////////////////////
// Variable Replacer
function variableReplacer(
  expression,
  valueToChange,
  value1,
  valueToChange2,
  value2,
  valueToChange3,
  value3
) {
  var result;

  if (value2) {
    // First Value will be your new value, second is the value currently
    result = expression.split(valueToChange).join(value1);
    result = expression.split(valueToChange2).join(value2);
    return result;
  }
  if (value3) {
    result = expression.split(valueToChange).join(value1);
    result = expression.split(valueToChange2).join(value2);
    result = expression.split(valueToChange3).join(value3);
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
function Q_Checker(expression) {
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
    comment = `Since the value is equal to 1, (${value} = 1), demand is unitary`;
    is_Q = `Demand for Q does not change in response to price.`;
    data = {
      comment: comment,
      is_Q: is_Q,
    };
    return data;
  }
}

function checkYED(value) {
  var comment, elasticity, data;
  if (value < 1) {
    comment = `Since the value is less than 1, (${value} < 1). It is a necessary good.`;
    elasticity = `Such that, Income Elasticity is <b>Low Income Elasticity</b> having <b>necessary goods</b> from Normal Goods.`;
    data = {
      comment: comment,
      elasticity: elasticity,
    };
    return data;
  }
  if (value > 1) {
    comment = `Since the value is greater than 1, (${value} > 1). This is typical of a luxury or superior good.`;
    elasticity = `Such that, Income Elasticity is <b>High Income Elasticity</b> having <b>superior goods</b> from Normal Goods.`;
    data = {
      comment: comment,
      elasticity: elasticity,
    };
    return data;
  }
  if (value == 1) {
    comment = `Since the value is equal to 1, (${value} = 1). Proportional increase in price and goods.`;
    elasticity = `Such that, Income Elasticity is <b>Unitary Income Elasticity</b> having no change.`;
    data = {
      comment: comment,
      elasticity: elasticity,
    };
    return data;
  }
  if (value == 0) {
    comment = `Since the value is equal to 0, (${value} = 0). Change in income has no effect over the bought quantity`;
    elasticity = `Such that, Income Elasticity is <b>Zero Income Elasticity</b> having <b>Sticky goods</b> from Normal Goods.`;
    data = {
      comment: comment,
      elasticity: elasticity,
    };
    return data;
  } else {
    comment = `Since the value is less than 0, (${value} > 0), it is an inferior goods, unlike others which are normal goods.`;
    elasticity = `Such that, Income Elasticity is <b>Negative Income Elasticity</b> inferior from Normal Goods.`;
    data = {
      comment: comment,
      elasticity: elasticity,
    };
    return data;
  }
}

function calculatePED(derivative, paymentOfGoods1, quantity) {
  // Find PED
  console.log("");
  console.log("####### PED #######");
  var PED_formula = "(d*q / d * p) * p/q";
  console.log(PED_formula);
  var PED_answer = derivative * (paymentOfGoods1 / quantity),
    PED_answer = Math.abs(PED_answer).toPrecision(3);
  console.log(PED_answer);

  var PED_commentary = checkPED(PED_answer);
  console.log(PED_commentary);
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
    var qValue = Q_Checker(expression); // Answer of Q
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
    calculatePED(d_Q_div_d_p_answer.answer * (paymentOfGoods1 / qValue.answer));
  }
  // If Value is 2
  if (select_html_Value == 2) {
    // Finding Q1
    console.log("");
    console.log("##### Finding Q1 #####");
    var p1_replaced = variableReplacer(expression, "p1", paymentOfGoods1),
      p1_p2_replaced = variableReplacer(p1_replaced, "p2", paymentOfGoods2),
      y_p1_p2_replaced = variableReplacer(p1_p2_replaced, "y", income),
      valueOf_Q1 = eval(y_p1_p2_replaced);

    var p2_replaced = variableReplacer(expression, "p2", paymentOfGoods2),
      y_p2_replaced = variableReplacer(p2_replaced, "y", income),
      x_variable = variableReplacer(y_p2_replaced, "p1", "x");

    console.log(y_p1_p2_replaced);
    console.log(valueOf_Q1);

    console.log("");
    console.log("##### Finding Derivation #####");
    // Finding Derivation == (dq1 / dp1 = d/dp1[expression])
    // Keeping p1 varible, other than them, all are constants.
    var derivation = deriveExpression(x_variable);
    console.log("Keeping p1 varible, other than them, all are constants.");
    console.log(y_p2_replaced);
    console.log(derivation);

    // Find PED
    calculatePED(derivation, paymentOfGoods1, valueOf_Q1);
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
  // return (answers = [
  //   {
  //     // Q Values
  //     name: "Q Value",
  //     q_PuttingValues: qValue.puttingValues,
  //     qValue: qValue.answer,
  //   },
  //   {
  //     // d_Q_div_d_p
  //     name: "Deviation",
  //     deviation_PuttingValues: d_Q_div_d_p_answer.puttingValues,
  //     deviationAnswer: d_Q_div_d_p_answer.answer,
  //   },
  //   {
  //     // PED
  //     name: "PED",
  //     ped_PuttingValues: PED_formula,
  //     ped_answer: PED_answer,
  //     PED_commentary: PED_commentary,
  //   },
  // ]);
}

//////
// YED
//////
function YEDCalculator(expression, y, q, selectPriceValue, paymentOfGoods1) {
  var YED = "(d*q / d * p) * y/q";

  if (selectPriceValue == 1) {
    // Derivative
    // Formula = dQ/dY = (d/dy) [expression]
    var newcomment = "Considering Price as constant",
      p_constant = variableReplacer(expression, "p", paymentOfGoods1 || 1),
      q_variable = variableReplacer(p_constant, "y", "x"),
      derivative = deriveExpression(q_variable);

    console.log(YED);
    console.log(newcomment);
    console.log(p_constant);
    console.log(q_variable);
    console.log(derivative);
  } else if (selectPriceValue == 2) {
    // Derivative
    // Formula = dQ/dY = (d/dy) [expression]
    var newcomment = "Considering Prices as constant",
      q_variable = variableReplacer(expression, "y", "x"),
      derivative = deriveExpression(q_variable);

    console.log(YED);
    console.log(newcomment);
    console.log(q_variable);
    console.log(derivative);
    console.log("");
  } else if (selectPriceValue == 3) {
  } else {
    console.log("Please enter a valid number");
  }
  // Formula = (d*q / d*p) * y/q
  console.log("Putting Values of Derivative");
  console.log(YED);
  var putting_values = variableReplacer(YED, "(d*q / d * p)", derivative);
  console.log(putting_values);

  YED = derivative * (y / q);
  YED = YED.toPrecision(2);
  console.log(YED);
  var answer = checkYED(YED);
  console.log(answer);
}

/////////////////
// XED Calculator
/////////////////
function XEDCalculator(expression, p2, q1, selectPriceValue) {
  var XED = "(d*q / d * p) * y/q";
  if (selectPriceValue == 1) {
    // Derivative
    // Formula = dQ1/dp2 = (d/dp2) [expression]
    var newcomment = "Considering Price 2 as variable",
      q_variable = variableReplacer(expression, "p2", "x"),
      derivative = deriveExpression(q_variable);

    console.log(XED);
    console.log(newcomment);
    console.log(p_constant);
    console.log(q_variable);
    console.log(derivative);
  } else if (selectPriceValue == 2) {
    // Derivative
    // Formula = dQ1/dp2 = (d/dp2) [expression]
    var newcomment = "Considering Prices as constant",
      q_variable = variableReplacer(expression, "p2", "x"),
      derivative = deriveExpression(q_variable);

    console.log(XED);
    console.log(newcomment);
    console.log(q_variable);
    console.log(derivative);
    console.log("");
  } else if (selectPriceValue == 3) {
  } else {
    console.log("Please enter a valid number");
  }
  // Formula = (d*q / d*p) * y/q
  console.log("Putting Values of Derivative");
  console.log(XED);
  var putting_values = variableReplacer(XED, "(d*q / d * p)", derivative);
  console.log(putting_values);

  XED = derivative * (p2 / q1);
  XED = XED.toPrecision(2);
  console.log(XED);
  var answer = checkYED(XED);
  console.log(answer);
}
function ChangeCalculator(quantity_demand, price, percentChange) {
  var data = (price / quantity_demand) * percentChange;
  console.log(data + "% Change");
  return data;
}

////////
// Tests
////////

// PED
// var Expressive = "700-2*p+0.02*y",
var Expressive = "4850 - 5 * p1 + 1.5 * p2 + 0.1 * y",
  p = "200" || 0,
  p1 = p,
  p2 = "100" || 0,
  p3 = "478" || 0,
  income = "5000";
// console.log(PriceElasticity(Expressive, p1, p2, p3, income));
// expression = Expressive.toLowerCase();
// console.log(PriceElasticity(Expressive, p1, p2, p3, income, 2));
// console.log(PriceElasticity(expression, p1, p2, p3, income, 2));

// YED
// var y = 25,
//   q = 750;
var y = 10000,
  q = 5000;

// YEDCalculator("700-2*p+0.02*y", y, q, 1);
YEDCalculator(Expressive, y, q, 2);
// XEDCalculator(expression, p2, q, 2);

// ChangeCalculator(q, p2, 10);
// Use css selector:after to say number and use `%` in selector.
