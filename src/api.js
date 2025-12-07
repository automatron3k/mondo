/**
 * API Client for Mondo Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Debug: Log API URL (remove in production)
console.log('🔗 API URL:', API_URL);

class ApiClient {
    constructor(baseUrl = API_URL) {
        this.baseUrl = baseUrl;
        console.log('📡 ApiClient initialized with baseUrl:', this.baseUrl);
    }

    /**
     * Get current language from localStorage
     */
    getCurrentLanguage() {
        return localStorage.getItem('language') || 'spa';
    }

    /**
     * Fetch all posts
     * @param {string} language - Optional language code
     * @returns {Promise<Array>} Array of posts
     */
    async getPosts(language = null) {
        const lang = language || this.getCurrentLanguage();
        const url = `${this.baseUrl}/api/posts?language=${lang}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    /**
     * Fetch a single post by ID
     * @param {number} id - Post ID
     * @param {string} language - Optional language code
     * @returns {Promise<Object>} Post object
     */
    async getPostById(id, language = null) {
        const lang = language || this.getCurrentLanguage();
        const url = `${this.baseUrl}/api/posts/${id}?language=${lang}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    /**
     * Fetch a single post by slug
     * @param {string} slug - Post slug
     * @param {string} language - Optional language code
     * @returns {Promise<Object>} Post object
     */
    async getPostBySlug(slug, language = null) {
        const lang = language || this.getCurrentLanguage();
        const url = `${this.baseUrl}/api/posts/slug/${slug}?language=${lang}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;

