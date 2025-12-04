/**
 * Helper script to add translations to posts
 * Usage: node backend/add-translations.js
 * 
 * This script demonstrates how to add translations manually.
 * For automatic translation, you can use the LibreTranslate API.
 */

import dotenv from 'dotenv';
import { query } from './db/connection.js';

dotenv.config();

// Example translations for the sample posts
const translations = {
    spa: [
        {
            post_id: 1,
            language: 'spa',
            title: 'Bienvenido a Mondo',
            content: 'Mondo es una plataforma para desarrollo web social, cultural y gentil. Creemos en crear experiencias web que sean accesibles, hermosas y significativas.',
            excerpt: 'Descubre qué hace especial a Mondo y cómo abordamos el desarrollo web.'
        },
        {
            post_id: 2,
            language: 'spa',
            title: 'Comenzando con Mondo',
            content: 'Esta es una guía para ayudarte a comenzar con Mondo. Cubriremos los conceptos básicos y te ayudaremos a entender nuestra filosofía.',
            excerpt: 'Aprende los conceptos básicos de usar Mondo para tus proyectos web.'
        }
    ],
    pt: [
        {
            post_id: 1,
            language: 'pt',
            title: 'Bem-vindo ao Mondo',
            content: 'Mondo é uma plataforma para desenvolvimento web social, cultural e gentil. Acreditamos em criar experiências web que sejam acessíveis, bonitas e significativas.',
            excerpt: 'Descubra o que torna o Mondo especial e como abordamos o desenvolvimento web.'
        },
        {
            post_id: 2,
            language: 'pt',
            title: 'Começando com Mondo',
            content: 'Este é um guia para ajudá-lo a começar com Mondo. Cobriremos o básico e ajudaremos você a entender nossa filosofia.',
            excerpt: 'Aprenda o básico de usar Mondo para seus projetos web.'
        }
    ],
    fr: [
        {
            post_id: 1,
            language: 'fr',
            title: 'Bienvenue sur Mondo',
            content: 'Mondo est une plateforme pour le développement web social, culturel et bienveillant. Nous croyons en la création d\'expériences web accessibles, belles et significatives.',
            excerpt: 'Découvrez ce qui rend Mondo spécial et comment nous abordons le développement web.'
        },
        {
            post_id: 2,
            language: 'fr',
            title: 'Commencer avec Mondo',
            content: 'Ceci est un guide pour vous aider à commencer avec Mondo. Nous couvrirons les bases et vous aiderons à comprendre notre philosophie.',
            excerpt: 'Apprenez les bases de l\'utilisation de Mondo pour vos projets web.'
        }
    ],
    jap: [
        {
            post_id: 1,
            language: 'jap',
            title: 'Mondoへようこそ',
            content: 'Mondoは、社会的、文化的、優しいウェブ開発のためのプラットフォームです。私たちは、アクセス可能で美しく、意味のあるウェブ体験を作り出すことを信じています。',
            excerpt: 'Mondoを特別なものにしているものと、私たちがウェブ開発にどのように取り組んでいるかを発見してください。'
        },
        {
            post_id: 2,
            language: 'jap',
            title: 'Mondoの始め方',
            content: 'これは、Mondoを始めるのに役立つガイドです。基本をカバーし、私たちの哲学を理解するのを助けます。',
            excerpt: 'WebプロジェクトでMondoを使用する基本を学びます。'
        }
    ]
};

async function addTranslations() {
    console.log('🌍 Adding translations to posts...\n');

    try {
        for (const [lang, posts] of Object.entries(translations)) {
            console.log(`Adding ${lang} translations...`);
            
            for (const translation of posts) {
                try {
                    await query(`
                        INSERT INTO post_translations (post_id, language, title, content, excerpt)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (post_id, language) 
                        DO UPDATE SET 
                            title = EXCLUDED.title,
                            content = EXCLUDED.content,
                            excerpt = EXCLUDED.excerpt
                    `, [
                        translation.post_id,
                        translation.language,
                        translation.title,
                        translation.content,
                        translation.excerpt
                    ]);
                    
                    console.log(`  ✅ Added ${lang} translation for post ${translation.post_id}`);
                } catch (error) {
                    console.error(`  ❌ Error adding ${lang} translation for post ${translation.post_id}:`, error.message);
                }
            }
        }
        
        console.log('\n✅ All translations added successfully!');
        console.log('\nTest by changing the language in your browser and refreshing the page.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addTranslations();

