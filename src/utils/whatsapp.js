const RECIPIENTS = ['6285869449234', '6285729227006', '6285602924733'];

async function sendWhatsApp(alert) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn('[WA] FONNTE_TOKEN not set, WhatsApp notification disabled');
    return;
  }

  const severityIcon = { CRITICAL: '\u{1F534}', WARNING: '\u{1F7E1}', INFO: '\u{1F535}' };
  const icon = severityIcon[alert.severity] || '';
  const message = `${icon} *${alert.type}*\n${alert.message}\nValue: ${alert.value} / Threshold: ${alert.threshold}`;

  for (const target of RECIPIENTS) {
    try {
      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ target, message }),
      });
      const data = await res.json();
      if (data.status) {
        console.log(`[WA] Sent to ${target}`);
      } else {
        console.error(`[WA] Failed to ${target}:`, data.reason || JSON.stringify(data));
      }
    } catch (e) {
      console.error(`[WA] Error sending to ${target}:`, e.message);
    }
  }
}

module.exports = { sendWhatsApp };
