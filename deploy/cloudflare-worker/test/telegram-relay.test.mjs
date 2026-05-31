import assert from "node:assert/strict";
import worker from "../telegram-relay.js";

const originalFetch = globalThis.fetch;

async function readJson(response) {
  return response.json();
}

try {
  let telegramRequest;
  globalThis.fetch = async (url, init) => {
    telegramRequest = { url, init };
    return Response.json({ ok: true, result: { message_id: 99 } });
  };

  const health = await worker.fetch(new Request("https://relay.example/health"), {});
  assert.equal(health.status, 200);
  assert.deepEqual(await readJson(health), { status: "ok", service: "telegram-relay" });

  const unauthorized = await worker.fetch(
    new Request("https://relay.example/send", { method: "POST" }),
    { RELAY_SECRET: "expected", TELEGRAM_BOT_TOKEN: "token" },
  );
  assert.equal(unauthorized.status, 401);

  const sent = await worker.fetch(
    new Request("https://relay.example/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Relay-Secret": "expected" },
      body: JSON.stringify({ chat_id: "42", text: "hello" }),
    }),
    { RELAY_SECRET: "expected", TELEGRAM_BOT_TOKEN: "token" },
  );

  assert.equal(sent.status, 200);
  assert.equal(telegramRequest.url, "https://api.telegram.org/bottoken/sendMessage");
  assert.deepEqual(JSON.parse(telegramRequest.init.body), {
    chat_id: "42",
    text: "hello",
    disable_web_page_preview: true,
  });
  console.log("telegram relay worker tests passed");
} finally {
  globalThis.fetch = originalFetch;
}
