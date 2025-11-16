const db = require('../utils/db');

class JobPosting {
  static async create({ userId, title, company, description, url }) {
    const res = await db.query(
      'INSERT INTO job_postings (user_id, title, company, description, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, company, description, url]
    );
    return res.rows[0];
  }

  static async findByUserId(userId) {
    const res = await db.query('SELECT * FROM job_postings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM job_postings WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { title, company, description, url }) {
    const res = await db.query(
      'UPDATE job_postings SET title = $1, company = $2, description = $3, url = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, company, description, url, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM job_postings WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = JobPosting;
