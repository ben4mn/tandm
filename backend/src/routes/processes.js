const express = require('express');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all processes (official + user's own)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as creator_name
       FROM processes p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.is_official = true OR p.created_by = $1
       ORDER BY p.is_official DESC, p.name ASC`,
      [req.user.id]
    );
    res.json({ processes: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get single process
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as creator_name
       FROM processes p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1 AND (p.is_official = true OR p.created_by = $2)`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json({ process: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Create process
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, metadata_schema, is_official } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Process name is required' });
    }

    // Only admins can create official processes
    const official = is_official && req.user.role === 'admin';

    const result = await db.query(
      `INSERT INTO processes (name, description, metadata_schema, is_official, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, metadata_schema || { fields: [] }, official, req.user.id]
    );

    res.status(201).json({ process: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update process
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, description, metadata_schema } = req.body;

    // Check ownership or admin for official
    const existing = await db.query(
      'SELECT * FROM processes WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const process = existing.rows[0];
    const canEdit = process.created_by === req.user.id ||
                    (process.is_official && req.user.role === 'admin');

    if (!canEdit) {
      return res.status(403).json({ error: 'Not authorized to edit this process' });
    }

    const result = await db.query(
      `UPDATE processes
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           metadata_schema = COALESCE($3, metadata_schema)
       WHERE id = $4
       RETURNING *`,
      [name, description, metadata_schema, req.params.id]
    );

    res.json({ process: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete process
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await db.query(
      'SELECT * FROM processes WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const process = existing.rows[0];
    const canDelete = process.created_by === req.user.id ||
                      (process.is_official && req.user.role === 'admin');

    if (!canDelete) {
      return res.status(403).json({ error: 'Not authorized to delete this process' });
    }

    await db.query('DELETE FROM processes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Process deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
