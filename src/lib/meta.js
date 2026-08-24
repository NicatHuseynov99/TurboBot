// turbo.az filter id-leri. Bunlar saytin /autos axtaris formasindan chixarilib.
// Marka id-leri (istifadeci suallarinda cixan brendler)
const MAKES = {
  hyundai: 1,
  kia: 8,
  toyota: 23,
  mercedes: 4,
  bmw: 3,
  changan: 163,
  byd: 51,
};

// "Hansi bazar ucun yigilib"
const MARKETS = {
  amerika: 1,
  avropa: 2,
  cin: 42,
  diger: 9,
  dubay: 6,
  koreya: 5,
  "resmi diler": 7,
  rusiya: 8,
  yaponiya: 4,
};

// Yanacaq novu
const FUEL_TYPES = {
  benzin: 1,
  dizel: 2,
  qaz: 3,
  hidrogen: 39,
  elektro: 4,
  hibrid: 5,
  "plug-in hibrid": 6,
  "dizel-hibrid": 72,
};

// Ban novu (category)
const CATEGORIES = {
  sedan: 1,
  "hetcbek, 5 qapi": 2,
  kupe: 3,
  "universal, 5 qapi": 4,
  minivan: 5,
  "pikap, ikiqat kabin": 6,
  mikroavtobus: 7,
  rodster: 8,
  avtobus: 9,
  kabriolet: 11,
  "yuk masini": 13,
  furqon: 14,
  dartqi: 16,
  van: 19,
  motosiklet: 20,
  "offroader / suv, 5 qapi": 21,
  qolfkar: 22,
  kvadrosikl: 25,
  karvan: 26,
  moped: 27,
  liftbek: 28,
};

function normalize(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g");
}

function lookup(map, name) {
  if (name == null) return null;
  const key = normalize(name);
  if (map[key] != null) return map[key];
  return null;
}

module.exports = { MAKES, MARKETS, FUEL_TYPES, CATEGORIES, normalize, lookup };
