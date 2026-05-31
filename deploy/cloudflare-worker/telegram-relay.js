export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "telegram-relay" });
    }
    if (url.pathname !== "/send" || request.method !== "POST") {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    const expectedSecret = env.RELAY_SECRET || "";
    if (expectedSecret) {
      const receivedSecret = request.headers.get("X-Relay-Secret") || "";
      if (receivedSecret !== expectedSecret) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
    }
    const token = env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return Response.json({ error: "telegram token is not configured" }, { status: 500 });
    }
    const body = await request.json();
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: body.chat_id,
        text: body.text,
        parse_mode: body.parse_mode || undefined,
        disable_web_page_preview: true,
      }),
    });
    const payload = await telegramResponse.json();
    return Response.json(payload, { status: telegramResponse.status });
  },
};
