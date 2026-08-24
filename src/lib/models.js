const fs = require("fs");
const path = require("path");
const { getHtml } = require("./http");
const { normalize } = require("./meta");

const CACHE_PATH = path.join(__dirname, "..", "..", "data", "models-cache.json");
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 1 hefte

async function loadModelIndex() {
  if (fs.existsSync(CACHE_PATH)) {
    const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    if (Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
      return cached.byMake;
    }
  }
  const html = await getHtml("https://turbo.az/autos");
  const m = html.match(/id="q_model"[\s\S]*?<\/select>/);
  if (!m) throw new Error("q_model select tapilmadi - sayt strukturu deyisib ola biler");
  const opts = [...m[0].matchAll(/<option class="(\d+)"[^>]*value="(\d+)">([^<]+)<\/option>/g)];

  const byMake = {};
  for (const [, makeId, modelId, name] of opts) {
    if (!byMake[makeId]) byMake[makeId] = {};
    byMake[makeId][normalize(name)] = { id: Number(modelId), name: name.trim() };
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ fetchedAt: Date.now(), byMake }, null, 2));
  return byMake;
}

async function resolveModelId(makeId, modelName) {
  const byMake = await loadModelIndex();
  const models = byMake[String(makeId)];
  if (!models) return null;
  const found = models[normalize(modelName)];
  return found ? found.id : null;
}

module.exports = { resolveModelId, loadModelIndex };
