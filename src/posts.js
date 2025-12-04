/**
 * Posts Management - Fetch and display blog posts
 */

import apiClient from './api.js';

class PostsManager {
    constructor() {
        this.posts = [];
        this.currentLanguage = localStorage.getItem('language') || 'spa';
    }

    /**
     * Load and display all posts
     */
    async loadPosts() {
        try {
            // Show loading state
            this.showLoading();
            
            console.log('📥 Loading posts for language:', this.currentLanguage);
            
            // Fetch posts from API
            this.posts = await apiClient.getPosts(this.currentLanguage);
            
            console.log('✅ Loaded posts:', this.posts.length);
            
            // Render posts
            this.renderPosts();
        } catch (error) {
            console.error('❌ Error loading posts:', error);
            this.showError('Failed to load posts. Please try again later.');
        }
    }

    /**
     * Load a single post by ID
     */
    async loadPostById(id) {
        try {
            this.showLoading();
            const post = await apiClient.getPostById(id, this.currentLanguage);
            this.renderPost(post);
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load post.');
        }
    }

    /**
     * Load a single post by slug
     */
    async loadPostBySlug(slug) {
        try {
            this.showLoading();
            const post = await apiClient.getPostBySlug(slug, this.currentLanguage);
            this.renderPost(post);
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Post not found.');
        }
    }

    /**
     * Render all posts
     */
    renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) {
            console.warn('⚠️ Posts container not found');
            return;
        }

        console.log('🎨 Rendering', this.posts.length, 'posts');

        if (this.posts.length === 0) {
            container.innerHTML = '<p>No posts found.</p>';
            return;
        }

        const html = this.posts.map(post => this.createPostCard(post)).join('');
        container.innerHTML = html;
        console.log('✅ Posts rendered successfully');
    }

    /**
     * Render a single post
     */
    renderPost(post) {
        const container = document.getElementById('post-container');
        if (!container) {
            console.warn('Post container not found');
            return;
        }

        container.innerHTML = this.createPostDetail(post);
    }

    /**
     * Create HTML for a post card
     */
    createPostCard(post) {
        const date = new Date(post.created_at).toLocaleDateString();
        return `
            <article class="post-card">
                <h3><a href="#post-${post.id}" data-post-id="${post.id}">${this.escapeHtml(post.title)}</a></h3>
                ${post.excerpt ? `<p class="post-excerpt">${this.escapeHtml(post.excerpt)}</p>` : ''}
                <div class="post-meta">
                    ${post.author ? `<span class="post-author">${this.escapeHtml(post.author)}</span>` : ''}
                    <time class="post-date">${date}</time>
                </div>
            </article>
        `;
    }

    /**
     * Create HTML for post detail view
     */
    createPostDetail(post) {
        const date = new Date(post.created_at).toLocaleDateString();
        return `
            <article class="post-detail">
                <h1>${this.escapeHtml(post.title)}</h1>
                <div class="post-meta">
                    ${post.author ? `<span class="post-author">${this.escapeHtml(post.author)}</span>` : ''}
                    <time class="post-date">${date}</time>
                </div>
                <div class="post-content">${post.content}</div>
            </article>
        `;
    }

    /**
     * Show loading state
     */
    showLoading() {
        const container = document.getElementById('posts-container') || document.getElementById('post-container');
        if (container) {
            container.innerHTML = '<p class="loading">Loading...</p>';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('posts-container') || document.getElementById('post-container');
        if (container) {
            container.innerHTML = `<p class="error">${this.escapeHtml(message)}</p>`;
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update language and reload posts
     */
    async updateLanguage(language) {
        this.currentLanguage = language;
        await this.loadPosts();
    }
}

// Create singleton instance
const postsManager = new PostsManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM loaded, checking for posts containers...');
    
    // Check if posts container exists
    const postsContainer = document.getElementById('posts-container');
    const postContainer = document.getElementById('post-container');
    
    console.log('Posts container found:', !!postsContainer);
    console.log('Post container found:', !!postContainer);
    
    if (postsContainer || postContainer) {
        console.log('✅ Posts containers found, loading posts...');
        // Load posts on page load
        await postsManager.loadPosts();

        // Listen for language changes
        const languageSwitcher = document.getElementById('languageSwitcher');
        if (languageSwitcher) {
            languageSwitcher.addEventListener('change', async (e) => {
                await postsManager.updateLanguage(e.target.value);
            });
        }

        // Handle post card clicks
        document.addEventListener('click', async (e) => {
            const postLink = e.target.closest('[data-post-id]');
            if (postLink) {
                e.preventDefault();
                const postId = postLink.getAttribute('data-post-id');
                await postsManager.loadPostById(postId);
            }
        });
    }
});

export default postsManager;

