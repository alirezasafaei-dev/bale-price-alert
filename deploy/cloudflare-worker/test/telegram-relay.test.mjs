import assert from "node:assert/strict";
import worker from "../telegram-relay.js";

const originalFetch = globalThis.fetch;

async function readJson(response) {
  return response.json();
}

try {
  const telegramRequests = [];
  globalThis.fetch = async (url, init) => {
    telegramRequests.push({ url, init });
    return Response.json({ ok: true, result: { message_id: 99 } });
  };

  const env = { RELAY_SECRET: "expected", TELEGRAM_BOT_TOKEN: "token" };

  const health = await worker.fetch(new Request("https://relay.example/health"), {});
  assert.equal(health.status, 200);
  assert.deepEqual(await readJson(health), { status: "ok", service: "telegram-relay" });

  const unauthorized = await worker.fetch(
    new Request("https://relay.example/send", { method: "POST" }),
    env,
  );
  assert.equal(unauthorized.status, 401);

  const sent = await worker.fetch(
    new Request("https://relay.example/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Relay-Secret": "expected" },
      body: JSON.stringify({ chat_id: "42", text: "hello" }),
    }),
    env,
  );

  assert.equal(sent.status, 200);
  assert.equal(telegramRequests.at(-1).url, "https://api.telegram.org/bottoken/sendMessage");
  assert.deepEqual(JSON.parse(telegramRequests.at(-1).init.body), {
    chat_id: "42",
    text: "hello",
    disable_web_page_preview: true,
  });

  const webhook = await worker.fetch(
    new Request("https://relay.example/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: { chat: { id: 123 }, text: "/start" } }),
    }),
    env,
  );
  assert.equal(webhook.status, 200);
  const webhookPayload = JSON.parse(telegramRequests.at(-1).init.body);
  assert.equal(webhookPayload.chat_id, 123);
  assert.match(webhookPayload.text, /نواکس فعاله/);

  const setWebhook = await worker.fetch(
    new Request("https://relay.example/set-webhook", {
      method: "POST",
      headers: { "X-Relay-Secret": "expected" },
    }),
    env,
  );
  assert.equal(setWebhook.status, 200);
  assert.equal(telegramRequests.at(-1).url, "https://api.telegram.org/bottoken/setWebhook");
  assert.equal(JSON.parse(telegramRequests.at(-1).init.body).url, "https://relay.example/webhook");

  console.log("telegram relay worker tests passed");
} finally {
  globalThis.fetch = originalFetch;
}
