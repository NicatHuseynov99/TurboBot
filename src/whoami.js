// Bot-a "/start" yazdiqdan sonra bunu ishlet: sene ve dostuna aid chat_id-leri gosterecek.
const { getUpdates } = require("./lib/telegram");

const token = process.env.TG_BOT_TOKEN;
if (!token) {
  console.error("TG_BOT_TOKEN env deyiskeni lazimdir");
  process.exit(1);
}

getUpdates(token).then((data) => {
  if (!data.ok) {
    console.error(data);
    process.exit(1);
  }
  if (data.result.length === 0) {
    console.log("Hec bir mesaj tapilmadi. Once bota Telegram-dan /start yaz, sonra bunu yeniden ishlet.");
    return;
  }
  const seen = new Set();
  for (const u of data.result) {
    const msg = u.message || u.my_chat_member;
    if (!msg || !msg.chat) continue;
    const chat = msg.chat;
    const key = chat.id;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`chat_id: ${chat.id}  ad: ${chat.first_name || ""} ${chat.last_name || ""}  username: @${chat.username || "-"}`);
  }
});
