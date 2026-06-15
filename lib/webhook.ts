const WEBHOOK_URL = () => process.env.DISCORD_WEBHOOK_URL;

type WebhookField = { name: string; value: string; inline?: boolean };

export async function sendWebhook(
  event: string,
  fields: WebhookField[],
  color?: number
): Promise<void> {
  const url = WEBHOOK_URL();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: event,
          color: color ?? 0x456731,
          fields,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch {
    // silent
  }
}
