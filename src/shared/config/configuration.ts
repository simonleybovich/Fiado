export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongo: {
    uri: process.env.MONGO_URI,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
  opencode: {
    apiKey: process.env.OPENCODE_API_KEY,
    model: process.env.OPENCODE_MODEL,
    // Opcional: por default pega contra OpenCode Zen (pay-as-you-go).
    // Poné https://opencode.ai/zen/go/v1 para usar OpenCode Go en su lugar
    // (misma API key, billetera/cuota distinta).
    baseUrl: process.env.OPENCODE_BASE_URL,
  },
});
