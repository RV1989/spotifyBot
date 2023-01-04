const getSuffix = require("./jasper");

test("jasper", () => {
  let result = getSuffix("JAsper", 1);
  console.log(result);
  expect(result).toHaveLength(2);
});
test("jasper", () => {
  let result = getSuffix("JAsper", 2);
  console.log(result);
  expect(result).toHaveLength(4);
});
test("jasper", () => {
  let result = getSuffix("JAsper", 6);
  console.log(result);
  expect(result).toHaveLength(12);
});
