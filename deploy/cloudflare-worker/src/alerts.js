export async function getUserAlerts(env, chatId) {
  const key = `alerts:user:${chatId}`;
  const data = await env.ALERTS_KV.get(key, "json");
  return data || [];
}

export async function saveUserAlerts(env, chatId, alerts) {
  const key = `alerts:user:${chatId}`;
  await env.ALERTS_KV.put(key, JSON.stringify(alerts));
}

export async function createAlert(env, chatId, alertData) {
  const alerts = await getUserAlerts(env, chatId);
  const newAlert = {
    id: crypto.randomUUID().split("-")[0],
    market: alertData.market,
    symbol: alertData.symbol,
    operator: alertData.operator,
    target: alertData.target,
    enabled: true,
    created_at: new Date().toISOString(),
    triggered_at: null,
  };
  alerts.push(newAlert);
  await saveUserAlerts(env, chatId, alerts);
  return newAlert;
}

export async function deleteAlert(env, chatId, alertId) {
  const alerts = await getUserAlerts(env, chatId);
  const filtered = alerts.filter(a => a.id !== alertId);
  await saveUserAlerts(env, chatId, filtered);
  return filtered.length < alerts.length;
}

export async function getAllActiveAlerts(env) {
  const list = await env.ALERTS_KV.list({ prefix: "alerts:user:" });
  const allAlerts = [];
  
  for (const key of list.keys) {
    const alerts = await env.ALERTS_KV.get(key.name, "json");
    if (alerts) {
      const chatId = key.name.replace("alerts:user:", "");
      for (const alert of alerts) {
        if (alert.enabled && !alert.triggered_at) {
          allAlerts.push({ ...alert, chat_id: chatId });
        }
      }
    }
  }
  
  return allAlerts;
}

export async function markAlertTriggered(env, chatId, alertId) {
  const alerts = await getUserAlerts(env, chatId);
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.triggered_at = new Date().toISOString();
    await saveUserAlerts(env, chatId, alerts);
  }
}

export function formatAlertsList(alerts) {
  if (alerts.length === 0) {
    return "هنوز هشدار فعالی نداری.";
  }
  
  const lines = ["📋 هشدارهای فعال:\n"];
  
  for (const alert of alerts) {
    const op = alert.operator === "above" ? "بالاتر از" : "پایین‌تر از";
    const status = alert.triggered_at ? "✅ ارسال شده" : "⏳ در انتظار";
    lines.push(`🔔 ${alert.symbol} ${op} ${alert.target}`);
    lines.push(`   ID: ${alert.id} | ${status}\n`);
  }
  
  return lines.join("\n");
}

export function formatAlertConfirmation(alert, currentPrice) {
  const op = alert.operator === "above" ? "بالاتر از" : "پایین‌تر از";
  return `لطفاً هشدار را تایید کن:

دارایی: ${alert.symbol}
شرط: ${op} ${alert.target}
قیمت فعلی: ${currentPrice || "نامشخص"}

اگر قیمت ${alert.symbol} ${op} ${alert.target} شد، به تو پیام می‌دهم.`;
}

export function formatAlertNotification(alert, currentPrice) {
  const op = alert.operator === "above" ? "بالاتر از" : "پایین‌تر از";
  return `🔔 هشدار قیمت!

${alert.symbol} ${op} ${alert.target} شد.
قیمت فعلی: ${currentPrice}

این هشدار غیرفعال شد.`;
}
