import { createRoot } from 'react-dom/client';
import React from 'react';

import { useState, useEffect } from 'react';

import DitherBackground from './DitherBackground.jsx';
import DecryptedText from './ScrambleText';

const taglineData = {
    es: { prefix: 'Desarrollo web: ', words: ['social', 'open-source', 'cultural', 'humano', 'low-code', 'full-stack'] },
    en: { prefix: 'Web development: ', words: ['social', 'open-source', 'cultural', 'human', 'low-code', 'full-stack'] },
    pt: { prefix: 'Desenvolvimento web: ', words: ['social', 'open-source', 'cultural', 'humano', 'low-code', 'full-stack'] },
    fr: { prefix: 'Développement web: ', words: ['social', 'open-source', 'culturel', 'humain', 'low-code', 'full-stack'] },
    jp: { prefix: 'ウェブ開発: ', words: ['社会的', 'オープンソース', '文化的', '人間的', 'ローコード', 'フルスタック'] }
};

function Tagline() {
    const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'en');
    // Sanitize language: if unknown, fallback to 'spa' to avoid crashes
    const safeLang = taglineData[currentLanguage] ? currentLanguage : 'en';

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const handleLanguageChange = (e) => {
            if (taglineData[e.detail]) {
                setCurrentLanguage(e.detail);
                setIndex(0); // Reset word index on language change
            }
        };

        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    useEffect(() => {
        const words = taglineData[safeLang].words;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000); // 3 seconds total cycle
        return () => clearInterval(interval);
    }, [safeLang]);

    const { prefix, words } = taglineData[safeLang];

    return (
        <div className="tagline">
            <span className="tagline-prefix">{prefix}</span>
            <span className="tagline-word">
                <DecryptedText
                    key={`${safeLang}-${index}`} // Force re-mount on word/lang change to restart animation
                    text={words[index]}
                    speed={120}
                    maxIterations={7}
                />
            </span>
        </div>
    );
}

const taglineRoot = document.getElementById('tagline-root');
if (taglineRoot) {
    createRoot(taglineRoot).render(<Tagline />);
}

// Mount Dither Background
const ditherRoot = document.getElementById('dither-background');
if (ditherRoot) {
    createRoot(ditherRoot).render(
        <DitherBackground
            waveColor={[0.5, 0.5, 0.5]}
            pixelSize={5.0}
        />
    );
}

// Translations object
const translations = {
    es: {
        'dark': 'Oscuro',
        'light': 'Claro',
        'inicio': 'Inicio',
        'what-we-do': 'Qué hacemos',
        'portfolio': 'Portafolio',
        'art': 'Arte',
        'web-pages': 'Páginas',
        'web-apps': 'Aplicaciones',
        'web-widgets': 'Widgets',
        'plugins': 'Plugins',
        'security': 'Seguro',
        'open-source': 'Open-source',
        'custom-made': 'Hecho a medida',
        'scalability': 'Escalable',
        'what-we-do-description': 'Combinamos lo mejor del low-code y el high-code para construir plataformas sólidas, escalables, seguras y visualmente atractivas, listas para crecer con tu proyecto.<br><br>Priorizamos tecnologías y herramientas open-source, porque creemos en la transparencia, la estabilidad y la autonomía tecnológica a largo plazo.<br><br>El usuario es el centro de nuestro trabajo, cada solución es única y está pensada para una óptima experiencia de usuario.<br>',
        'security-tokens': 'Tokens seguros',
        'security-roles': 'Roles diferenciados',
        'security-encryption': 'Encriptación de datos',
        'opensource-version-control': 'Control de versiones',
        'opensource-communities': 'Comunidades activas',
        'opensource-components': 'Miles de componentes',
        'custom-visuals': 'Visuales adaptables',
        'custom-functions': 'Funciones personalizadas',
        'custom-reviews': 'Revisiones periódicas',
        'scalability-nature': 'Escalable por naturaleza',
        'scalability-architecture': 'Flexibilidad de arquitectura',
        'scalability-schemas': 'Schemas inteligentes',
        'cta-button': 'Quiero saber más',
        'copyright': '© 2025 Mondo. Todos los derechos reservados.'
    },
    en: {
        'dark': 'Dark',
        'light': 'Light',
        'inicio': 'Home',
        'what-we-do': 'What we do',
        'portfolio': 'Portfolio',
        'art': 'Art',
        'web-pages': 'Web Pages',
        'web-apps': 'Web Apps',
        'web-widgets': 'Web Widgets',
        'security': 'Secure',
        'open-source': 'Open-source',
        'custom-made': 'Custom Made',
        'scalability': 'Scalable',
        'what-we-do-description': 'We combine the best of low-code and high-code to build solid, scalable, secure and visually appealing platforms, ready to grow with your project.<br><br>We prioritize open-source technologies and tools, because we believe in transparency, stability and long-term technological autonomy.<br><br>User experience is a priority.<br>Each solution is unique and custom-made to meet your needs.',
        'security-tokens': 'Secure tokens',
        'security-roles': 'Differentiated roles',
        'security-encryption': 'Data encryption',
        'opensource-version-control': 'Version control',
        'opensource-communities': 'Active communities',
        'opensource-components': 'Thousands of components',
        'custom-visuals': 'Adaptable visuals',
        'custom-functions': 'Custom functions',
        'custom-reviews': 'Periodic reviews',
        'scalability-nature': 'Scalable by nature',
        'scalability-architecture': 'Architecture flexibility',
        'scalability-schemas': 'Smart schemas',
        'cta-button': 'I want to know more',
        'modal-title': 'Contact Us',
        'modal-description': 'Fill out the form and we will get in touch with you.',
        'copyright': '© 2025 Mondo. All rights reserved.'
    },
    pt: {
        'dark': 'Escuro',
        'light': 'Claro',
        'inicio': 'Início',
        'what-we-do': 'O que fazemos',
        'portfolio': 'Portfólio',
        'art': 'Arte',
        'web-pages': 'Páginas',
        'web-apps': 'Aplicativos',
        'web-widgets': 'Widgets',
        'security': 'Seguro',
        'open-source': 'Código aberto',
        'custom-made': 'Feito sob medida',
        'scalability': 'Escalável',
        'what-we-do-description': 'Combinamos o melhor do low-code e high-code para construir plataformas sólidas, escaláveis, seguras e visualmente atraentes, prontas para crescer com seu projeto.<br><br>Priorizamos tecnologias e ferramentas de código aberto, porque acreditamos na transparência, estabilidade e autonomia tecnológica a longo prazo.<br><br>A experiência do usuário é prioridade.<br>Cada solução é única e feita sob medida para atender suas necessidades.',
        'security-tokens': 'Tokens seguros',
        'security-roles': 'Funções diferenciadas',
        'security-encryption': 'Criptografia de dados',
        'opensource-version-control': 'Controle de versão',
        'opensource-communities': 'Comunidades ativas',
        'opensource-components': 'Milhares de componentes',
        'custom-visuals': 'Visuais adaptáveis',
        'custom-functions': 'Funções personalizadas',
        'custom-reviews': 'Revisões periódicas',
        'scalability-nature': 'Escalável por natureza',
        'scalability-architecture': 'Flexibilidade de arquitetura',
        'scalability-schemas': 'Schemas inteligentes',
        'cta-button': 'Quiero saber mais',
        'copyright': '© 2025 Mondo. Todos os direitos reservados.'
    },
    fr: {
        'dark': 'Sombre',
        'light': 'Clair',
        'inicio': 'Accueil',
        'what-we-do': 'Que faisons-nous',
        'portfolio': 'Portfolio',
        'art': 'Art',
        'web-pages': 'Pages web',
        'web-apps': 'Applications web',
        'web-widgets': 'Widgets web',
        'security': 'Sécure',
        'open-source': 'Open-source',
        'custom-made': 'Sur mesure',
        'scalability': 'Évolutive',
        'what-we-do-description': 'Nous combinons le meilleur du low-code et du high-code pour construire des plateformes solides, évolutives, sécurisées et visuellement attrayantes, prêtes à grandir avec votre projet.<br><br>Nous privilégions les technologies et outils open-source, car nous croyons en la transparence, la stabilité et l\'autonomie technologique à long terme.<br><br>L\'expérience utilisateur est une priorité.<br>Chaque solution est unique et sur mesure pour répondre à vos besoins.',
        'security-tokens': 'Jetons sécurisés',
        'security-roles': 'Rôles différenciés',
        'security-encryption': 'Chiffrement des données',
        'opensource-version-control': 'Contrôle de version',
        'opensource-communities': 'Communautés actives',
        'opensource-components': 'Des milliers de composants',
        'custom-visuals': 'Visuels adaptables',
        'custom-functions': 'Fonctions personnalisées',
        'custom-reviews': 'Révisions périodiques',
        'scalability-nature': 'Évolutif par nature',
        'scalability-architecture': 'Flexibilité d\'architecture',
        'scalability-schemas': 'Schémas intelligents',
        'cta-button': 'Je veux en savoir plus',
        'modal-title': 'Contactez-nous',
        'modal-description': 'Remplissez le formulaire et nous vous contacterons.',
        'copyright': '© 2025 Mondo. Tous droits réservés.'
    },
    jp: {
        'dark': 'ダーク',
        'light': 'ライト',
        'inicio': 'ホーム',
        'what-we-do': '私たちは何をしますか',
        'portfolio': 'ポートフォリオ',
        'art': '芸術',
        'web-pages': 'ウェブページ',
        'web-apps': 'ウェブアプリ',
        'web-widgets': 'ウェブウィジェット',
        'plugins': 'プラグイン',
        'security': 'セキュリティ',
        'open-source': 'オープンソース',
        'custom-made': '特注',
        'scalability': 'スケーラブル',
        'what-we-do-description': 'ローコードとハイコードの最良の部分を組み合わせて、プロジェクトとともに成長できる堅牢でスケーラブルで安全で視覚的に魅力的なプラットフォームを構築します。<br><br>透明性、安定性、長期的な技術的自律性を信じているため、オープンソースの技術とツールを優先します。<br><br>ユーザーエクスペリエンスが優先事項です。<br>各ソリューションはユニークでニーズに合わせてカスタムメイドされています。',
        'security-tokens': '安全なトークン',
        'security-roles': '差別化された役割',
        'security-encryption': 'データ暗号化',
        'opensource-version-control': 'バージョン管理',
        'opensource-communities': 'アクティブなコミュニティ',
        'opensource-components': '何千ものコンポーネント',
        'custom-visuals': '適応可能なビジュアル',
        'custom-functions': 'カスタム機能',
        'custom-reviews': '定期的なレビュー',
        'scalability-nature': '本質的にスケーラブル',
        'scalability-architecture': 'アーキテクチャの柔軟性',
        'scalability-schemas': 'スマートスキーマ',
        'cta-button': 'もっと知りたい',
        'modal-title': 'お問い合わせ',
        'modal-description': 'フォームに記入していただければ、ご連絡いたします。',
        'copyright': '© 2025 Mondo. 全著作権所有。'
    }
};

/**
 * Detecta el idioma del usuario y aplica las traducciones
 */
function autoDetectLanguage() {
    // 1. Prioridad: Idioma guardado manualmente antes (si el usuario ya eligió uno)
    const savedLang = localStorage.getItem('userSelectedLang');
    
    // 2. Segunda opción: Idioma del navegador (ej: "es-ES" -> "es")
    const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
    
    // 3. Verificar si el idioma detectado existe en tu objeto translations
    const availableLanguages = Object.keys(translations);
    
    let langToApply = 'en'; // Default por defecto

    if (savedLang && availableLanguages.includes(savedLang)) {
        langToApply = savedLang;
    } else if (availableLanguages.includes(browserLang)) {
        langToApply = browserLang;
    }

    // 4. Ejecutar tu función de traducción
    translatePage(langToApply);
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', autoDetectLanguage);

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
            // Special handling for CTA button to preserve icon
            if (element.id === 'cta-button') {
                const textSpan = element.querySelector('span');
                if (textSpan) {
                    textSpan.innerHTML = translations[language][key];
                }
            } else {
                element.innerHTML = translations[language][key];
            }
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
    localStorage.setItem('userSelectedLang', language);
    document.documentElement.lang = language; // Buena práctica para SEO y accesibilidad
}

// Theme toggle functionality (run first to set theme attribute)
(function () {
    const themeCheckbox = document.getElementById('themeToggleCheckbox');
    const html = document.documentElement;

    // Get saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme on page load
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (themeCheckbox) themeCheckbox.checked = true;
    } else {
        html.setAttribute('data-theme', 'light');
        if (themeCheckbox) themeCheckbox.checked = false;
    }

    // Toggle theme on checkbox change
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function () {
            const newTheme = this.checked ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
})();

// Language switcher functionality
(function () {
    const languageSwitcher = document.getElementById('languageSwitcher');
    const html = document.documentElement;

    // Get saved language preference or default to Spanish
    const savedLanguage = localStorage.getItem('language') || 'en';

    // Apply saved language on page load
    languageSwitcher.value = savedLanguage;
    html.setAttribute('lang', savedLanguage);
    translatePage(savedLanguage);

    // Prevent scroll jump when clicking the dropdown
    languageSwitcher.addEventListener('mousedown', function (e) {
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Restore scroll position after browser tries to scroll
        setTimeout(() => {
            window.scrollTo(scrollX, scrollY);
        }, 0);
    });

    // Handle language change
    languageSwitcher.addEventListener('change', function () {
        const selectedLanguage = this.value;
        html.setAttribute('lang', selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        translatePage(selectedLanguage);

        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('languageChange', { detail: selectedLanguage }));
    });
})();

// Burger Menu functionality
(function () {
    const burgerMenu = document.getElementById('burgerMenu');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    document.body.appendChild(overlay);

    function toggleMenu() {
        const isActive = burgerMenu.classList.contains('active');

        if (isActive) {
            // Close menu
            burgerMenu.classList.remove('active');
            mainNav.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        } else {
            // Open menu
            burgerMenu.classList.add('active');
            mainNav.classList.add('active');
            overlay.classList.add('active');
            body.style.overflow = 'hidden';
        }
    }

    function closeMenu() {
        burgerMenu.classList.remove('active');
        mainNav.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }

    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', toggleMenu);

        // Close menu when clicking overlay
        overlay.addEventListener('click', closeMenu);

        // Close menu when clicking a nav link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to allow smooth transition
                setTimeout(closeMenu, 100);
            });
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && burgerMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
})();

// Smooth scrolling handler (intercepts anchor clicks and respects header offset)
(function () {
    function getHeaderOffset() {
        const val = getComputedStyle(document.documentElement).getPropertyValue('scroll-padding-top') || '0px';
        const px = parseInt(val.trim(), 10);
        return Number.isNaN(px) ? 0 : px;
    }

    function scrollToHash(hash) {
        if (!hash) return;
        const id = hash.replace('#', '');
        const target = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
        if (!target) return;
        const offset = getHeaderOffset();
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    document.addEventListener('click', function (e) {
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href === '#') return;

        // Resolve relative hash to absolute so we only intercept same-page anchors
        const url = new URL(href, location.href);
        if (url.pathname === location.pathname && url.search === location.search) {
            e.preventDefault();
            // Use pushState so URL updates without page jump
            history.pushState(null, '', url.hash);
            scrollToHash(url.hash);
        }
    });

    // On page load with existing hash, scroll after a short delay
    if (location.hash) {
        setTimeout(() => scrollToHash(location.hash), 60);
    }
})();

// Import Web Pages Controller
import './webPages.js';

// Custom notification function
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = notification.querySelector('.notification-message');

    messageEl.textContent = message;
    notification.className = `notification active ${type}`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// Modal and form handling
(function () {
    const ctaButton = document.getElementById('cta-button');
    const modal = document.getElementById('contact-modal');
    const closeButton = document.querySelector('.modal-close');

    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            if (modal) { // Ensure modal exists before trying to open it
                modal.classList.add('active');
                ctaButton.classList.add('modal-active'); // Hide CTA
            }
        });

        // Scroll listener for morphing effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                ctaButton.classList.add('scrolled');
            } else {
                ctaButton.classList.remove('scrolled');
            }
        });
    }

    if (modal) { // Only proceed with modal-specific logic if modal exists
        // Close modal on X button
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.classList.remove('active');
                if (ctaButton) ctaButton.classList.remove('modal-active'); // Show CTA
            });
        }

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (ctaButton) ctaButton.classList.remove('modal-active'); // Show CTA
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });

        // Handle form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Get form data
                const formData = {
                    name: document.getElementById('name').value,
                    organization: document.getElementById('organization').value || null,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value || null,
                    message: document.getElementById('message').value || null,
                    sendCopy: document.getElementById('copy').checked
                };

                // Disable submit button during submission
                const submitButton = contactForm.querySelector('.submit-button');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                try {
                    const response = await fetch('http://localhost:5001/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    console.log('Response status:', response.status);
                    console.log('Response OK:', response.ok);

                    if (response.ok) {
                        // Success - reset form and close modal
                        contactForm.reset();
                        modal.classList.remove('active');
                        if (ctaButton) ctaButton.classList.remove('modal-active'); // Show CTA
                        showNotification('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.', 'success');
                    } else {
                        const errorText = await response.text();
                        console.error('Error response:', errorText);
                        throw new Error(`Error ${response.status}: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Full error:', error);
                    showNotification('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.', 'error');
                } finally {
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            });
        }
    }
})();

(async function () {
    try {
        const container = document.getElementById('portfolio-container');
        if (!container) return;

        const response = await fetch('http://localhost:5001/api/portfolio');
        const data = await response.json();

        container.innerHTML = data.map(project => `
            <article class="portfolio-card">
                <div class="card-content">
                    <h1 class="client-label">${project.client || 'Personal Project'}</h1>
                    
                    <h2 class="project-title">
                        <a href="${project['project-url'] || '#'}" target="_blank">
                            ${project.title}
                        </a>
                    </h2>

                    <p class="project-description">${project.description || ''}</p>

                    <div class="metadata-row">
                        <span class="pill">${project.category}</span>
                        <span class="pill">${project.year}</span>
                        ${project.technologies ?
                (Array.isArray(project.technologies) ? project.technologies : project.technologies.split(','))
                    .map(tech => `<span class="pill tech-pill">${tech.trim()}</span>`).join('')
                : ''
            }
                    </div>
                </div>
            </article>
        `).join('');
    } catch (err) {
        console.warn("Portfolio load failed:", err);
    }
})();