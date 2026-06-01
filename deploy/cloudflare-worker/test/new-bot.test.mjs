import assert from "node:assert";

class MockKV extends Map {
  async get(key, type) {
    const val = super.get(key);
    return type === "json" && val ? JSON.parse(val) : val;
  }
  async put(key, val) {
    super.set(key, val);
  }
  async delete(key) {
    super.delete(key);
  }
  async list() {
    return { keys: [] };
  }
}

const mockEnv = {
  TELEGRAM_BOT_TOKEN: "test_token",
  TELEGRAM_SECRET_TOKEN: "test_secret",
  ALERTS_KV: new MockKV(),
  SESSIONS_KV: new MockKV(),
  USERS_KV: new MockKV(),
};

global.fetch = async (url) => {
  if (url.includes("binance")) {
    return {
      json: async () => [
        { symbol: "BTCUSDT", price: "67000" },
        { symbol: "ETHUSDT", price: "3400" },
      ]
    };
  }
  return { json: async () => ({}) };
};

const worker = await import("../src/index.js");

const startUpdate = {
  update_id: 1,
  message: {
    chat: { id: 123 },
    from: { first_name: "Test" },
    text: "/start"
  }
};

const req = new Request("https://bot.example/webhook", {
  method: "POST",
  headers: { "X-Telegram-Bot-Api-Secret-Token": "test_secret" },
  body: JSON.stringify(startUpdate)
});

const res = await worker.default.fetch(req, mockEnv);
assert.equal(res.status, 200);

console.log("new bot structure test passed");
