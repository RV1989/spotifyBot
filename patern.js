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
  {
    pattern: "^leaderboard",
    intent: "next",
  },
];

module.exports = patternDict;
