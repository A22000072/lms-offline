// Login guru sederhana (password tetap)
exports.loginGuru = (req, res) => {
  const { password } = req.body;

  // Ganti password di sini jika ingin mengubah
  const PASSWORD_GURU = 'guru123';

  if (password === PASSWORD_GURU) {
    res.json({ success: true, message: 'Login berhasil' });
  } else {
    res.status(401).json({ success: false, message: 'Password salah' });
  }
};
