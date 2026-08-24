const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sendMessage(token, chatId, text, retries = 3) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    if (data.error_code === 429 && retries > 0) {
      const waitSec = (data.parameters && data.parameters.retry_after) || 5;
      await sleep((waitSec + 1) * 1000);
      return sendMessage(token, chatId, text, retries - 1);
    }
    throw new Error(`Telegram API xetasi: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getUpdates(token) {
  const url = `https://api.telegram.org/bot${token}/getUpdates`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

module.exports = { sendMessage, getUpdates };
