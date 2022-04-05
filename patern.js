var patternDict = [
  {
    pattern: "^help",
    intent: "help",
  },
  {
    pattern: "^current",
    intent: "current",
  },
  {
    pattern: "^queue\\b(?<Song>.+)",
    intent: "queue",
  },
  {
    pattern: "^next",
    intent: "next",
  },
];

module.exports = patternDict;
