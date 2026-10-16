exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const buttondownApiKey = process.env.BUTTONDOWN_API_KEY;

  try {
    const payload = JSON.parse(event.body || '{}');
    const { name, email, service, details, timeline, subscribeNewsletter } = payload;

    if (!name || !email || !details) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: name, email, and project details are required.' })
      };
    }

    // Map service identifiers to user-friendly titles & rates
    const serviceMap = {
      'advisory': '1-on-1 Systems Architecture Review ($125 / 45 min)',
      'microbuild-tool': 'Interactive Web Tool / Micro-Build ($750 / 5 Days)',
      'microbuild-system': 'Connected Automation / Custom Bot System ($1,250 / 5 Days)',
      'custom': 'Custom Systems Advisory & Consulting'
    };
    const serviceLabel = serviceMap[service] || service || 'General Inquiry';

    // 1. Post to Discord Webhook if configured
    if (discordWebhookUrl) {
      const discordEmbed = {
        title: '💼 New Project Inquiry Received',
        color: 0x38bdf8, // Cyan / Accent color
        fields: [
          { name: '👤 Client Name', value: String(name), inline: true },
          { name: '✉️ Email', value: String(email), inline: true },
          { name: '🛠️ Service Requested', value: String(serviceLabel), inline: false },
          { name: '⏱️ Target Timeline', value: String(timeline || 'Flexible'), inline: true },
          { name: '📬 Newsletter Opt-in', value: subscribeNewsletter ? 'Yes (Subscribed to Buttondown)' : 'No', inline: true },
          { name: '📝 Project Details & Objectives', value: String(details).slice(0, 1024), inline: false }
        ],
        footer: {
          text: 'Thoms Foolery Client Intake System'
        },
        timestamp: new Date().toISOString()
      };

      const discordRes = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚀 **New Client Inquiry:** **${name}** inquired about **${serviceLabel}**`,
          embeds: [discordEmbed]
        })
      });

      if (!discordRes.ok) {
        console.warn(`Discord webhook returned status ${discordRes.status}`);
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL is not configured. Logging inquiry to server console:', { name, email, serviceLabel, timeline });
    }

    // 2. Synchronize with Buttondown Newsletter if opted in
    if (subscribeNewsletter && buttondownApiKey) {
      try {
        const bdRes = await fetch('https://api.buttondown.email/v1/subscribers', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${buttondownApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            notes: `Inquiry via /hire/ for ${serviceLabel}`,
            tags: ['client-inquiry', 'website-lead']
          })
        });

        if (!bdRes.ok) {
          const bdErr = await bdRes.text();
          console.warn('Buttondown subscription warning:', bdErr);
        }
      } catch (bdError) {
        console.warn('Failed to subscribe email to Buttondown:', bdError);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Thank you! Your inquiry has been received. Jonathan will review your project and reply within 1 business day.'
      })
    };

  } catch (error) {
    console.error('Error processing inquiry:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error while processing your inquiry.' })
    };
  }
};
