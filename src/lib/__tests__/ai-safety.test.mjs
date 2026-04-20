// Проверка safety-фильтра (TZ 9.6, Приложение А.1).
const STOP_WORD_PREFIXES = [
  "должн",
  "надо",
  "следует",
  "срочно",
  "немедленн",
  "плохо",
  "критичн",
  "тревожн",
  "тревог",
  "опасн",
];
const STOP_PHRASES = ["вы превысили", "вы потратили", "потратили слишком", "внимание!", "ошибка!"];
const STOP_PHRASE_SUBSTRINGS = ["слишком много"];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function passesSafety(text) {
  if (text.length > 280) return false;
  const low = text.toLowerCase();
  for (const phrase of STOP_PHRASES) if (low.includes(phrase)) return false;
  for (const phrase of STOP_PHRASE_SUBSTRINGS) if (low.includes(phrase)) return false;
  for (const prefix of STOP_WORD_PREFIXES) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(prefix)}`, "iu");
    if (re.test(text)) return false;
  }
  return true;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.error(`  ✗ ${name}`); console.error(`    ${e.message}`); }
}
const T = (v, m) => { if (!v) throw new Error(m ?? "expected true"); };
const F = (v, m) => { if (v) throw new Error(m ?? "expected false"); };

console.log("TZ 9.6 — safety filter");
test("positive text passes", () => T(passesSafety("Это ваш выбор и ваш результат.")));
test("neutral observation passes", () => T(passesSafety("Мы заметили, что за эту неделю на кофе ушло около 4 200 ₽.")));

console.log("\nStop-words from Appendix A.1 are rejected");
test("«Вы превысили бюджет» rejected", () => F(passesSafety("Вы превысили бюджет на еду")));
test("«слишком много» rejected", () => F(passesSafety("Здесь слишком много кофе")));
test("«срочно» rejected", () => F(passesSafety("Срочно сократите расходы")));
test("«должны» rejected", () => F(passesSafety("Вы должны отложить больше")));
test("«тревожный» rejected (префиксный матч)", () => F(passesSafety("Это тревожный сигнал")));
test("«тревожно» rejected", () => F(passesSafety("Это тревожно")));
test("«критично» rejected", () => F(passesSafety("Это критично")));
test("«критичная» rejected (префиксный матч)", () => F(passesSafety("Критичная ситуация")));
test("«Внимание!» rejected", () => F(passesSafety("Внимание! Вы потратили больше")));
test("«опасно» rejected", () => F(passesSafety("Это опасно для здоровья")));

console.log("\nAllowed words do NOT false-match");
test("«нужно» OK", () => T(passesSafety("Если нужно — мы покажем")));
test("«результат» OK", () => T(passesSafety("Это ваш результат")));
test("«выбор» OK", () => T(passesSafety("Это точка вашего выбора")));

console.log("\nLength cap 280 chars");
test("280 chars passes", () => T(passesSafety("a".repeat(280))));
test("281 chars rejected", () => F(passesSafety("a".repeat(281))));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
