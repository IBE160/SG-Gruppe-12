const db = require('../utils/db');

class ApplicationAnalysis {
  static async create({ userId, cvId, jobPostingId, generatedApplicationContent, generatedCvContent, atsFeedback, qualityFeedback }) {
    const res = await db.query(
      'INSERT INTO application_analyses (user_id, cv_id, job_posting_id, generated_application_content, generated_cv_content, ats_feedback, quality_feedback) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, cvId, jobPostingId, generatedApplicationContent, generatedCvContent, atsFeedback, qualityFeedback]
    );
    return res.rows[0];
  }

  static async findByUserId(userId) {
    const res = await db.query('SELECT * FROM application_analyses WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM application_analyses WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { generatedApplicationContent, generatedCvContent, atsFeedback, qualityFeedback }) {
    const res = await db.query(
      'UPDATE application_analyses SET generated_application_content = $1, generated_cv_content = $2, ats_feedback = $3, quality_feedback = $4, created_at = NOW() WHERE id = $5 RETURNING *',
      [generatedApplicationContent, generatedCvContent, atsFeedback, qualityFeedback, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM application_analyses WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = ApplicationAnalysis;
