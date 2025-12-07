import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get portfolio items (filtered by category if provided)
router.get('/', async (req, res) => {
    try {
        const { category, language } = req.query;

        let queryText = `
            SELECT 
                id,
                title,
                text as description,
                thumbnail as image_url,
                project_url as url,
                category,
                technologies
            FROM portfolio
        `;

        const queryParams = [];
        const conditions = [];

        if (category) {
            queryParams.push(category);
            conditions.push(`category = $${queryParams.length}`);
        }

        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }

        queryText += ` ORDER BY created_at DESC`;

        const result = await query(queryText, queryParams);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio items', details: error.message });
    }
});

// Get single item by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM portfolio WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching portfolio item:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

export default router;
