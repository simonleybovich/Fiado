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
  },
});
