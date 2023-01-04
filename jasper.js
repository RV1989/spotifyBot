const getSuffix = (user, score) => {
  const suffixs = ["🤘", "👀", "🎉", "👉🏼", "🐔"];
  let randomSuf = Math.floor(Math.random() * suffixs.length);
  let suffix = suffixs[randomSuf];
  let result = "";
  console.log(`suffix gekozen nr ${randomSuf} ${suffix}`);
  if (user === "Deschrevel Sander") {
    suffix = "👑";
  }
  for (let i = 0; i < score; i++) {
    result += suffix;
  }

  return result;
};

module.exports = getSuffix;
