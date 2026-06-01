import { handleStart, handleHelp, handlePricesMenu, handleMyAlerts, handleCreateAlertStart, handleUnknownMessage } from "./commands.js";
import { handleCallback, handleTextInSession } from "./callbacks.js";
import { isUpdateProcessed, markUpdateProcessed, setSession } from "./sessions.js";
import { runCronJob } from "./cron.js";

function requireSecret(request, env) {
  const secret = env.TELEGRAM_SECRET_TOKEN;
  if (!secret) return null;
  
  const received = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (received !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "telegram-bot" });
    }
    
    if (url.pathname === "/webhook" && request.method === "POST") {
      const unauthorized = requireSecret(request, env);
      if (unauthorized) return unauthorized;
      
      const update = await request.json();
      
      if (update.update_id) {
        const processed = await isUpdateProcessed(env, update.update_id);
        if (processed) {
          return Response.json({ ok: true, duplicate: true });
        }
        await markUpdateProcessed(env, update.update_id);
      }
      
      if (update.callback_query) {
        await handleCallback(env, update.callback_query);
        return Response.json({ ok: true });
      }
      
      const message = update.message || update.edited_message;
      if (!message) {
        return Response.json({ ok: true, ignored: true });
      }
      
      const chatId = message.chat.id;
      const text = message.text?.trim() || "";
      
      if (text.startsWith("/start")) {
        await handleStart(env, chatId, message.from);
        return Response.json({ ok: true });
      }
      
      if (text.startsWith("/help")) {
        await handleHelp(env, chatId);
        return Response.json({ ok: true });
      }
      
      if (text === "💰 قیمت‌ها") {
        await handlePricesMenu(env, chatId);
        return Response.json({ ok: true });
      }
      
      if (text === "🔔 تنظیم هشدار") {
        await setSession(env, chatId, { flow: "create_alert", step: "select_market" });
        await handleCreateAlertStart(env, chatId);
        return Response.json({ ok: true });
      }
      
      if (text === "📋 هشدارهای من") {
        await handleMyAlerts(env, chatId);
        return Response.json({ ok: true });
      }
      
      if (text === "❓ راهنما") {
        await handleHelp(env, chatId);
        return Response.json({ ok: true });
      }
      
      const handledInSession = await handleTextInSession(env, chatId, text);
      if (handledInSession) {
        return Response.json({ ok: true });
      }
      
      if (text) {
        await handleUnknownMessage(env, chatId);
      }
      
      return Response.json({ ok: true });
    }
    
    return new Response("Not Found", { status: 404 });
  },
  
  async scheduled(event, env, ctx) {
    const result = await runCronJob(env);
    console.log(`Cron completed: checked=${result.checked}, triggered=${result.triggered}`);
  }
};
