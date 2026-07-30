const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.post('/register', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'token and platform are required' }
      });
    }

    await pool.query(
      `INSERT INTO fcm_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token) DO UPDATE SET updated_at = NOW()`,
      [userId, token, platform]
    );

    res.json({ success: true, message: 'FCM token registered' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Internal server error' }
    });
  }
});

router.post('/unregister', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'token is required' }
      });
    }

    await pool.query(
      'DELETE FROM fcm_tokens WHERE user_id = $1 AND token = $2',
      [userId, token]
    );

    res.json({ success: true, message: 'FCM token unregistered' });
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Internal server error' }
    });
  }
});

module.exports = router;
