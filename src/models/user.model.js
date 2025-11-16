const db = require('../utils/db');

class User {
  static async create({ name, email, passwordHash }) {
    const res = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, passwordHash]
    );
    return res.rows[0];
  }

  static async findByEmail(email) {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { name, email, passwordHash }) {
    const res = await db.query(
      'UPDATE users SET name = $1, email = $2, password_hash = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, email, passwordHash, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = User;
