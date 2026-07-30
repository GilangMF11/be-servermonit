const pool = require('./db');

let messaging = null;

function getMessaging() {
  if (messaging) return messaging;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON not set, push disabled');
    return null;
  }
  try {
    const admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    messaging = admin.messaging();
    console.log('[FCM] Firebase Admin initialized');
    return messaging;
  } catch (e) {
    console.error('[FCM] Init failed:', e.message);
    return null;
  }
}

async function sendPush(userId, alert) {
  const fcm = getMessaging();
  if (!fcm) return;

  try {
    const { rows } = await pool.query(
      'SELECT token FROM fcm_tokens WHERE user_id = $1',
      [userId]
    );
    if (rows.length === 0) return;

    const tokens = rows.map(r => r.token);
    const severityIcon = { CRITICAL: '\u{1F534}', WARNING: '\u{1F7E1}' };

    const message = {
      notification: {
        title: `${severityIcon[alert.severity] || ''} ${alert.type}`,
        body: `Value: ${alert.value} / Threshold: ${alert.threshold}\n${alert.message}`,
      },
      data: {
        alert_id: String(alert.id),
        type: alert.type,
        severity: alert.severity,
      },
      tokens,
    };

    const response = await fcm.sendEachForMulticast(message);
    console.log(`[FCM] Sent: ${response.successCount}, Failed: ${response.failureCount}`);
  } catch (e) {
    console.error('[FCM] sendPush error:', e.message);
  }
}

async function sendPushToAll(alert) {
  try {
    const { rows: users } = await pool.query('SELECT id FROM users');
    for (const user of users) {
      sendPush(user.id, alert).catch(e => console.error('[FCM] push error:', e));
    }
  } catch (e) {
    console.error('[FCM] sendPushToAll error:', e.message);
  }
}

module.exports = { sendPush, sendPushToAll };
