import { MAIN_KEYBOARD, MARKET_KEYBOARD } from "./keyboards.js";
import { sendMessage } from "./telegram.js";
import { setUser, clearSession } from "./sessions.js";
import { getCryptoPrices, getIranMarketPrices, formatCryptoPricesMessage, formatIranMarketPricesMessage } from "./prices.js";
import { getUserAlerts, formatAlertsList } from "./alerts.js";

export async function handleStart(env, chatId, from) {
  if (from) {
    await setUser(env, chatId, {
      chat_id: chatId,
      username: from.username || null,
      first_name: from.first_name || null,
      created_at: new Date().toISOString(),
    });
  }
  
  await clearSession(env, chatId);
  
  const text = `سلام ${from?.first_name || ""}! 👋

به بات هشدار قیمت نواکس خوش اومدی.

با این بات می‌تونی:
💰 قیمت‌های لحظه‌ای رو ببینی
🔔 هشدار قیمت تنظیم کنی
📋 هشدارهات رو مدیریت کنی

از منوی زیر شروع کن:`;
  
  await sendMessage(env, chatId, text, { reply_markup: MAIN_KEYBOARD });
}

export async function handleHelp(env, chatId) {
  const text = `❓ راهنمای استفاده:

💰 قیمت‌ها: مشاهده قیمت‌های لحظه‌ای کریپتو، ارز و طلا

🔔 تنظیم هشدار: ساخت هشدار قیمت برای دارایی‌های مختلف

📋 هشدارهای من: مشاهده و حذف هشدارهای ثبت شده

هشدارها هر ۱۰ دقیقه بررسی می‌شوند و در صورت رسیدن به شرط، پیام دریافت می‌کنی.`;
  
  await sendMessage(env, chatId, text, { reply_markup: MAIN_KEYBOARD });
}

export async function handlePricesMenu(env, chatId) {
  const text = "کدوم بازار رو می‌خوای ببینی؟";
  await sendMessage(env, chatId, text, { reply_markup: MARKET_KEYBOARD });
}

export async function handleShowCryptoPrices(env, chatId) {
  await sendMessage(env, chatId, "⏳ در حال دریافت قیمت‌ها...");
  const prices = await getCryptoPrices();
  const text = formatCryptoPricesMessage(prices);
  await sendMessage(env, chatId, text);
}

export async function handleShowIranPrices(env, chatId) {
  await sendMessage(env, chatId, "⏳ در حال دریافت قیمت‌ها...");
  const prices = await getIranMarketPrices();
  const text = formatIranMarketPricesMessage(prices);
  await sendMessage(env, chatId, text);
}

export async function handleMyAlerts(env, chatId) {
  const alerts = await getUserAlerts(env, chatId);
  const text = formatAlertsList(alerts);
  await sendMessage(env, chatId, text, { reply_markup: MAIN_KEYBOARD });
}

export async function handleCreateAlertStart(env, chatId) {
  const text = "کدوم بازار رو می‌خوای براش هشدار بسازی؟";
  await sendMessage(env, chatId, text, { reply_markup: MARKET_KEYBOARD });
}

export async function handleUnknownMessage(env, chatId) {
  const text = "دستور نامعتبره. از منوی زیر استفاده کن یا /help رو بزن.";
  await sendMessage(env, chatId, text, { reply_markup: MAIN_KEYBOARD });
}
