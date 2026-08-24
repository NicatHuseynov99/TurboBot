const fs = require("fs");
const path = require("path");
const { findMatches, findMakeMatches, RECENT_HOURS } = require("./lib/matcher");
const { sendMessage } = require("./lib/telegram");
const seenStore = require("./lib/seenStore");

const CONFIG_PATH = path.join(__dirname, "..", "config.json");

function formatMessage(sub, listing) {
  return (
    `🚗 <b>${listing.name}</b>\n` +
    `💰 ${listing.priceText}\n` +
    `📋 ${listing.attrs}\n` +
    `🕒 ${listing.dtText}\n` +
    `— öz model+il qrupunda ən ucuzlardan, son ${RECENT_HOURS} saatda əlavə olunub\n` +
    `${listing.url}`
  );
}

async function run() {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) throw new Error("TG_BOT_TOKEN env deyiskeni lazimdir");

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

  for (const sub of config.subscriptions || []) {
    if (!sub.chat_id || sub.chat_id === "REPLACE_ME") {
      console.log(`[${sub.id}] chat_id tenzimlenmeyib, kechirdim`);
      continue;
    }
    console.log(`[${sub.id}] yoxlanilir...`);
    let result;
    try {
      result = sub.model ? await findMatches(sub) : await findMakeMatches(sub);
    } catch (err) {
      console.error(`[${sub.id}] xeta:`, err.message);
      continue;
    }

    const seen = new Set(seenStore.load(sub.id));
    const fresh = result.recentMatches.filter((l) => !seen.has(l.id));

    console.log(`[${sub.id}] son-${RECENT_HOURS}saat-uygun: ${result.recentMatches.length}, yeni: ${fresh.length}`);

    for (const listing of fresh) {
      await sendMessage(token, sub.chat_id, formatMessage(sub, listing));
      seen.add(listing.id);
    }

    if (fresh.length > 0) {
      seenStore.save(sub.id, [...seen]);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
