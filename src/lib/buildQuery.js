const { MAKES, MARKETS, FUEL_TYPES, CATEGORIES, lookup } = require("./meta");
const { resolveModelId } = require("./models");

// sub = { make, model, market:[], fuel_type:[], category:[], region:[], color:[],
//         year_from, year_to, price_from, price_to }
async function buildParams(sub) {
  const params = new URLSearchParams();

  const makeId = lookup(MAKES, sub.make);
  if (sub.make && makeId == null) {
    throw new Error(`Naməlum marka: "${sub.make}" (src/lib/meta.js-de MAKES-e elave et)`);
  }
  if (makeId != null) params.append("q[make][]", makeId);

  if (sub.model) {
    if (makeId == null) throw new Error(`"${sub.model}" modeli ucun marka (make) gosterilmelidir`);
    const modelId = await resolveModelId(makeId, sub.model);
    if (modelId == null) {
      throw new Error(`Naməlum model: "${sub.model}" (marka: ${sub.make})`);
    }
    params.append("q[model][]", modelId);
  }

  for (const m of sub.market || []) {
    const id = lookup(MARKETS, m);
    if (id == null) throw new Error(`Naməlum bazar: "${m}"`);
    params.append("q[market][]", id);
  }

  for (const f of sub.fuel_type || []) {
    const id = lookup(FUEL_TYPES, f);
    if (id == null) throw new Error(`Naməlum yanacaq növü: "${f}"`);
    params.append("q[fuel_type][]", id);
  }

  for (const c of sub.category || []) {
    const id = lookup(CATEGORIES, c);
    if (id == null) throw new Error(`Naməlum ban növü: "${c}"`);
    params.append("q[category][]", id);
  }

  for (const r of sub.region || []) params.append("q[region][]", r);
  for (const c of sub.color || []) params.append("q[color][]", c);

  if (sub.year_from) params.append("q[year_from]", sub.year_from);
  if (sub.year_to) params.append("q[year_to]", sub.year_to);
  if (sub.price_from) params.append("q[price_from]", sub.price_from);
  if (sub.price_to) params.append("q[price_to]", sub.price_to);

  return params;
}

// sort: "price_asc" | "date" | undefined (default sort teref saytin ozunundur - tarixe gore, yeni->kohne)
async function buildUrl(sub, sort) {
  const params = await buildParams(sub);
  if (sort) params.append("q[sort]", sort);
  return `https://turbo.az/autos?${params.toString()}`;
}

module.exports = { buildParams, buildUrl };
