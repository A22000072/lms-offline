const express = require('express');
const router = express.Router();

// Ganti dengan password yang kamu inginkan
const PASSWORD = 'guru123';

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    // Login berhasil, bisa set cookie/session jika perlu
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ error: 'Password salah' });
  }
});

module.exports = router;
