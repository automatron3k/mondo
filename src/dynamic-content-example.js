/**
 * Example: How to use TranslationService for dynamic content
 * 
 * This file demonstrates how to translate content fetched from a database/API
 */

// Example 1: Translate a single blog post
async function loadAndTranslateBlogPost(postId, targetLanguage) {
    // 1. Fetch post from your API/database
    const response = await fetch(`/api/posts/${postId}`);
    const post = await response.json();
    
    // 2. Translate the dynamic content
    const translatedPost = await translationService.translateObject(
        post,
        ['title', 'content', 'excerpt'], // Fields to translate
        targetLanguage,
        'eng' // Assuming posts are stored in English
    );
    
    // 3. Display the translated post
    document.getElementById('post-title').textContent = translatedPost.title;
    document.getElementById('post-content').innerHTML = translatedPost.content;
    document.getElementById('post-excerpt').textContent = translatedPost.excerpt;
}

// Example 2: Translate multiple blog posts
async function loadAndTranslateBlogPosts(targetLanguage) {
    // 1. Fetch posts from your API
    const response = await fetch('/api/posts');
    const posts = await response.json();
    
    // 2. Translate all posts
    const translatedPosts = await Promise.all(
        posts.map(post => 
            translationService.translateObject(
                post,
                ['title', 'excerpt'],
                targetLanguage,
                'eng'
            )
        )
    );
    
    // 3. Render posts
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = translatedPosts.map(post => `
        <article>
            <h2>${post.title}</h2>
            <p>${post.excerpt}</p>
            <a href="/post/${post.id}">Read more</a>
        </article>
    `).join('');
}

// Example 3: Translate content when language changes
function setupLanguageChangeHandler() {
    const languageSwitcher = document.getElementById('languageSwitcher');
    
    languageSwitcher.addEventListener('change', async function() {
        const selectedLanguage = this.value;
        
        // Translate all dynamic content on the page
        await translateDynamicContent(selectedLanguage);
    });
}

async function translateDynamicContent(targetLanguage) {
    // Get all elements with data-translate attribute
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    
    for (const element of elementsToTranslate) {
        const originalText = element.dataset.originalText || element.textContent;
        
        // Store original text if not already stored
        if (!element.dataset.originalText) {
            element.dataset.originalText = originalText;
        }
        
        // Translate and update
        const translated = await translationService.translate(
            originalText,
            targetLanguage
        );
        element.textContent = translated;
    }
}

// Example 4: Translate content with caching (for better performance)
async function translateWithCache(text, targetLanguage) {
    // The translationService already has built-in caching
    // But you can also implement your own database-level caching
    
    // Check if translation exists in your database
    const cachedTranslation = await checkDatabaseCache(text, targetLanguage);
    if (cachedTranslation) {
        return cachedTranslation;
    }
    
    // Translate using API
    const translated = await translationService.translate(text, targetLanguage);
    
    // Store in database for future use
    await saveTranslationToDatabase(text, targetLanguage, translated);
    
    return translated;
}

// Helper functions (you'll implement these based on your backend)
async function checkDatabaseCache(text, targetLanguage) {
    // Check your database for existing translation
    // Return translation if found, null otherwise
    return null;
}

async function saveTranslationToDatabase(original, targetLanguage, translated) {
    // Save translation to your database for caching
    // This prevents re-translating the same content
}

// Example 5: Translate HTML content (preserving tags)
async function translateHTMLContent(htmlContent, targetLanguage) {
    // For HTML content, you might want to:
    // 1. Extract text nodes
    // 2. Translate them
    // 3. Reconstruct HTML
    
    // Simple approach: translate text content only
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const textNodes = getTextNodes(tempDiv);
    for (const node of textNodes) {
        if (node.textContent.trim()) {
            const translated = await translationService.translate(
                node.textContent,
                targetLanguage
            );
            node.textContent = translated;
        }
    }
    
    return tempDiv.innerHTML;
}

function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get current language
    const currentLanguage = localStorage.getItem('language') || 'spa';
    
    // Translate any existing dynamic content
    translateDynamicContent(currentLanguage);
    
    // Setup language change handler
    setupLanguageChangeHandler();
});

