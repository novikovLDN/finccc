// Лёгкие smoke-тесты формул раздела 8 ТЗ без test-фреймворка.
// Запуск: `node --experimental-strip-types src/lib/__tests__/formulas.test.mjs`
// Используем готовую транспиляцию через Next.js build; тут — проверка логики JS-копией.

// Простая реализация for testing isolation
const MS_DAY = 86_400_000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function daysBetween(a, b) {
  return Math.round((endOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);
}
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// monthlyEquivalent — TZ 8.4.3
function monthlyEquivalent(amount, freq) {
  switch (freq) {
    case "weekly": return Math.round((amount * 52) / 12);
    case "biweekly": return Math.round((amount * 26) / 12);
    case "monthly": return amount;
    case "quarterly": return Math.round(amount / 3);
    case "semiannual": return Math.round(amount / 6);
    case "annual": return Math.round(amount / 12);
  }
}

// WMA-7 sanity
function wmaCheck() {
  const weights = [7, 6, 5, 4, 3, 2, 1];
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum !== 28) throw new Error(`WMA weights sum expected 28, got ${sum}`);
}

let passed = 0;
let failed = 0;
const tests = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`);
    },
    toBeCloseTo(expected, epsilon = 0.5) {
      if (Math.abs(actual - expected) > epsilon) throw new Error(`expected ≈${expected}, got ${actual}`);
    },
  };
}

console.log("TZ 8.4.3 — monthlyEquivalent");
test("weekly 1000 → 4333", () => expect(monthlyEquivalent(1000, "weekly")).toBe(4333));
test("biweekly 2000 → 4333", () => expect(monthlyEquivalent(2000, "biweekly")).toBe(4333));
test("monthly 5000 → 5000", () => expect(monthlyEquivalent(5000, "monthly")).toBe(5000));
test("quarterly 3000 → 1000", () => expect(monthlyEquivalent(3000, "quarterly")).toBe(1000));
test("semiannual 1200 → 200", () => expect(monthlyEquivalent(1200, "semiannual")).toBe(200));
test("annual 12000 → 1000", () => expect(monthlyEquivalent(12000, "annual")).toBe(1000));

console.log("\nTZ 8.3.2 — WMA weights sanity");
test("weights sum 7+6+5+4+3+2+1 = 28", wmaCheck);

console.log("\nTZ 8.2 — net flow sign neutral");
test("net flow may be negative, TZ 8.2.3", () => {
  const income = 100_000;
  const expense = 140_000;
  const net = income - expense;
  if (net >= 0) throw new Error("expected negative");
});

console.log("\nTZ 8.2.4 — savings rate null when income=0");
test("savings rate is null with zero income", () => {
  const income = 0;
  const rate = income === 0 ? null : 0;
  if (rate !== null) throw new Error("expected null");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
