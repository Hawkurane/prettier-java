/* eslint-disable no-unused-vars */
"use strict";
const { createToken: createTokenOrg, Lexer } = require("chevrotain");
const fs = require("fs");
const chars = require("./unicodesets");
// A little mini DSL for easier lexer definition.
const fragments = {};

function inlineFragments(def) {
  let inlinedDef = def;
  Object.keys(fragments).forEach(prevFragmentName => {
    const prevFragmentDef = fragments[prevFragmentName];
    const templateRegExp = new RegExp(`{{${prevFragmentName}}}`, "g");
    inlinedDef = inlinedDef.replace(templateRegExp, prevFragmentDef);
  });
  return inlinedDef;
}

function FRAGMENT(name, def) {
  fragments[name] = inlineFragments(def);
}

function MAKE_PATTERN(def, flags) {
  const inlinedDef = inlineFragments(def);
  return new RegExp(inlinedDef, flags);
}

// The order of fragments definitions is important
FRAGMENT("Digits", "[0-9]([0-9_]*[0-9])?");
FRAGMENT("ExponentPart", "[eE][+-]?{{Digits}}");
FRAGMENT("HexDigit", "[0-9a-fA-F]");
FRAGMENT("HexDigits", "{{HexDigit}}(({{HexDigit}}|'_')*{{HexDigit}})?");
FRAGMENT("FloatTypeSuffix", "[fFdD]");
FRAGMENT("LineTerminator", "(\\x0A|(\\x0D(\\x0A)?))");

// https://docs.oracle.com/javase/7/docs/api/java/lang/Character.html#isJavaIdentifierStart(char)
// A Java Identifier starts by a character that is JavaIdentifierStart-valid
FRAGMENT(
  "JavaIdentifierStart",
  "[$A-Z_a-z¢-¥ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԣԱ-Ֆՙա-ևא-תװ-ײ؋ء-يٮ-ٯٱ-ۓەۥ-ۦۮ-ۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴ-ߵߺऄ-हऽॐक़-ॡॱ-ॲॻ-ॿঅ-ঌএ-ঐও-নপ-রলশ-হঽৎড়-ঢ়য়-ৡৰ-৳ਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલ-ળવ-હઽૐૠ-ૡ૱ଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହଽଡ଼-ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹௐ௹అ-ఌఎ-ఐఒ-నప-ళవ-హఽౘ-ౙౠ-ౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠ-ೡഅ-ഌഎ-ഐഒ-നപ-ഹഽൠ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะา-ำ฿-ๆກ-ຂຄງ-ຈຊຍດ-ທນ-ຟມ-ຣລວສ-ຫອ-ະາ-ຳຽເ-ໄໆໜ-ໝༀཀ-ཇཉ-ཬྈ-ྋက-ဪဿၐ-ၕၚ-ၝၡၥ-ၦၮ-ၰၵ-ႁႎႠ-Ⴥა-ჺჼᄀ-ᅙᅟ-ᆢᆨ-ᇹሀ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙶᚁ-ᚚᚠ-ᛪ\\u16ee-\\u16f0ᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗ៛-ៜᠠ-ᡷᢀ-ᢨᢪᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦩᧁ-ᧇᨀ-ᨖᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮ-ᮯᰀ-ᰣᱍ-ᱏᱚ-ᱽᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‿-⁀⁔ⁱⁿₐ-ₔ₠-₵ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎ\\u2160-\\u2188Ⰰ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱽⲀ-ⳤⴀ-ⴥⴰ-ⵥⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-\\u3007\\u3021-\\u3029〱-〵\\u3038-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆷㇰ-ㇿ㐀-䶵一-鿃ꀀ-ꒌꔀ-ꘌꘐ-ꘟꘪ-ꘫꙀ-ꙟꙢ-ꙮꙿ-ꚗꜗ-ꜟꜢ-ꞈꞋ-ꞌꟻ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꤊ-ꤥꤰ-ꥆꨀ-ꨨꩀ-ꩂꩄ-ꩋ가-힣豈-鶴侮-頻並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּ-סּףּ-פּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-﷼︳-︴﹍-﹏﹩ﹰ-ﹴﹶ-ﻼ＄Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ￠-￡￥-￦]|[\\ud840-\\ud868][\\udc00-\\udfff]|\\ud800[\\udc00-\\udc0b\\udc0d-\\udc26\\udc28-\\udc3a\\udc3c-\\udc3d\\udc3f-\\udc4d\\udc50-\\udc5d\\udc80-\\udcfa\\udd40-\\udd74\\ude80-\\ude9c\\udea0-\\uded0\\udf00-\\udf1e\\udf30-\\udf4a\\udf80-\\udf9d\\udfa0-\\udfc3\\udfc8-\\udfcf\\udfd1-\\udfd5]|\\ud801[\\udc00-\\udc9d]|\\ud802[\\udc00-\\udc05\\udc08\\udc0a-\\udc35\\udc37-\\udc38\\udc3c\\udc3f\\udd00-\\udd15\\udd20-\\udd39\\ude00\\ude10-\\ude13\\ude15-\\ude17\\ude19-\\ude33]|\\ud808[\\udc00-\\udf6e]|\\ud809[\\udc00-\\udc62]|\\ud835[\\udc00-\\udc54\\udc56-\\udc9c\\udc9e-\\udc9f\\udca2\\udca5-\\udca6\\udca9-\\udcac\\udcae-\\udcb9\\udcbb\\udcbd-\\udcc3\\udcc5-\\udd05\\udd07-\\udd0a\\udd0d-\\udd14\\udd16-\\udd1c\\udd1e-\\udd39\\udd3b-\\udd3e\\udd40-\\udd44\\udd46\\udd4a-\\udd50\\udd52-\\udea5\\udea8-\\udec0\\udec2-\\udeda\\udedc-\\udefa\\udefc-\\udf14\\udf16-\\udf34\\udf36-\\udf4e\\udf50-\\udf6e\\udf70-\\udf88\\udf8a-\\udfa8\\udfaa-\\udfc2\\udfc4-\\udfcb]|\\ud869[\\udc00-\\uded6]|\\ud87e[\\udc00-\\ude1d]"
);

// https://docs.oracle.com/javase/7/docs/api/java/lang/Character.html#isJavaIdentifierPart(char)
// Followed by characters that is JavaIdentifierPart-valid
FRAGMENT(
  "JavaIdentifierPart",
  "[$0-9A-Z_a-z¢-¥ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ\\u0300-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ\\u0483-\\u0487Ҋ-ԣԱ-Ֆՙա-և\\u0591-\\u05bd\\u05bf\\u05c1-\\u05c2\\u05c4-\\u05c5\\u05c7א-תװ-ײ؋\\u0610-\\u061aء-\\u065e٠-٩ٮ-ۓە-\\u06dc\\u06df-\\u06e8\\u06ea-ۼۿܐ-\\u074aݍ-ޱ߀-ߵߺ\\u0901-\\u0902ऄ-ह\\u093c-ऽ\\u0941-\\u0948\\u094dॐ-\\u0954क़-\\u0963०-९ॱ-ॲॻ-ॿ\\u0981অ-ঌএ-ঐও-নপ-রলশ-হ\\u09bc-ঽ\\u09c1-\\u09c4\\u09cd-ৎড়-ঢ়য়-\\u09e3০-৳\\u0a01-\\u0a02ਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ\\u0a3c\\u0a41-\\u0a42\\u0a47-\\u0a48\\u0a4b-\\u0a4d\\u0a51ਖ਼-ੜਫ਼੦-\\u0a75\\u0a81-\\u0a82અ-ઍએ-ઑઓ-નપ-રલ-ળવ-હ\\u0abc-ઽ\\u0ac1-\\u0ac5\\u0ac7-\\u0ac8\\u0acdૐૠ-\\u0ae3૦-૯૱\\u0b01ଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ\\u0b3c-ଽ\\u0b3f\\u0b41-\\u0b44\\u0b4d\\u0b56ଡ଼-ଢ଼ୟ-\\u0b63୦-୯ୱ\\u0b82-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹ\\u0bc0\\u0bcdௐ௦-௯௹అ-ఌఎ-ఐఒ-నప-ళవ-హఽ-\\u0c40\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55-\\u0c56ౘ-ౙౠ-\\u0c63౦-౯ಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ\\u0cbc-ಽ\\u0cbf\\u0cc6\\u0ccc-\\u0ccdೞೠ-\\u0ce3೦-೯അ-ഌഎ-ഐഒ-നപ-ഹഽ\\u0d41-\\u0d44\\u0d4dൠ-\\u0d63൦-൯ൺ-ൿඅ-ඖක-නඳ-රලව-ෆ\\u0dca\\u0dd2-\\u0dd4\\u0dd6ก-\\u0e3a฿-\\u0e4e๐-๙ກ-ຂຄງ-ຈຊຍດ-ທນ-ຟມ-ຣລວສ-ຫອ-\\u0eb9\\u0ebb-ຽເ-ໄໆ\\u0ec8-\\u0ecd໐-໙ໜ-ໝༀ\\u0f18-\\u0f19༠-༩\\u0f35\\u0f37\\u0f39ཀ-ཇཉ-ཬ\\u0f71-\\u0f7e\\u0f80-\\u0f84\\u0f86-ྋ\\u0f90-\\u0f97\\u0f99-\\u0fbc\\u0fc6က-ဪ\\u102d-\\u1030\\u1032-\\u1037\\u1039-\\u103a\\u103d-၉ၐ-ၕ\\u1058-ၡၥ-ၦၮ-\\u1082\\u1085-\\u1086\\u108d-ႎ႐-႙Ⴀ-Ⴥა-ჺჼᄀ-ᅙᅟ-ᆢᆨ-ᇹሀ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ\\u135fᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙶᚁ-ᚚᚠ-ᛪ\\u16ee-\\u16f0ᜀ-ᜌᜎ-\\u1714ᜠ-\\u1734ᝀ-\\u1753ᝠ-ᝬᝮ-ᝰ\\u1772-\\u1773ក-ឳ\\u17b7-\\u17bd\\u17c6\\u17c9-\\u17d3ៗ៛-\\u17dd០-៩\\u180b-\\u180d᠐-᠙ᠠ-ᡷᢀ-ᢪᤀ-ᤜ\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193b᥆-ᥭᥰ-ᥴᦀ-ᦩᧁ-ᧇ᧐-᧙ᨀ-\\u1a18\\u1b00-\\u1b03ᬅ-\\u1b34\\u1b36-\\u1b3a\\u1b3c\\u1b42ᭅ-ᭋ᭐-᭙\\u1b6b-\\u1b73\\u1b80-\\u1b81ᮃ-ᮠ\\u1ba2-\\u1ba5\\u1ba8-\\u1ba9ᮮ-᮹ᰀ-ᰣ\\u1c2c-\\u1c33\\u1c36-\\u1c37᱀-᱉ᱍ-ᱽᴀ-\\u1de6\\u1dfe-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‿-⁀⁔ⁱⁿₐ-ₔ₠-₵\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎ\\u2160-\\u2188Ⰰ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱽⲀ-ⳤⴀ-ⴥⴰ-ⵥⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ\\u2de0-\\u2dffⸯ々-\\u3007\\u3021-\\u302f〱-〵\\u3038-〼ぁ-ゖ\\u3099-\\u309aゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆷㇰ-ㇿ㐀-䶵一-鿃ꀀ-ꒌꔀ-ꘌꘐ-ꘫꙀ-ꙟꙢ-\\ua66f\\ua67c-\\ua67dꙿ-ꚗꜗ-ꜟꜢ-ꞈꞋ-ꞌꟻ-ꠢ\\ua825-\\ua826ꡀ-ꡳꢂ-ꢳ\\ua8c4꣐-꣙꤀-\\ua92dꤰ-\\ua951ꨀ-\\uaa2e\\uaa31-\\uaa32\\uaa35-\\uaa36ꩀ-\\uaa4c꩐-꩙가-힣豈-鶴侮-頻並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּ-סּףּ-פּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-﷼\\ufe00-\\ufe0f\\ufe20-\\ufe26︳-︴﹍-﹏﹩ﹰ-ﹴﹶ-ﻼ＄０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ￠-￡￥-￦]|[\\ud840-\\ud868][\\udc00-\\udfff]|\\ud800[\\udc00-\\udc0b\\udc0d-\\udc26\\udc28-\\udc3a\\udc3c-\\udc3d\\udc3f-\\udc4d\\udc50-\\udc5d\\udc80-\\udcfa\\udd40-\\udd74\\uddfd\\ude80-\\ude9c\\udea0-\\uded0\\udf00-\\udf1e\\udf30-\\udf4a\\udf80-\\udf9d\\udfa0-\\udfc3\\udfc8-\\udfcf\\udfd1-\\udfd5]|\\ud801[\\udc00-\\udc9d\\udca0-\\udca9]|\\ud802[\\udc00-\\udc05\\udc08\\udc0a-\\udc35\\udc37-\\udc38\\udc3c\\udc3f\\udd00-\\udd15\\udd20-\\udd39\\ude00-\\ude03\\ude05-\\ude06\\ude0c-\\ude13\\ude15-\\ude17\\ude19-\\ude33\\ude38-\\ude3a\\ude3f]|\\ud808[\\udc00-\\udf6e]|\\ud809[\\udc00-\\udc62]|\\ud834[\\udd67-\\udd69\\udd7b-\\udd82\\udd85-\\udd8b\\uddaa-\\uddad\\ude42-\\ude44]|\\ud835[\\udc00-\\udc54\\udc56-\\udc9c\\udc9e-\\udc9f\\udca2\\udca5-\\udca6\\udca9-\\udcac\\udcae-\\udcb9\\udcbb\\udcbd-\\udcc3\\udcc5-\\udd05\\udd07-\\udd0a\\udd0d-\\udd14\\udd16-\\udd1c\\udd1e-\\udd39\\udd3b-\\udd3e\\udd40-\\udd44\\udd46\\udd4a-\\udd50\\udd52-\\udea5\\udea8-\\udec0\\udec2-\\udeda\\udedc-\\udefa\\udefc-\\udf14\\udf16-\\udf34\\udf36-\\udf4e\\udf50-\\udf6e\\udf70-\\udf88\\udf8a-\\udfa8\\udfaa-\\udfc2\\udfc4-\\udfcb\\udfce-\\udfff]|\\ud869[\\udc00-\\uded6]|\\ud87e[\\udc00-\\ude1d]|\\udb40[\\udd00-\\uddef]"
);

function matchJavaIdentifier(char, startOffset) {
  let endOffset = startOffset;
  let charCode = char.codePointAt(endOffset);

  // We verifiy if the first character is from one of these categories
  // Corresponds to the isJavaIdentifierStart function from Java
  if (chars.firstIdentChar.has(charCode)) {
    endOffset++;
    charCode = char.charCodeAt(endOffset);
  }

  // We verify if the remaining characters is from one of these categories
  // Corresponds to the isJavaIdentifierPart function from Java
  while (chars.restIdentChar.has(charCode)) {
    endOffset++;
    charCode = char.codePointAt(endOffset);
  }

  // No match, must return null to conform with the RegExp.prototype.exec signature
  if (endOffset === startOffset) {
    return null;
  }
  const matchedString = char.substring(startOffset, endOffset);
  // according to the RegExp.prototype.exec API the first item in the returned array must be the whole matched string.
  return [matchedString];
}

const Identifier = createTokenOrg({
  name: "Identifier",
  //pattern: MAKE_PATTERN("({{JavaIdentifierStart}})({{JavaIdentifierPart}})*")
  pattern: { exec: matchJavaIdentifier },
  line_breaks: false,
  start_chars_hint: Array.from(chars.firstIdentChar, x =>
    String.fromCodePoint(x)
  )
});

const allTokens = [];
const tokenDictionary = {};

function createToken(options) {
  if (!options.label) {
    // simple token (e.g operator)
    if (typeof options.pattern === "string") {
      options.label = `'${options.pattern}'`;
    }
    // Complex token (e.g literal)
    else if (options.pattern instanceof RegExp) {
      options.label = `'${options.name}'`;
    }
  }

  const newTokenType = createTokenOrg(options);
  allTokens.push(newTokenType);
  tokenDictionary[options.name] = newTokenType;
  return newTokenType;
}

function createKeywordLikeToken(options) {
  // A keyword 'like' token uses the "longer_alt" config option
  // to resolve ambiguities, see: http://sap.github.io/chevrotain/docs/features/token_alternative_matches.html
  options.longer_alt = Identifier;
  return createToken(options);
}

// Token Categories
// Used a Token Category to mark all restricted keywords.
// This could be used in syntax highlights implementation.
const RestrictedKeyword = createToken({
  name: "RestrictedKeyword",
  pattern: Lexer.NA
});

// Used a Token Category to mark all keywords.
// This could be used in syntax highlights implementation.
const Keyword = createToken({
  name: "Keyword",
  pattern: Lexer.NA
});

const AssignmentOperator = createToken({
  name: "AssignmentOperator",
  pattern: Lexer.NA
});

const BinaryOperator = createToken({
  name: "BinaryOperator",
  pattern: Lexer.NA
});

const UnaryPrefixOperator = createToken({
  name: "UnaryPrefixOperator",
  pattern: Lexer.NA
});
const UnaryPrefixOperatorNotPlusMinus = createToken({
  name: "UnaryPrefixOperatorNotPlusMinus",
  pattern: Lexer.NA
});

const UnarySuffixOperator = createToken({
  name: "UnarySuffixOperator",
  pattern: Lexer.NA
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.6
// Note [\\x09\\x20\\x0C] is equivalent to [\\t\\x20\\f] and that \\x20 represents
// space character
createToken({
  name: "WhiteSpace",
  pattern: MAKE_PATTERN("[\\x09\\x20\\x0C]|{{LineTerminator}}"),
  group: Lexer.SKIPPED
});
createToken({
  name: "LineComment",
  pattern: /\/\/[^\n\r]*/,
  group: "comments"
});
createToken({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//,
  group: "comments"
});
createToken({ name: "BinaryLiteral", pattern: /0[bB][01]([01_]*[01])?[lL]?/ });
createToken({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "{{Digits}}\\.({{Digits}})?({{ExponentPart}})?({{FloatTypeSuffix}})?|" +
      "\\.{{Digits}}({{ExponentPart}})?({{FloatTypeSuffix}})?|" +
      "{{Digits}}{{ExponentPart}}({{FloatTypeSuffix}})?|" +
      "{{Digits}}({{ExponentPart}})?{{FloatTypeSuffix}}"
  )
});
createToken({ name: "OctalLiteral", pattern: /0_*[0-7]([0-7_]*[0-7])?[lL]?/ });
createToken({
  name: "HexFloatLiteral",
  pattern: MAKE_PATTERN(
    "0[xX]({{HexDigits}}\\.?|({{HexDigits}})?\\.{{HexDigits}})[pP][+-]?{{Digits}}[fFdD]?"
  )
});
createToken({
  name: "HexLiteral",
  pattern: /0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?[lL]?/
});
createToken({
  name: "DecimalLiteral",
  pattern: MAKE_PATTERN("(0|[1-9](_+{{Digits}}|({{Digits}})?))[lL]?")
});
// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.10.4
createToken({
  name: "CharLiteral",
  pattern: /'(?:[^\\']|\\(?:(?:[btnfr"'\\/]|[0-7]|[0-7]{2}|[0-3][0-7]{2})|u[0-9a-fA-F]{4}))'/
});
createToken({
  name: "StringLiteral",
  // TODO: align with the spec, the pattern below is incorrect
  pattern: /"[^"\\]*(\\.[^"\\]*)*"/
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.9
// TODO: how to handle the special rule (see spec above) for "requires" and "transitive"
const restrictedKeywords = [
  "open",
  "module",
  "requires",
  "transitive",
  "exports",
  "opens",
  "to",
  "uses",
  "provides",
  "with"
];

// By sorting the keywords in descending order we avoid ambiguities
// of common prefixes.
sortDescLength(restrictedKeywords).forEach(word => {
  createKeywordLikeToken({
    name: word[0].toUpperCase() + word.substr(1),
    pattern: word,
    // restricted keywords can also be used as an Identifiers according to the spec.
    // TODO: inspect this causes no ambiguities
    categories: [Identifier, RestrictedKeyword]
  });
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.9
const keywords = [
  "abstract",
  "continue",
  "for",
  "new",
  "switch",
  "assert",
  "default",
  "if",
  "package",
  "synchronized",
  "boolean",
  "do",
  "goto",
  "private",
  "this",
  "break",
  "double",
  "implements",
  "protected",
  "throw",
  "byte",
  "else",
  "import",
  "public",
  "throws",
  "case",
  "enum",
  // "instanceof", // special handling for "instanceof" operator below
  "return",
  "transient",
  "catch",
  "extends",
  "int",
  "short",
  "try",
  "char",
  "final",
  "interface",
  "static",
  "void",
  "class",
  "finally",
  "long",
  "strictfp",
  "volatile",
  "const",
  "float",
  "native",
  "super",
  "while",
  ["_", "underscore"]
];

sortDescLength(keywords).forEach(word => {
  // For handling symbols keywords (underscore)
  const isPair = Array.isArray(word);
  const actualName = isPair ? word[1] : word;
  const actualPattern = isPair ? word[0] : word;

  const options = {
    name: actualName[0].toUpperCase() + actualName.substr(1),
    pattern: actualPattern,
    categories: Keyword
  };

  if (isPair) {
    options.label = `'${actualName}'`;
  }
  createKeywordLikeToken(options);
});

createKeywordLikeToken({
  name: "Instanceof",
  pattern: "instanceof",
  categories: [Keyword, BinaryOperator]
});

createKeywordLikeToken({
  name: "Var",
  pattern: "var",
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-Keyword
  // "var is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({ name: "True", pattern: "true" });
createKeywordLikeToken({ name: "False", pattern: "false" });
createKeywordLikeToken({ name: "Null", pattern: "null" });

// punctuation and symbols
createToken({ name: "At", pattern: "@" });
createToken({ name: "Arrow", pattern: "->" });
createToken({ name: "DotDotDot", pattern: "..." });
createToken({ name: "Dot", pattern: "." });
createToken({ name: "Comma", pattern: "," });
createToken({ name: "Semicolon", pattern: ";" });
createToken({ name: "ColonColon", pattern: "::" });
createToken({ name: "Colon", pattern: ":" });
createToken({ name: "QuestionMark", pattern: "?" });
createToken({ name: "LBrace", pattern: "(" });
createToken({ name: "RBrace", pattern: ")" });
createToken({ name: "LCurly", pattern: "{" });
createToken({ name: "RCurly", pattern: "}" });
createToken({ name: "LSquare", pattern: "[" });
createToken({ name: "RSquare", pattern: "]" });

// prefix and suffix operators
// must be defined before "-"
createToken({
  name: "MinusMinus",
  pattern: "--",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
// must be defined before "+"
createToken({
  name: "PlusPlus",
  pattern: "++",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
createToken({
  name: "Complement",
  pattern: "~",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});

createToken({
  name: "LessEquals",
  pattern: "<=",
  categories: [BinaryOperator]
});
createToken({
  name: "LessLessEquals",
  pattern: "<<=",
  categories: [AssignmentOperator]
});
createToken({ name: "Less", pattern: "<", categories: [BinaryOperator] });
createToken({
  name: "GreaterEquals",
  pattern: ">=",
  categories: [BinaryOperator]
});
createToken({
  name: "GreaterGreaterEquals",
  pattern: ">>=",
  categories: [AssignmentOperator]
});
createToken({
  name: "GreaterGreaterGreaterEquals",
  pattern: ">>>=",
  categories: [AssignmentOperator]
});
createToken({ name: "Greater", pattern: ">", categories: [BinaryOperator] });
createToken({
  name: "EqualsEquals",
  pattern: "==",
  categories: [BinaryOperator]
});
createToken({
  name: "Equals",
  pattern: "=",
  categories: [BinaryOperator, AssignmentOperator]
});
createToken({
  name: "MinusEquals",
  pattern: "-=",
  categories: [AssignmentOperator]
});
createToken({
  name: "Minus",
  pattern: "-",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken({
  name: "PlusEquals",
  pattern: "+=",
  categories: [AssignmentOperator]
});
createToken({
  name: "Plus",
  pattern: "+",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken({ name: "AndAnd", pattern: "&&", categories: [BinaryOperator] });
createToken({
  name: "AndEquals",
  pattern: "&=",
  categories: [AssignmentOperator]
});
createToken({ name: "And", pattern: "&", categories: [BinaryOperator] });
createToken({
  name: "XorEquals",
  pattern: "^=",
  categories: [AssignmentOperator]
});
createToken({ name: "Xor", pattern: "^", categories: [BinaryOperator] });
createToken({ name: "NotEquals", pattern: "!=", categories: [BinaryOperator] });
createToken({ name: "OrOr", pattern: "||", categories: [BinaryOperator] });
createToken({
  name: "OrEquals",
  pattern: "|=",
  categories: [AssignmentOperator]
});
createToken({ name: "Or", pattern: "|", categories: [BinaryOperator] });
createToken({
  name: "MultiplyEquals",
  pattern: "*=",
  categories: [AssignmentOperator]
});
createToken({ name: "Star", pattern: "*", categories: [BinaryOperator] });
createToken({
  name: "DivideEquals",
  pattern: "/=",
  categories: [AssignmentOperator]
});
createToken({ name: "Divide", pattern: "/", categories: [BinaryOperator] });
createToken({
  name: "ModuloEquals",
  pattern: "%=",
  categories: [AssignmentOperator]
});
createToken({ name: "Modulo", pattern: "%", categories: [BinaryOperator] });

// must be defined after "!="
createToken({
  name: "Not",
  pattern: "!",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});

// Identifier must appear AFTER all the keywords to avoid ambiguities.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
allTokens.push(Identifier);
tokenDictionary["Identifier"] = Identifier;

function sortDescLength(arr) {
  // sort is not stable, but that will not affect the lexing results.
  return arr.sort((a, b) => {
    return b.length - a.length;
  });
}
module.exports = {
  allTokens,
  tokens: tokenDictionary
};
