const pool = require('../config/db');

const getLoginHistoryByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT timestamp, ip FROM login_history WHERE user_id = $1 ORDER BY timestamp DESC',
    [userId]
  );
  return result.rows;
};

const addLoginHistory = async (userId, ip) => {
  await pool.query(
    'INSERT INTO login_history (user_id, ip) VALUES ($1, $2)',
    [userId, ip]
  );
};

module.exports = {
  getLoginHistoryByUserId,
  addLoginHistory,
};
