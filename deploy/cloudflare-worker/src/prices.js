export async function getCryptoPrices() {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/price");
    const data = await response.json();
    
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
    const prices = {};
    
    for (const symbol of symbols) {
      const item = data.find(d => d.symbol === symbol);
      if (item) {
        const asset = symbol.replace("USDT", "");
        prices[asset] = parseFloat(item.price);
      }
    }
    
    return prices;
  } catch (error) {
    console.error("Failed to fetch crypto prices:", error);
    return null;
  }
}

export async function getIranMarketPrices() {
  const prices = {};
  
  try {
    const response = await fetch("https://api.tgju.org/v1/market/indicator/summary-table-data/global-market");
    const data = await response.json();
    
    if (data?.price_dollar_rl?.p) {
      prices.USD = Math.round(data.price_dollar_rl.p / 10);
    }
    
    if (data?.geram18?.p) {
      prices.GOLD_18K = Math.round(data.geram18.p / 10);
    }
    
    if (data?.sekee?.p) {
      prices.SEKKEH_EMAMI = Math.round(data.sekee.p / 10);
    }
  } catch (error) {
    console.error("Failed to fetch Iran market prices:", error);
  }
  
  return prices;
}

export function formatPrice(price, decimals = 0) {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatCryptoPricesMessage(prices) {
  if (!prices) return "خطا در دریافت قیمت‌ها";
  
  const lines = ["💰 قیمت‌های فعلی کریپتو:\n"];
  
  if (prices.BTC) lines.push(`BTC: ${formatPrice(prices.BTC, 0)} USDT`);
  if (prices.ETH) lines.push(`ETH: ${formatPrice(prices.ETH, 0)} USDT`);
  if (prices.SOL) lines.push(`SOL: ${formatPrice(prices.SOL, 0)} USDT`);
  if (prices.BNB) lines.push(`BNB: ${formatPrice(prices.BNB, 0)} USDT`);
  
  const now = new Date();
  const time = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" });
  lines.push(`\nآخرین بروزرسانی: ${time}`);
  
  return lines.join("\n");
}

export function formatIranMarketPricesMessage(prices) {
  if (!prices || Object.keys(prices).length === 0) return "خطا در دریافت قیمت‌ها";
  
  const lines = ["💰 قیمت‌های بازار ایران:\n"];
  
  if (prices.USD) lines.push(`دلار آزاد: ${formatPrice(prices.USD)} تومان`);
  if (prices.GOLD_18K) lines.push(`طلای ۱۸ عیار: ${formatPrice(prices.GOLD_18K)} تومان`);
  if (prices.SEKKEH_EMAMI) lines.push(`سکه امامی: ${formatPrice(prices.SEKKEH_EMAMI)} تومان`);
  
  const now = new Date();
  const time = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" });
  lines.push(`\nآخرین بروزرسانی: ${time}`);
  
  return lines.join("\n");
}
