exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) {
    console.error('DISCORD_WEBHOOK_URL is not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const payload = JSON.parse(event.body);

    if (!payload.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing content in payload' }),
      };
    }

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: payload.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order submitted successfully' }),
    };
  } catch (error) {
    console.error('Error submitting order to Discord:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit order' }),
    };
  }
};
