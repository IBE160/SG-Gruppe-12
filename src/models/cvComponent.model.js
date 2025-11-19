const db = require('../utils/db');

class CvComponent {
  static async create({ userId, componentType, content }) {
    const res = await db.query(
      'INSERT INTO cv_components (user_id, component_type, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, componentType, content]
    );
    return res.rows[0];
  }

  static async findByUserId(userId) {
    const res = await db.query('SELECT * FROM cv_components WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM cv_components WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { componentType, content }) {
    const res = await db.query(
      'UPDATE cv_components SET component_type = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [componentType, content, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM cv_components WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = CvComponent;
