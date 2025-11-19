const db = require('../utils/db');

class Cv {
  static async create({ userId, title, componentIds }) {
    const res = await db.query(
      'INSERT INTO cvs (user_id, title, component_ids) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, componentIds]
    );
    return res.rows[0];
  }

  static async findByUserId(userId) {
    const res = await db.query('SELECT * FROM cvs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM cvs WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { title, componentIds }) {
    const res = await db.query(
      'UPDATE cvs SET title = $1, component_ids = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, componentIds, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM cvs WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = Cv;
