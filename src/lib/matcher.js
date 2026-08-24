const { getHtml } = require("./http");
const { parseListings } = require("./parse");
const { buildUrl } = require("./buildQuery");

const RECENT_HOURS = 48;
const CHEAP_TOP_N = 10;
const MAX_PAGES = 5;

async function fetchPages(baseUrl, maxPages) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? baseUrl : baseUrl + (baseUrl.includes("?") ? "&" : "?") + `page=${page}`;
    const html = await getHtml(url);
    const listings = parseListings(html);
    if (listings.length === 0) break;
    all.push(...listings);
  }
  return all;
}

// Qaytarir: { cheapTop10: [...], recentMatches: [...] }
async function findMatches(sub) {
  const cheapUrl = await buildUrl(sub, "price_asc");
  const cheapAll = await fetchPages(cheapUrl, 2);
  const cheapTop10 = cheapAll.filter((l) => !l.vip).slice(0, CHEAP_TOP_N);
  const cheapIds = new Set(cheapTop10.map((l) => l.id));

  const recentUrl = await buildUrl(sub, "date");
  const cutoff = Date.now() - RECENT_HOURS * 60 * 60 * 1000;
  const recent = [];
  let page = 1;
  outer: for (; page <= MAX_PAGES; page++) {
    const url = page === 1 ? recentUrl : recentUrl + (recentUrl.includes("?") ? "&" : "?") + `page=${page}`;
    const html = await getHtml(url);
    const listings = parseListings(html);
    if (listings.length === 0) break;
    for (const l of listings) {
      if (l.date && l.date.getTime() < cutoff) break outer;
      recent.push(l);
    }
  }

  const recentMatches = recent.filter((l) => cheapIds.has(l.id));
  return { cheapTop10, recentMatches };
}

module.exports = { findMatches, RECENT_HOURS, CHEAP_TOP_N };
