const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data", "seen");
const MAX_KEEP = 500;

function filePath(subId) {
  return path.join(DATA_DIR, `${subId}.json`);
}

function load(subId) {
  const p = filePath(subId);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return [];
  }
}

function save(subId, ids) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const trimmed = ids.slice(-MAX_KEEP);
  fs.writeFileSync(filePath(subId), JSON.stringify(trimmed, null, 2));
}

module.exports = { load, save };
