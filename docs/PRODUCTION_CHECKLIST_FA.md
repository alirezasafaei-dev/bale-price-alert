# چک‌لیست تولید بات نواکس

## ✅ وضعیت فعلی (تایید شده)

### بات تلگرام
- [x] بات در تلگرام فعال است: `@novax_price_bot`
- [x] دستور `/start` پاسخ می‌دهد
- [x] دستور `/prices` قیمت‌های لحظه‌ای نمایش می‌دهد
- [x] دستور `/alerts` لیست هشدارها را نمایش می‌دهد
- [x] قیمت‌ها به تومان و با زمان تهران نمایش داده می‌شوند

### Cloudflare Worker
- [x] Worker deploy شده: `https://novax-telegram-relay.asdevelooper.workers.dev`
- [x] Webhook تنظیم شده: `/webhook`
- [x] KV Storage متصل است: `ALERTS_KV`
- [x] Cron job فعال است: هر ۱۰ دقیقه
- [x] تست‌های Worker موفق: `telegram relay worker tests passed`

### منبع قیمت
- [x] TGJU به عنوان منبع اصلی فعال است
- [x] قیمت‌ها به درستی از ریال به تومان تبدیل می‌شوند
- [x] ۴ دارایی پشتیبانی می‌شود: USD, GOLD, SEKKEH, USDT

## 📋 دستورات تست برای کاربر

### تست دستورات اصلی

```bash
# در تلگرام با @novax_price_bot:

1. /start
   انتظار: پیام خوش‌آمدگویی و لیست دستورات

2. /prices
   انتظار: قیمت‌های لحظه‌ای ۴ دارایی به تومان

3. /help
   انتظار: راهنمای کامل دستورات
```

### تست سیستم هشدار

```bash
# در تلگرام:

1. /alert USD 170000 above
   انتظار: تایید ایجاد هشدار

2. /alerts
   انتظار: لیست هشدارهای فعال با ID

3. /delete <id>
   انتظار: تایید حذف هشدار
```

### تست Cron (اختیاری - برای توسعه‌دهنده)

```bash
# از محیط با دسترسی به اینترنت:

cd sites/secondary/bale-price-alert
set -a && . ./.env && set +a

# بررسی وضعیت
curl -fsS -H "X-Relay-Secret: $TELEGRAM_RELAY_SECRET" \
  "$TELEGRAM_RELAY_URL/cron-status"

# اجرای دستی cron
curl -fsS -X POST -H "X-Relay-Secret: $TELEGRAM_RELAY_SECRET" \
  "$TELEGRAM_RELAY_URL/run-cron"

# یا استفاده از اسکریپت
node scripts/verify-telegram-production.mjs --run-cron
```

## 🎯 سناریوهای استفاده واقعی

### سناریو ۱: کاربر جدید

1. کاربر بات را در تلگرام پیدا می‌کند: `@novax_price_bot`
2. دستور `/start` را می‌زند
3. دستور `/prices` را می‌زند و قیمت‌ها را می‌بیند
4. هشدار تنظیم می‌کند: `/alert USD 175000 above`
5. منتظر می‌ماند تا قیمت دلار از ۱۷۵,۰۰۰ تومان بالاتر رود
6. اعلان دریافت می‌کند

### سناریو ۲: مدیریت هشدارها

1. کاربر چند هشدار تنظیم می‌کند
2. با `/alerts` لیست هشدارها را می‌بیند
3. هشدارهای غیرضروری را با `/delete <id>` حذف می‌کند

### سناریو ۳: بررسی قیمت‌های روزانه

1. کاربر هر روز `/prices` را می‌زند
2. قیمت‌های به‌روز را مشاهده می‌کند
3. تصمیم می‌گیرد هشدار جدید تنظیم کند یا نه

## 🔧 نگهداری و مانیتورینگ

### چک‌های روزانه (توصیه می‌شود)

```bash
# بررسی health
curl -fsS "$TELEGRAM_RELAY_URL/health"

# بررسی وضعیت cron
curl -fsS -H "X-Relay-Secret: $TELEGRAM_RELAY_SECRET" \
  "$TELEGRAM_RELAY_URL/cron-status"

# بررسی storage
curl -fsS -H "X-Relay-Secret: $TELEGRAM_RELAY_SECRET" \
  "$TELEGRAM_RELAY_URL/storage-check"
```

### لاگ‌های Cloudflare

```bash
cd sites/secondary/bale-price-alert/deploy/cloudflare-worker
npx wrangler tail
```

### علائم مشکل

- بات به دستورات پاسخ نمی‌دهد → بررسی webhook
- قیمت‌ها قدیمی هستند → بررسی TGJU و cron
- هشدارها ارسال نمی‌شوند → بررسی KV storage و cron
- خطای "fetch failed" → بررسی اتصال اینترنت Worker

## 📊 معیارهای موفقیت

- [x] بات ۲۴/۷ در دسترس است
- [x] قیمت‌ها هر ۱۰ دقیقه به‌روز می‌شوند
- [x] هشدارها در کمتر از ۱۰ دقیقه ارسال می‌شوند
- [x] هیچ secret در کد یا لاگ چاپ نمی‌شود
- [x] تست‌های Worker همیشه موفق هستند
- [x] مستندات فارسی و کامل است

## 🚀 مراحل بعدی (اختیاری)

### بهبودهای آینده

1. **Mini App تلگرام**: رابط گرافیکی برای مدیریت هشدارها
2. **نمودار قیمت**: نمایش تاریخچه قیمت‌ها
3. **هشدارهای پیشرفته**: محدوده قیمت، درصد تغییر
4. **منابع بیشتر**: افزودن AlanChand، API.ir
5. **آمار کاربران**: تعداد کاربران فعال، هشدارهای ارسال شده

### نیازهای فنی برای بهبودها

- Backend FastAPI (در حال حاضر موجود است)
- PostgreSQL برای ذخیره تاریخچه
- Mini App frontend (React/Vue)
- API endpoints اضافی

## 📝 یادداشت‌های مهم

1. **Secrets**: هرگز `.env` را commit نکنید
2. **TGJU**: منبع فعلی رایگان است، اما ممکن است rate limit داشته باشد
3. **KV Storage**: محدودیت رایگان Cloudflare: ۱۰۰,۰۰۰ read/day
4. **Cron**: محدودیت رایگان: ۱ cron trigger در هر Worker
5. **Worker**: محدودیت رایگان: ۱۰۰,۰۰۰ request/day

## ✅ تایید نهایی

- [x] بات در تلگرام کار می‌کند
- [x] همه دستورات تست شده‌اند
- [x] مستندات کامل است
- [x] تست‌ها موفق هستند
- [x] هیچ secret افشا نشده است

**وضعیت**: ✅ آماده برای استفاده واقعی کاربران

**تاریخ تایید**: ۱۱ خرداد ۱۴۰۵

---

برای سوالات یا مشکلات، به `docs/TELEGRAM_RUNBOOK.md` مراجعه کنید.
