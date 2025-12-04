// Translations object
const translations = {
    spa: {
        'title': 'Mondo - Como este mundo, pero más redondo',
        'dark': 'Oscuro',
        'light': 'Claro',
        'inicio': 'Inicio',
        'web-pages': 'Páginas web',
        'web-apps': 'Aplicaciones web',
        'web-widgets': 'Widgets web',
        'plugins': 'Plugins',
        'tagline': 'Desarrollo web: social, cultural, gentil',
        'copyright': '© 2025 Mondo. Todos los derechos reservados.'
    },
    eng: {
        'title': 'Mondo - Like this world, but rounder',
        'dark': 'Dark',
        'light': 'Light',
        'inicio': 'Home',
        'web-pages': 'Web pages',
        'web-apps': 'Web apps',
        'web-widgets': 'Web widgets',
        'plugins': 'Plugins',
        'tagline': 'Web development: social, cultural, gentle',
        'copyright': '© 2025 Mondo. All rights reserved.'
    },
    pt: {
        'title': 'Mondo - Como este mundo, mas redondo',
        'dark': 'Escuro',
        'light': 'Claro',
        'inicio': 'Início',
        'web-pages': 'Páginas web',
        'web-apps': 'Aplicações web',
        'web-widgets': 'Widgets web',
        'plugins': 'Plugins',
        'tagline': 'Desenvolvimento web: social, cultural, gentil',
        'copyright': '© 2025 Mondo. Todos os direitos reservados.'
    },
    fr: {
        'title': 'Mondo - Comme ce monde, mais plus rond',
        'dark': 'Sombre',
        'light': 'Clair',
        'inicio': 'Accueil',
        'web-pages': 'Pages web',
        'web-apps': 'Applications web',
        'web-widgets': 'Widgets web',
        'plugins': 'Plugins',
        'tagline': 'Développement web: social, culturel, bienveillant',
        'copyright': '© 2025 Mondo. Tous droits réservés.'
    },
    jap: {
        'title': 'Mondo - この世界のように、しかしより丸い',
        'dark': 'ダーク',
        'light': 'ライト',
        'inicio': 'ホーム',
        'web-pages': 'ウェブページ',
        'web-apps': 'ウェブアプリ',
        'web-widgets': 'ウェブウィジェット',
        'plugins': 'プラグイン',
        'tagline': '社会的、文化的、優しいウェブ開発',
        'copyright': '© 2025 Mondo. 全著作権所有。'
    }
};

// Shared translate function
function translatePage(language) {
    const elements = document.querySelectorAll('[data-i18n]');
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const themeText = document.getElementById('themeText');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Skip themeText - it will be handled separately based on current theme
        if (element.id === 'themeText') {
            return;
        }
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    
    // Update theme button text based on current theme
    if (themeText) {
        if (currentTheme === 'dark') {
            themeText.textContent = translations[language]['light'];
        } else {
            themeText.textContent = translations[language]['dark'];
        }
    }
}

// Theme toggle functionality (run first to set theme attribute)
(function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const html = document.documentElement;

    // Get saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme on page load
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌔';
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌘';
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const currentLanguage = localStorage.getItem('language') || 'spa';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update button text and icon
        if (newTheme === 'dark') {
            themeIcon.textContent = '🌔';
            themeText.textContent = translations[currentLanguage]['light'];
        } else {
            themeIcon.textContent = '🌘';
            themeText.textContent = translations[currentLanguage]['dark'];
        }
    });
})();

// Language switcher functionality
(function() {
    const languageSwitcher = document.getElementById('languageSwitcher');
    const html = document.documentElement;

    // Get saved language preference or default to Spanish
    const savedLanguage = localStorage.getItem('language') || 'eng';
    
    // Apply saved language on page load
    languageSwitcher.value = savedLanguage;
    html.setAttribute('lang', savedLanguage);
    translatePage(savedLanguage);

    // Handle language change
    languageSwitcher.addEventListener('change', function() {
        const selectedLanguage = this.value;
        html.setAttribute('lang', selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        translatePage(selectedLanguage);
    });
})();
