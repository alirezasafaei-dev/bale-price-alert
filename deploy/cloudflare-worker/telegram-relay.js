const HELP_TEXT = `سلام، نواکس فعاله ✅

دستورهای فعلی:
/start - شروع و معرفی ربات
/help - راهنما
/prices - لینک مشاهده قیمت‌ها

هشدار قیمت از طریق مینی‌اپ/بک‌اند نواکس مدیریت می‌شود.`;

function json(data, init = {}) {
  return Response.json(data, init);
}

function requireRelaySecret(request, env) {
  const expectedSecret = env.RELAY_SECRET || "";
  if (!expectedSecret) return null;
  const receivedSecret = request.headers.get("X-Relay-Secret") || "";
  if (receivedSecret !== expectedSecret) {
    return json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function getTelegramToken(env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("telegram token is not configured");
  }
  return token;
}

async function telegramApi(env, method, payload) {
  const token = getTelegramToken(env);
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return { response, result };
}

async function sendMessage(env, payload) {
  return telegramApi(env, "sendMessage", {
    chat_id: payload.chat_id,
    text: payload.text,
    parse_mode: payload.parse_mode || undefined,
    reply_markup: payload.reply_markup || undefined,
    disable_web_page_preview: true,
  });
}

function getMessageText(update) {
  return update?.message?.text || update?.edited_message?.text || "";
}

function getChatId(update) {
  return update?.message?.chat?.id || update?.edited_message?.chat?.id || null;
}

async function handleTelegramWebhook(request, env) {
  const update = await request.json();
  const chatId = getChatId(update);
  if (!chatId) return json({ ok: true, ignored: true });

  const text = getMessageText(update).trim();
  let reply = HELP_TEXT;
  if (text.startsWith("/prices")) {
    reply = "برای مشاهده قیمت‌ها از مینی‌اپ نواکس یا لینک بک‌اند قیمت استفاده کن. اگر لینک عمومی تنظیم نشده، فعلاً /start و هشدارها از backend فعال می‌شوند.";
  } else if (text && !text.startsWith("/start") && !text.startsWith("/help")) {
    reply = "دستور نامعتبره. /help رو بزن.";
  }

  const { response, result } = await sendMessage(env, { chat_id: chatId, text: reply });
  return json({ ok: response.ok, telegram: result }, { status: response.ok ? 200 : 502 });
}

async function setWebhook(request, env) {
  const unauthorized = requireRelaySecret(request, env);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/webhook`;
  const { response, result } = await telegramApi(env, "setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: false,
  });
  return json({ ok: response.ok, webhook_url: webhookUrl, telegram: result }, {
    status: response.ok ? 200 : 502,
  });
}

async function getWebhookInfo(request, env) {
  const unauthorized = requireRelaySecret(request, env);
  if (unauthorized) return unauthorized;

  const { response, result } = await telegramApi(env, "getWebhookInfo", {});
  return json({ ok: response.ok, telegram: result }, { status: response.ok ? 200 : 502 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") {
        return json({ status: "ok", service: "telegram-relay" });
      }
      if (url.pathname === "/webhook" && request.method === "POST") {
        return handleTelegramWebhook(request, env);
      }
      if (url.pathname === "/set-webhook" && request.method === "POST") {
        return setWebhook(request, env);
      }
      if (url.pathname === "/webhook-info") {
        return getWebhookInfo(request, env);
      }
      if (url.pathname === "/send" && request.method === "POST") {
        const unauthorized = requireRelaySecret(request, env);
        if (unauthorized) return unauthorized;
        const body = await request.json();
        const { response, result } = await sendMessage(env, body);
        return json(result, { status: response.status });
      }
      return json({ error: "not found" }, { status: 404 });
    } catch (error) {
      return json({ error: error.message || "internal error" }, { status: 500 });
    }
  },
};
