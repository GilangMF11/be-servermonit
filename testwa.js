require('dotenv').config();
const { sendWhatsApp } = require('./src/utils/whatsapp');

const alert = {
  type: 'TEMPERATURE_HIGH',
  severity: 'CRITICAL',
  message: 'Temperature exceeded critical threshold',
  value: 36.5,
  threshold: 35,
};

sendWhatsApp(alert)
  .then(() => {
    console.log('Test notification sent.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  });
