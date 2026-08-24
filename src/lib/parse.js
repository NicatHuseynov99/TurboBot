const BAKU_OFFSET_MIN = 4 * 60; // Asia/Baku, UTC+4, DST yoxdur

function parsePrice(text) {
  if (!text) return null;
  // "49 900 ₼" / "≈ 28 600 ₼" / "12 345 $"
  const cleaned = text.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  return Number(cleaned);
}

// Saytdaki tarix metnini (Baku vaxti ile) UTC Date-e cevirir.
// Formatlar: "bugün 12:05", "dünən 16:03", "20.08.2026 12:56"
function parseListingDate(text, now = new Date()) {
  if (!text) return null;
  const commaIdx = text.indexOf(",");
  const rest = (commaIdx >= 0 ? text.slice(commaIdx + 1) : text).trim();

  const nowBaku = new Date(now.getTime() + BAKU_OFFSET_MIN * 60000);

  let m = rest.match(/^bugün\s+(\d{1,2}):(\d{2})$/i);
  if (m) {
    return dayTime(nowBaku, 0, Number(m[1]), Number(m[2]));
  }
  m = rest.match(/^dünən\s+(\d{1,2}):(\d{2})$/i);
  if (m) {
    return dayTime(nowBaku, -1, Number(m[1]), Number(m[2]));
  }
  m = rest.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (m) {
    const [, dd, mm, yyyy, hh, min] = m;
    const utcMs = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return new Date(utcMs - BAKU_OFFSET_MIN * 60000);
  }
  return null;
}

function dayTime(nowBaku, dayOffset, hh, min) {
  const y = nowBaku.getUTCFullYear();
  const mo = nowBaku.getUTCMonth();
  const d = nowBaku.getUTCDate() + dayOffset;
  const bakuMs = Date.UTC(y, mo, d, hh, min);
  return new Date(bakuMs - BAKU_OFFSET_MIN * 60000);
}

const CARD_START_RE = /<div class="(products-i(?:| [^"]*))">/g;

function parseListings(html) {
  const starts = [...html.matchAll(CARD_START_RE)];
  const listings = [];
  for (let i = 0; i < starts.length; i++) {
    const classes = starts[i][1];
    const chunkStart = starts[i].index + starts[i][0].length;
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : html.length;
    const chunk = html.slice(chunkStart, chunkEnd);
    const idMatch = chunk.match(/href="\/autos\/(\d+)-([^"]+)"/);
    if (!idMatch) continue;
    const priceMatch = chunk.match(/products-i__price[^>]*>([^<]+)</);
    const nameMatch = chunk.match(/products-i__name[^>]*>([^<]+)</);
    const attrMatch = chunk.match(/products-i__attributes[^>]*>([^<]+)</);
    const dtMatch = chunk.match(/products-i__datetime[^>]*>([^<]+)</);

    const dtText = dtMatch ? dtMatch[1].trim() : null;
    listings.push({
      id: idMatch[1],
      slug: idMatch[2],
      vip: classes.includes("vipped"),
      price: parsePrice(priceMatch && priceMatch[1]),
      priceText: priceMatch ? priceMatch[1].trim() : null,
      name: nameMatch ? nameMatch[1].trim() : null,
      attrs: attrMatch ? attrMatch[1].trim() : null,
      dtText,
      date: parseListingDate(dtText),
      url: `https://turbo.az/autos/${idMatch[1]}-${idMatch[2]}`,
    });
  }
  return listings;
}

module.exports = { parseListings, parsePrice, parseListingDate };
