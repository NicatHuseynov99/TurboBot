const { getHtml } = require("./http");
const { parseListings } = require("./parse");
const { buildUrl } = require("./buildQuery");
const { normalize } = require("./meta");

const RECENT_HOURS = 72;
const CHEAP_TOP_N = 10; // umumi hovuz boyuk olanda maksimum bu qeder gotur
const CHEAP_PERCENT = 0.25; // umumi hovuzun ~25%-i "ucuz" sayilir
const MAX_PAGES = 5;
const CHEAP_MAX_PAGES = 6;

// total elan icinden ne qeder "ucuz" sayilacagini hesablayir: ~25%, min 1, maks CHEAP_TOP_N
function cheapCount(total) {
  if (total <= 0) return 0;
  return Math.max(1, Math.min(CHEAP_TOP_N, Math.round(total * CHEAP_PERCENT)));
}

async function fetchPages(baseUrl, maxPages) {
  const byId = new Map();
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? baseUrl : baseUrl + (baseUrl.includes("?") ? "&" : "?") + `page=${page}`;
    const html = await getHtml(url);
    const listings = parseListings(html);
    if (listings.length === 0) break;
    for (const l of listings) byId.set(l.id, l);
  }
  return [...byId.values()];
}

async function fetchRecent(sub) {
  const recentUrl = await buildUrl(sub, "date");
  const cutoff = Date.now() - RECENT_HOURS * 60 * 60 * 1000;
  const recent = [];
  outer: for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? recentUrl : recentUrl + (recentUrl.includes("?") ? "&" : "?") + `page=${page}`;
    const html = await getHtml(url);
    const listings = parseListings(html);
    if (listings.length === 0) break;
    for (const l of listings) {
      if (l.date && l.date.getTime() < cutoff) break outer;
      recent.push(l);
    }
  }
  return recent;
}

// "ucuzdurmu" hesablanarkeen butun bazar (qiymet mehdudiyyetsiz) nezere alinmalidir -
// price_from/price_to yalniz hansi elanlarin bize maraqli oldugunu (recent) suzur.
function withoutPriceFilter(sub) {
  const { price_from, price_to, ...rest } = sub;
  return rest;
}

function extractYear(attrs) {
  if (!attrs) return null;
  const m = attrs.match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

// Model+il evvelceden bilinen tek axtaris ucun (sub.model verilib)
// Qaytarir: { cheapTop10: [...], recentMatches: [...] }
async function findMatches(sub) {
  const cheapUrl = await buildUrl(withoutPriceFilter(sub), "price_asc");
  const cheapAll = await fetchPages(cheapUrl, 3);
  const sorted = cheapAll.filter((l) => l.price != null).sort((a, b) => a.price - b.price);
  const cheapTop10 = sorted.slice(0, cheapCount(sorted.length));
  const cheapIds = new Set(cheapTop10.map((l) => l.id));

  const recent = await fetchRecent(sub);
  const recentMatches = recent.filter((l) => cheapIds.has(l.id));
  return { cheapTop10, recentMatches };
}

// Sub.model verilmeyib - marka daxilinde CHIXAN HER MODEL+IL ucun avtomatik
// "hemin model+il uzre en ucuz 10-luq" yoxlanilir. Bir HTTP sorgusu il basina
// (make+year_from+year_to, price_asc), neticeler ad-a gore qruplanir.
async function findMakeMatches(sub) {
  const recent = await fetchRecent(sub);
  if (recent.length === 0) return { recentMatches: [] };

  const years = [...new Set(recent.map((l) => extractYear(l.attrs)).filter(Boolean))];

  const cheapByYear = new Map();
  for (const year of years) {
    const cheapUrl = await buildUrl(
      { ...withoutPriceFilter(sub), year_from: year, year_to: year },
      "price_asc"
    );
    const cheapAll = await fetchPages(cheapUrl, CHEAP_MAX_PAGES);
    const sorted = cheapAll
      .filter((l) => l.price != null)
      .sort((a, b) => a.price - b.price);
    const byModel = new Map();
    for (const l of sorted) {
      const key = normalize(l.name || "");
      let list = byModel.get(key);
      if (!list) {
        list = [];
        byModel.set(key, list);
      }
      list.push(l);
    }
    const cheapSetByModel = new Map();
    for (const [key, list] of byModel) {
      const n = cheapCount(list.length);
      cheapSetByModel.set(key, new Set(list.slice(0, n).map((x) => x.id)));
    }
    cheapByYear.set(year, cheapSetByModel);
  }

  const recentMatches = recent.filter((l) => {
    const year = extractYear(l.attrs);
    const cheapSetByModel = cheapByYear.get(year);
    if (!cheapSetByModel) return false;
    const ids = cheapSetByModel.get(normalize(l.name || ""));
    return ids ? ids.has(l.id) : false;
  });

  return { recentMatches };
}

module.exports = { findMatches, findMakeMatches, RECENT_HOURS, CHEAP_TOP_N };
