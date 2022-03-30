var patternDict = require("./patern"),
  XregExp = require("xregexp");

let createEntities = (str, pattern) => {
  let result = XregExp.exec(str, XregExp(pattern, "i"));
  return result;
};

let matchPattern = async (str) => {
  let getResult = patternDict.find((item) => {
    if (XregExp.test(str, XregExp(item.pattern, "i"))) {
      return true;
    }
  });

  if (getResult) {
    let result = {
      intent: getResult.intent,
      entities: createEntities(str, getResult.pattern),
    };
    return Promise.resolve(result);
  } else {
    return Promise.resolve({});
  }
};

module.exports = matchPattern;
