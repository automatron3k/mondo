import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    try {
        const { language } = req.query;
        
        if (language) {
            // Get posts with translations for the specified language
            const result = await query(`
                SELECT 
                    p.id,
                    p.slug,
                    p.created_at,
                    COALESCE(pt.title, p.title) as title,
                    COALESCE(pt.content, p.content) as content,
                    COALESCE(pt.excerpt, p.excerpt) as excerpt,
                    p.author
                FROM posts p
                LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language = $1
                ORDER BY p.created_at DESC
            `, [language]);
            
            res.json(result.rows);
        } else {
            // Get posts in original language
            const result = await query(`
                SELECT * FROM posts 
                ORDER BY created_at DESC
            `);
            
            res.json(result.rows);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.query;
        
        if (language) {
            // Get post with translation
            const result = await query(`
                SELECT 
                    p.id,
                    p.slug,
                    p.created_at,
                    COALESCE(pt.title, p.title) as title,
                    COALESCE(pt.content, p.content) as content,
                    COALESCE(pt.excerpt, p.excerpt) as excerpt,
                    p.author
                FROM posts p
                LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language = $2
                WHERE p.id = $1
            `, [id, language]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            res.json(result.rows[0]);
        } else {
            // Get post in original language
            const result = await query(`
                SELECT * FROM posts WHERE id = $1
            `, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Get a single post by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { language } = req.query;
        
        if (language) {
            const result = await query(`
                SELECT 
                    p.id,
                    p.slug,
                    p.created_at,
                    COALESCE(pt.title, p.title) as title,
                    COALESCE(pt.content, p.content) as content,
                    COALESCE(pt.excerpt, p.excerpt) as excerpt,
                    p.author
                FROM posts p
                LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language = $2
                WHERE p.slug = $1
            `, [slug, language]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            res.json(result.rows[0]);
        } else {
            const result = await query(`
                SELECT * FROM posts WHERE slug = $1
            `, [slug]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create a new post (for admin/API use)
router.post('/', async (req, res) => {
    try {
        const { slug, title, content, excerpt, author } = req.body;
        
        if (!slug || !title || !content) {
            return res.status(400).json({ error: 'Missing required fields: slug, title, content' });
        }
        
        const result = await query(`
            INSERT INTO posts (slug, title, content, excerpt, author)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [slug, title, content, excerpt || null, author || null]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Post with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create post' });
    }
});

export default router;

