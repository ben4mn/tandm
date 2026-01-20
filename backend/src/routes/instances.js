const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's instances (with optional process filter)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { process_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT i.*, p.name as process_name, p.metadata_schema
      FROM instances i
      JOIN processes p ON i.process_id = p.id
      WHERE i.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (process_id) {
      query += ` AND i.process_id = $${paramIndex}`;
      params.push(process_id);
      paramIndex++;
    }

    query += ` ORDER BY i.start_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    res.json({ instances: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get single instance
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.*, p.name as process_name, p.metadata_schema
       FROM instances i
       JOIN processes p ON i.process_id = p.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    res.json({ instance: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Start new instance (create with start_time)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { process_id, start_time, metadata } = req.body;

    if (!process_id) {
      return res.status(400).json({ error: 'Process ID is required' });
    }

    // Verify process exists and user has access
    const processResult = await db.query(
      `SELECT id FROM processes
       WHERE id = $1 AND (is_official = true OR created_by = $2)`,
      [process_id, req.user.id]
    );

    if (processResult.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const result = await db.query(
      `INSERT INTO instances (process_id, user_id, start_time, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [process_id, req.user.id, start_time || new Date(), metadata || {}]
    );

    res.status(201).json({ instance: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update instance (stop timer, edit metadata)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { end_time, metadata } = req.body;

    // Check ownership
    const existing = await db.query(
      'SELECT * FROM instances WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    const instance = existing.rows[0];
    let duration = instance.duration_seconds;

    // Calculate duration if end_time is being set
    if (end_time && !instance.end_time) {
      const start = new Date(instance.start_time);
      const end = new Date(end_time);
      duration = Math.round((end - start) / 1000);
    }

    const result = await db.query(
      `UPDATE instances
       SET end_time = COALESCE($1, end_time),
           duration_seconds = COALESCE($2, duration_seconds),
           metadata = COALESCE($3, metadata),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [end_time, duration, metadata, req.params.id]
    );

    res.json({ instance: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete instance
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM instances WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    res.json({ message: 'Instance deleted' });
  } catch (error) {
    next(error);
  }
});

// Get stats/summary for user
router.get('/stats/summary', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
        COUNT(*) as total_instances,
        SUM(duration_seconds) as total_seconds,
        COUNT(DISTINCT process_id) as unique_processes
       FROM instances
       WHERE user_id = $1 AND end_time IS NOT NULL`,
      [req.user.id]
    );

    res.json({ stats: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
