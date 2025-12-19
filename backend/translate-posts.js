/**
 * Automatic translation script using LibreTranslate API
 * This translates existing posts to all supported languages
 * 
 * Usage: node backend/translate-posts.js
 * 
 * Make sure translation-service.js is accessible or copy the TranslationService class here
 */

import dotenv from 'dotenv';
import { query } from './db/connection.js';

dotenv.config();

// Simple translation function using LibreTranslate
async function translateText(text, targetLang, sourceLang = 'en') {
    if (!text || !text.trim()) return text;
    
    const langMap = {
        'es': 'es',
        'en': 'en',
        'pt': 'pt',
        'fr': 'fr',
        'jp': 'jp'
    };
    
    const targetCode = langMap[targetLang] || 'en';
    const sourceCode = langMap[sourceLang] || 'en';
    
    try {
        const response = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceCode,
                target: targetCode,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error(`Translation error for "${text.substring(0, 50)}...":`, error.message);
        return text; // Return original on error
    }
}

async function translatePosts() {
    console.log('🤖 Translating posts using LibreTranslate API...\n');
    console.log('⚠️  Note: This uses the public LibreTranslate API (rate limited)');
    console.log('   For production, consider self-hosting or using manual translations\n');

    try {
        // Get all posts
        const postsResult = await query('SELECT * FROM posts ORDER BY id');
        const posts = postsResult.rows;
        
        if (posts.length === 0) {
            console.log('No posts found to translate.');
            return;
        }
        
        const languages = ['es', 'en', 'pt', 'fr', 'jp'];
        
        for (const post of posts) {
            console.log(`\n📝 Translating post: "${post.title}"`);
            
            for (const lang of languages) {
                try {
                    // Check if translation already exists
                    const existing = await query(
                        'SELECT id FROM post_translations WHERE post_id = $1 AND language = $2',
                        [post.id, lang]
                    );
                    
                    if (existing.rows.length > 0) {
                        console.log(`  ⏭️  ${lang}: Translation already exists, skipping...`);
                        continue;
                    }
                    
                    console.log(`  🌐 Translating to ${lang}...`);
                    
                    // Translate title, content, and excerpt
                    const [title, content, excerpt] = await Promise.all([
                        translateText(post.title, lang, 'eng'),
                        translateText(post.content, lang, 'eng'),
                        post.excerpt ? translateText(post.excerpt, lang, 'eng') : null
                    ]);
                    
                    // Insert translation
                    await query(`
                        INSERT INTO post_translations (post_id, language, title, content, excerpt)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [post.id, lang, title, content, excerpt]);
                    
                    console.log(`  ✅ ${lang}: Translation added`);
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`  ❌ Error translating to ${lang}:`, error.message);
                }
            }
        }
        
        console.log('\n✅ Translation process completed!');
        console.log('\nNote: Review and edit translations as needed - machine translation may not be perfect.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

translatePosts();

