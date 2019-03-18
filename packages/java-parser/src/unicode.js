"use strict";

const path = require("path");
const unicode = {};

const fs = require("fs");

const lines = fs
  .readFileSync(path.resolve(__dirname, "UnicodeData.txt"), "utf-8")
  .split("\n");

// The Categories we only want to parse from the file.
// We don't need to store characters from the UnicodeData file that we are not going to use

const firstIdentCharCategories = new Set([
  "Ll",
  "Lm",
  "Lo",
  "Lt",
  "Lu",
  "Nl",
  "Sc",
  "Pc"
]);

const manuallyAddedCharacters = new Set([]);
// Below adding the isIdentifierIgnorable characters from Java Specs but not from FORMAT general category
for (let i = 0; i < 8; i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("000E", 16); i < parseInt("001B"); i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("007F", 16); i < parseInt("009F"); i++) {
  manuallyAddedCharacters.add(i);
}

// Below adding Combining Marks
for (let i = parseInt("0300", 16); i < parseInt("036F"); i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("1AB0", 16); i < parseInt("1AFF"); i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("1DC0", 16); i < parseInt("1DFF"); i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("20D0", 16); i < parseInt("20FF"); i++) {
  manuallyAddedCharacters.add(i);
}
for (let i = parseInt("FE20", 16); i < parseInt("FE2F"); i++) {
  manuallyAddedCharacters.add(i);
}

// Adding digits
for (let i = 48; i <= 57; i++) {
  manuallyAddedCharacters.add(i);
}

const restIdentCharCategories = new Set(
  (function*() {
    yield* firstIdentCharCategories;
    yield* new Set(["Mn", "Cf"]);
  })()
);

const categories = new Set(
  (function*() {
    yield* firstIdentCharCategories;
    yield* restIdentCharCategories;
  })()
);

let oldValue;

function pushInUnicode(a, b) {
  if (unicode.hasOwnProperty(a) === false) {
    unicode[a] = [parseInt(b)];
  } else {
    unicode[a].push(parseInt(b));
  }
}

lines.forEach(line => {
  const theLine = line.split(";");
  if (!categories.has(theLine[2])) {
    return;
  }
  if (theLine[1].match(/Last>$/)) {
    for (
      let i = parseInt(oldValue, 16) + 1;
      i <= parseInt(theLine[0], 16);
      i++
    ) {
      pushInUnicode(theLine[2], i);
    }
  } else {
    pushInUnicode(theLine[2], parseInt(theLine[0], 16));
  }
  oldValue = theLine[0];
});

function generateFile(thePath) {
  let data = `"use strict"
  const firstIdentChar = new Set([`;
  firstIdentCharCategories.forEach(el => {
    unicode[el].forEach(value => {
      data += `${value},`;
    });
  });
  data += `]);
  `;

  data += `const restIdentChar = new Set([`;
  restIdentCharCategories.forEach(el => {
    unicode[el].forEach(value => {
      data += `${value},`;
    });
  });
  manuallyAddedCharacters.forEach(v => (data += `${v},`));

  data += `]);
  `;
  data += `module.exports = {
    firstIdentChar,
    restIdentChar
  }`;
  fs.writeFileSync(thePath, data, err => {
    if (err) {
      throw err;
    }
  });
}
module.exports = {
  generateFile
};
