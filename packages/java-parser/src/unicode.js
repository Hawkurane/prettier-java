"use strict";

const path = require("path");
/*const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(path.resolve(__dirname, "UnicodeData.txt"))
});

const unicode = {};

lineReader.on('line', function(line){
    var theLine = line.split(';');
    if(unicode.hasOwnProperty(theLine[2]) === false){
        unicode[theLine[2]] = [theLine[0]];
    } else {
        unicode[theLine[2]].push(theLine[0]);
    }
});*/

const unicode = {};

const fs = require("fs");

const lines = fs
  .readFileSync(path.resolve(__dirname, "UnicodeData.txt"), "utf-8")
  .split("\n");

// The Categories we only want to parse from the file.
// We don't need to store characters from the UnicodeData file that we are not going to use
const categories = new Set([
  "Ll",
  "Lm",
  "Lo",
  "Lt",
  "Lu",
  "Nl",
  "Sc",
  "Pc",
  "Mn"
]);

let oldValue;

function pushInUnicode(a, b) {
  if (unicode.hasOwnProperty(a) === false) {
    unicode[a] = new Set([parseInt(b)]);
  } else {
    unicode[a].add(parseInt(b));
  }
}

lines.forEach(line => {
  const theLine = line.split(";");
  if (!categories.has(theLine[2])) {
    return;
  }
  if (theLine[1].match(/Last>$/)) {
    for (let i = parseInt(oldValue, 16); i <= parseInt(theLine[0], 16); i++) {
      /*if(unicode.hasOwnProperty(theLine[2]) === false){
                unicode[theLine[2]] = new Set([parseInt(theLine[0],16)]);
            } else {
                unicode[theLine[2]].add(parseInt(theLine[0], 16));
            }*/
      pushInUnicode(theLine[2], parseInt(theLine[0], 16));
    }
  }
  /*
    if(unicode.hasOwnProperty(theLine[2]) === false){
        unicode[theLine[2]] = new Set([parseInt(theLine[0],16)]);
    } else {
        unicode[theLine[2]].add(parseInt(theLine[0], 16));
    }
    oldValue = theLine[0];
    */
  pushInUnicode(theLine[2], parseInt(theLine[0], 16));
});

//console.log(JSON.stringify(unicode));

module.exports = {
  unicode
};
