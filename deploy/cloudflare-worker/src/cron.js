import { getAllActiveAlerts, markAlertTriggered, formatAlertNotification } from "./alerts.js";
import { getCryptoPrices, getIranMarketPrices, formatPrice } from "./prices.js";
import { sendMessage } from "./telegram.js";

export async function runCronJob(env) {
  const alerts = await getAllActiveAlerts(env);
  
  if (alerts.length === 0) {
    console.log("No active alerts to check");
    return { checked: 0, triggered: 0 };
  }
  
  const cryptoPrices = await getCryptoPrices();
  const iranPrices = await getIranMarketPrices();
  
  let checked = 0;
  let triggered = 0;
  
  for (const alert of alerts) {
    checked++;
    
    let currentPrice = null;
    
    if (alert.market === "crypto") {
      currentPrice = cryptoPrices?.[alert.symbol];
    } else {
      currentPrice = iranPrices?.[alert.symbol];
    }
    
    if (!currentPrice) {
      console.log(`Price not available for ${alert.symbol}`);
      continue;
    }
    
    let shouldTrigger = false;
    
    if (alert.operator === "above" && currentPrice > alert.target) {
      shouldTrigger = true;
    } else if (alert.operator === "below" && currentPrice < alert.target) {
      shouldTrigger = true;
    }
    
    if (shouldTrigger) {
      const text = formatAlertNotification(alert, formatPrice(currentPrice));
      await sendMessage(env, alert.chat_id, text);
      await markAlertTriggered(env, alert.chat_id, alert.id);
      triggered++;
      console.log(`Alert ${alert.id} triggered for chat ${alert.chat_id}`);
    }
  }
  
  return { checked, triggered };
}
