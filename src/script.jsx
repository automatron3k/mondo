import { createRoot } from 'react-dom/client';
import React from 'react';

// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

Math.map = function (n, start, stop, start2, stop2) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

class AsciiFilter {
    constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
        this.renderer = renderer;
        this.domElement = document.createElement('div');
        this.domElement.style.position = 'absolute';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.width = '100%'; // desplaza diferentes capas del texto ASCII
        this.domElement.style.height = '100%';

        this.pre = document.createElement('pre');
        this.domElement.appendChild(this.pre);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.domElement.appendChild(this.canvas);

        this.deg = 0;
        this.invert = invert ?? true;
        this.fontSize = fontSize ?? 12;
        this.fontFamily = fontFamily ?? "'Courier New', monospace";
        this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@';

        this.context.webkitImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;

        this.onMouseMove = this.onMouseMove.bind(this);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        this.reset();

        this.center = { x: width / 2, y: height / 2 };
        this.mouse = { x: this.center.x, y: this.center.y };
    }

    reset() {
        this.context.font = `${this.fontSize}px ${this.fontFamily}`;
        const charWidth = this.context.measureText('A').width;

        this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
        this.rows = Math.floor(this.height / this.fontSize);

        this.canvas.width = this.cols;
        this.canvas.height = this.rows;
        this.pre.style.fontFamily = this.fontFamily;
        this.pre.style.fontSize = `${this.fontSize}px`;
        this.pre.style.margin = '0';
        this.pre.style.padding = '0';
        this.pre.style.lineHeight = '1em';
        this.pre.style.position = 'absolute';
        this.pre.style.left = '0';
        this.pre.style.top = '50%';
        this.pre.style.transform = 'translate(0, -50%)';
        this.pre.style.zIndex = '9';
        this.pre.style.backgroundAttachment = 'fixed';
        this.pre.style.mixBlendMode = 'difference';
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);

        const w = this.canvas.width;
        const h = this.canvas.height;
        this.context.clearRect(0, 0, w, h);
        if (this.context && w && h) {
            this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
        }

        this.asciify(this.context, w, h);
        this.hue();
    }

    onMouseMove(e) {
        this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    }

    get dx() {
        return this.mouse.x - this.center.x;
    }

    get dy() {
        return this.mouse.y - this.center.y;
    }

    hue() {
        const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
        this.deg += (deg - this.deg) * 0.075;
        this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
    }

    asciify(ctx, w, h) {
        if (w && h) {
            const imgData = ctx.getImageData(0, 0, w, h).data;
            let str = '';
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = x * 4 + y * 4 * w;
                    const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

                    if (a === 0) {
                        str += ' ';
                        continue;
                    }

                    let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
                    let idx = Math.floor((1 - gray) * (this.charset.length - 1));
                    if (this.invert) idx = this.charset.length - idx - 1;
                    str += this.charset[idx];
                }
                str += '\n';
            }
            this.pre.innerHTML = str;
        }
    }

    dispose() {
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}

class CanvasTxt {
    constructor(txt, { fontSize = 200, fontFamily = 'Arial', color = '#f6e7d2ff' } = {}) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.txt = txt;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;

        this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
    }

    resize() {
        this.context.font = this.font;
        const metrics = this.context.measureText(this.txt);

        const textWidth = Math.ceil(metrics.width) + 20;
        const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;

        this.canvas.width = textWidth;
        this.canvas.height = textHeight;
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.color;
        this.context.font = this.font;

        const metrics = this.context.measureText(this.txt);
        const yPos = 10 + metrics.actualBoundingBoxAscent;

        this.context.fillText(this.txt, 10, yPos);
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    get texture() {
        return this.canvas;
    }
}

class CanvAscii {
    constructor(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, reactiveness },
        containerElem,
        width,
        height
    ) {
        this.textString = text;
        this.asciiFontSize = asciiFontSize;
        this.textFontSize = textFontSize;
        this.textColor = textColor;
        this.planeBaseHeight = planeBaseHeight;
        this.enableWaves = enableWaves;
        this.reactiveness = reactiveness;
        this.container = containerElem;
        this.width = width;
        this.height = height;

        this.camera = new THREE.PerspectiveCamera(47, this.width / this.height, 1, 100);
        this.camera.position.z = 20;

        this.scene = new THREE.Scene();
        this.mouse = { x: 0, y: 0 };

        this.onMouseMove = this.onMouseMove.bind(this);

        this.setMesh();
        this.setRenderer();
    }

    setMesh() {
        this.textCanvas = new CanvasTxt(this.textString, {
            fontSize: this.textFontSize,
            fontFamily: 'IBM Plex Mono',
            color: this.textColor
        });
        this.textCanvas.resize();
        this.textCanvas.render();

        this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
        this.texture.minFilter = THREE.NearestFilter;

        const textAspect = this.textCanvas.width / this.textCanvas.height;
        const baseH = this.planeBaseHeight;
        const planeW = baseH * textAspect;
        const planeH = baseH;

        this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                mouse: { value: 1.0 },
                uTexture: { value: this.texture },
                uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
            }
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        this.renderer.setPixelRatio(1);
        this.renderer.setClearColor(0x000000, 0);

        this.filter = new AsciiFilter(this.renderer, {
            fontFamily: 'IBM Plex Mono',
            fontSize: this.asciiFontSize,
            invert: true
        });

        this.container.appendChild(this.filter.domElement);
        this.setSize(this.width, this.height);

        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('touchmove', this.onMouseMove);
    }

    setSize(w, h) {
        this.width = w;
        this.height = h;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        this.filter.setSize(w, h);

        this.center = { x: w / 2, y: h / 2 };
    }

    load() {
        this.animate();
    }

    onMouseMove(evt) {
        const e = evt.touches ? evt.touches[0] : evt;
        const bounds = this.container.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        this.mouse = { x, y };
    }

    animate() {
        const animateFrame = () => {
            this.animationFrameId = requestAnimationFrame(animateFrame);
            this.render();
        };
        animateFrame();
    }

    render() {
        const time = new Date().getTime() * 0.001;

        this.textCanvas.render();
        this.texture.needsUpdate = true;

        this.mesh.material.uniforms.uTime.value = Math.sin(time);

        this.updateRotation();
        this.filter.render(this.scene, this.camera);
    }

    updateRotation() {
        const x = Math.map(this.mouse.y, 0, this.height, 0.5, -0.5) * this.reactiveness;
        const y = Math.map(this.mouse.x, 0, this.width, -0.5, 0.5) * this.reactiveness;

        this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
        this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
    }

    clear() {
        this.scene.traverse(obj => {
            if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
                Object.keys(obj.material).forEach(key => {
                    const matProp = obj.material[key];
                    if (matProp !== null && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
                        matProp.dispose();
                    }
                });
                obj.material.dispose();
                obj.geometry.dispose();
            }
        });
        this.scene.clear();
    }

    dispose() {
        cancelAnimationFrame(this.animationFrameId);
        this.filter.dispose();
        this.container.removeChild(this.filter.domElement);
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('touchmove', this.onMouseMove);
        this.clear();
        this.renderer.dispose();
    }
}

export default function ASCIIText({
    text = 'David!',
    asciiFontSize = 8,
    textFontSize = 200,
    textColor = '#fdf9f3',
    planeBaseHeight = 8,
    enableWaves = true,
    reactiveness = 1.0
}) {
    const containerRef = useRef(null);
    const asciiRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const initializeAscii = (w, h) => {
            if (asciiRef.current) {
                asciiRef.current.dispose();
            }
            asciiRef.current = new CanvAscii(
                { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, reactiveness },
                containerRef.current,
                w,
                h
            );
            asciiRef.current.load();

            return () => {
                if (asciiRef.current) {
                    asciiRef.current.dispose();
                }
            };
        };

        const { width, height } = containerRef.current.getBoundingClientRect();

        if (width === 0 || height === 0) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
                        const { width: w, height: h } = entry.boundingClientRect;

                        // Add small delay to ensure CSS is fully applied
                        setTimeout(() => {
                            initializeAscii(w, h);
                        }, 100);

                        observer.disconnect();
                    }
                },
                { threshold: 0.1 }
            );

            observer.observe(containerRef.current);

            return () => {
                observer.disconnect();
                if (asciiRef.current) {
                    asciiRef.current.dispose();
                }
            };
        }

        // Add small delay for initial render to ensure CSS is loaded
        const timeoutId = setTimeout(() => {
            const cleanupResize = initializeAscii(width, height);

            // Add ResizeObserver to handle container size changes
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width: w, height: h } = entry.contentRect;
                    if (w > 0 && h > 0 && asciiRef.current) {
                        asciiRef.current.setSize(w, h);
                    }
                }
            });

            resizeObserver.observe(containerRef.current);

            return () => {
                if (cleanupResize) {
                    cleanupResize();
                }
                resizeObserver.disconnect();
            };
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (asciiRef.current) {
                asciiRef.current.dispose();
            }
        };
    }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, reactiveness]);

    return (
        <div
            ref={containerRef}
            className="ascii-text-container"
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%' // este cambia el tamaño que ocupa la imagen dentro del contenedor
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap');

        .ascii-text-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #3A6EA5 0%, #4BAF75 50%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
        </div>
    );
}

// Mount the component
const container = document.getElementById('react-hero');
if (container) {
    createRoot(container).render(
        <ASCIIText
            text="MONDO"
            asciiFontSize={2} // entre más bajo más HD
            textFontSize={200}
            textColor="#ffffff"
            enableWaves={false}
            reactiveness={0.7}
        />
    );
}

import DitherBackground from './DitherBackground.jsx';
import DecryptedText from './ScrambleText';

const taglineData = {
    spa: { prefix: 'Desarrollo web:', words: ['social', 'open-source', 'cultural', 'humano', 'low-code', 'full-stack'] },
    eng: { prefix: 'Web development:', words: ['social', 'open-source', 'cultural', 'human', 'low-code', 'full-stack'] },
    pt: { prefix: 'Desenvolvimento web:', words: ['social', 'open-source', 'cultural', 'humano', 'low-code', 'full-stack'] },
    fr: { prefix: 'Développement web:', words: ['social', 'open-source', 'culturel', 'humain', 'low-code', 'full-stack'] },
    jap: { prefix: 'ウェブ開発：', words: ['社会的', 'オープンソース', '文化的', '人間的', 'ローコード', 'フルスタック'] }
};

function Tagline() {
    const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'spa');
    // Sanitize language: if unknown, fallback to 'spa' to avoid crashes
    const safeLang = taglineData[currentLanguage] ? currentLanguage : 'spa';

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
            pixelSize={4.0}
        />
    );
}

// Translations object
const translations = {
    spa: {
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
    eng: {
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
    jap: {
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
            // Use innerHTML for elements that may contain HTML tags (like <br>)
            element.innerHTML = translations[language][key];
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
    const savedLanguage = localStorage.getItem('language') || 'eng';

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

    if (ctaButton && modal) {
        // Open modal
        ctaButton.addEventListener('click', () => {
            modal.classList.add('active');
        });

        // Close modal on X button
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
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
