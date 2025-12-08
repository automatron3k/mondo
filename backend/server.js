import 'dotenv/config'; // Load env vars before other imports
import express from 'express';
import cors from 'cors';
import portfolioRouter from './routes/portfolio.js';
import { query } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await query('SELECT NOW()');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/portfolio', portfolioRouter);

// Contact form webhook proxy (bypasses CORS)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, organization, email, subject, message, sendCopy } = req.body;

        // Insert into Supabase
        const result = await query(
            `INSERT INTO mondo_contact_form (name, org, email, subject, message, send_copy) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id`,
            [name, organization || null, email, subject || null, message || null, sendCopy || false]
        );

        console.log('✅ Contact form submission saved:', result.rows[0].id);
        res.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('❌ Error saving contact form:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Mondo API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            posts: '/api/posts',
            postById: '/api/posts/:id',
            postBySlug: '/api/posts/slug/:slug'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`);
});

