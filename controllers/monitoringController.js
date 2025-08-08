const db = require('../db/database');

exports.getAllMonitoring = (req, res) => {
  db.all('SELECT * FROM monitoring', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.insertOrUpdateMonitoring = (req, res) => {
  const { nama, status } = req.body;
  db.run(
    `INSERT INTO monitoring (nama, status) VALUES (?, ?)
     ON CONFLICT(nama) DO UPDATE SET status = excluded.status`,
    [nama, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

exports.resetMonitoring = (req, res) => {
  db.run('DELETE FROM monitoring', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};
