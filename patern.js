var patternDict = [
  {
    pattern: "help",
    intent: "help",
  },
  {
    pattern: "current",
    intent: "current",
  },
  {
    pattern: "queue\\b(?<Song>.+)",
    intent: "queue",
  },
];

module.exports = patternDict;
