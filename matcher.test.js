const matcher = require("./matcher");

test("queue", async () => {
  let result = await matcher("queue moooo doja cat");
  expect(result.intent).toBe("queue");
  expect(result.entities.groups.Song.trim()).toBe("moooo doja cat");
});

test("queu empty", async () => {
  let result = await matcher("queue");
  expect(result.intent).toBe("queue");
  expect(result.entities.groups.Song.trim()).toBe(undefined);
});

test("current", async () => {
  let result = await matcher("current");
  expect(result.intent).toBe("current");
});

test("help", async () => {
  let result = await matcher("help");
  expect(result.intent).toBe("help");
});
