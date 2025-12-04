/**
 * Translation Service for Dynamic Content
 * Uses LibreTranslate API (open-source translation service)
 * 
 * Setup options:
 * 1. Use public instance: https://libretranslate.com (rate limited, free)
 * 2. Self-host: Run your own instance with Docker
 * 
 * Self-hosting: docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
 */

class TranslationService {
    constructor(config = {}) {
        // Default to public LibreTranslate instance
        // For production, set this to your self-hosted instance
        this.apiUrl = config.apiUrl || 'https://libretranslate.com/translate';
        this.apiKey = config.apiKey || null; // Optional API key for public instance
        this.cache = new Map(); // Simple in-memory cache
        this.cacheEnabled = config.cacheEnabled !== false; // Cache enabled by default
    }

    /**
     * Language code mapping from our app codes to LibreTranslate codes
     */
    getLanguageCode(lang) {
        const langMap = {
            'spa': 'es',    // Spanish
            'eng': 'en',    // English
            'pt': 'pt',     // Portuguese
            'fr': 'fr',     // French
            'jap': 'ja'     // Japanese
        };
        return langMap[lang] || 'en';
    }

    /**
     * Generate cache key
     */
    getCacheKey(text, sourceLang, targetLang) {
        return `${text}|${sourceLang}|${targetLang}`;
    }

    /**
     * Translate text using LibreTranslate API
     * @param {string} text - Text to translate
     * @param {string} targetLang - Target language code (spa, eng, pt, fr, jap)
     * @param {string} sourceLang - Source language code (optional, auto-detects if not provided)
     * @returns {Promise<string>} Translated text
     */
    async translate(text, targetLang, sourceLang = 'auto') {
        if (!text || !text.trim()) {
            return text;
        }

        const targetCode = this.getLanguageCode(targetLang);
        const sourceCode = sourceLang === 'auto' ? 'auto' : this.getLanguageCode(sourceLang);

        // Check cache first
        if (this.cacheEnabled) {
            const cacheKey = this.getCacheKey(text, sourceCode, targetCode);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceCode,
                    target: targetCode,
                    format: 'text',
                    api_key: this.apiKey
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const translatedText = data.translatedText;

            // Cache the result
            if (this.cacheEnabled && translatedText) {
                const cacheKey = this.getCacheKey(text, sourceCode, targetCode);
                this.cache.set(cacheKey, translatedText);
            }

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text on error
            return text;
        }
    }

    /**
     * Translate multiple texts in parallel
     * @param {Array<string>} texts - Array of texts to translate
     * @param {string} targetLang - Target language code
     * @param {string} sourceLang - Source language code (optional)
     * @returns {Promise<Array<string>>} Array of translated texts
     */
    async translateBatch(texts, targetLang, sourceLang = 'auto') {
        const promises = texts.map(text => this.translate(text, targetLang, sourceLang));
        return Promise.all(promises);
    }

    /**
     * Translate an object with multiple text fields
     * Useful for translating blog posts, articles, etc.
     * @param {Object} obj - Object with text fields to translate
     * @param {Array<string>} fields - Array of field names to translate
     * @param {string} targetLang - Target language code
     * @param {string} sourceLang - Source language code (optional)
     * @returns {Promise<Object>} Object with translated fields
     */
    async translateObject(obj, fields, targetLang, sourceLang = 'auto') {
        const translated = { ...obj };
        const textsToTranslate = fields.map(field => obj[field] || '');
        
        const translatedTexts = await this.translateBatch(textsToTranslate, targetLang, sourceLang);
        
        fields.forEach((field, index) => {
            translated[field] = translatedTexts[index];
        });

        return translated;
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Create a singleton instance
const translationService = new TranslationService({
    // Configure here:
    // apiUrl: 'http://localhost:5000/translate', // For self-hosted instance
    // apiKey: 'your-api-key-here', // Optional API key
    // cacheEnabled: true
});

// Export for use in other modules
export { TranslationService, translationService };
export default translationService;

