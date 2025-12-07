/**
 * Web Pages Management - Fetch and display portfolio items
 */

import apiClient from './api.js';

class WebPagesManager {
    constructor() {
        this.items = [];
        this.currentLanguage = localStorage.getItem('language') || 'spa';
    }

    /**
     * Load and display all web pages
     */
    async loadItems() {
        try {
            this.showLoading();

            console.log('📥 Loading web pages for language:', this.currentLanguage);

            // Fetch items from API using the method you created
            this.items = await apiClient.getWebPages(this.currentLanguage);

            console.log('✅ Loaded web pages:', this.items.length);

            this.renderItems();
        } catch (error) {
            console.error('❌ Error loading web pages:', error);
            this.showError('Failed to load portfolio items.');
        }
    }

    /**
     * Load a single item by ID
     */
    async loadItemById(id) {
        try {
            this.showLoading();
            const item = await apiClient.getWebPagesById(id, this.currentLanguage);
            this.renderItemDetail(item);
        } catch (error) {
            console.error('Error loading item:', error);
            this.showError('Failed to load item details.');
        }
    }

    /**
     * Render all items
     */
    renderItems() {
        const container = document.getElementById('web-pages-container');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<p>No items found.</p>';
            return;
        }

        const html = this.items.map(item => this.createItemCard(item)).join('');
        container.innerHTML = `<div class="portfolio-grid">${html}</div>`;
    }

    /**
     * Render item detail
     */
    renderItemDetail(item) {
        const container = document.getElementById('web-page-container');
        // Hide grid, show detail
        const gridContainer = document.getElementById('web-pages-container');
        if (gridContainer) gridContainer.style.display = 'none';

        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = this.createItemDetailHtml(item);
    }

    /**
     * Create HTML for a portfolio card
     */
    createItemCard(item) {
        return `
            <article class="portfolio-card">
                ${item.image_url ? `
                <div class="card-image">
                    <img src="${item.image_url}" alt="${this.escapeHtml(item.title)}" loading="lazy" />
                </div>` : ''}
                <div class="card-content">
                    <h3><a href="#web-page-${item.id}" data-web-page-id="${item.id}">${this.escapeHtml(item.title)}</a></h3>
                    <p>${this.escapeHtml(item.description || '')}</p>
                    ${item.url ? `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="card-link">
                        Visit Project &rarr;
                    </a>` : ''}
                </div>
            </article>
        `;
    }

    /**
     * Create HTML for detail view
     */
    createItemDetailHtml(item) {
        return `
            <div class="portfolio-detail">
                <button onclick="window.location.reload()" class="back-button">&larr; Back to List</button>
                <h2>${this.escapeHtml(item.title)}</h2>
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="detail-image" />` : ''}
                <p class="detail-description">${this.escapeHtml(item.description)}</p>
                ${item.url ? `<a href="${item.url}" target="_blank" class="visit-button">Visit Website</a>` : ''}
            </div>
        `;
    }

    showLoading() {
        const container = document.getElementById('web-pages-container');
        if (container) container.innerHTML = '<p class="loading">Loading...</p>';
    }

    showError(message) {
        const container = document.getElementById('web-pages-container');
        if (container) container.innerHTML = `<p class="error">${message}</p>`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async updateLanguage(language) {
        this.currentLanguage = language;
        await this.loadItems();
    }
}

// Singleton
const webPagesManager = new WebPagesManager();

// Init
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('web-pages-container');
    if (container) {
        await webPagesManager.loadItems();

        // Language change listener
        const languageSwitcher = document.getElementById('languageSwitcher');
        if (languageSwitcher) {
            languageSwitcher.addEventListener('change', async (e) => {
                await webPagesManager.updateLanguage(e.target.value);
            });
        }

        // Click handler for details
        container.addEventListener('click', async (e) => {
            const link = e.target.closest('[data-web-page-id]');
            if (link) {
                e.preventDefault();
                const id = link.getAttribute('data-web-page-id');
                await webPagesManager.loadItemById(id);
            }
        });
    }
});

export default webPagesManager;
