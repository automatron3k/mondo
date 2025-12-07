import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform vec3 uColor;
uniform vec2 uMouse; // Mouse position (0-1)

varying vec2 vUv;

// Bayer Matrix 4x4 for ordered dithering
float bayer4x4(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    
    // Flattened 4x4 matrix
    //  0  8  2 10
    // 12  4 14  6
    //  3 11  1  9
    // 15  7 13  5
    
    int index = y * 4 + x;
    float value = 0.0;
    
    if (index == 0) value = 0.0;
    else if (index == 1) value = 8.0;
    else if (index == 2) value = 2.0;
    else if (index == 3) value = 10.0;
    else if (index == 4) value = 12.0;
    else if (index == 5) value = 4.0;
    else if (index == 6) value = 14.0;
    else if (index == 7) value = 6.0;
    else if (index == 8) value = 3.0;
    else if (index == 9) value = 11.0;
    else if (index == 10) value = 1.0;
    else if (index == 11) value = 9.0;
    else if (index == 12) value = 15.0;
    else if (index == 13) value = 7.0;
    else if (index == 14) value = 13.0;
    else if (index == 15) value = 5.0;
    
    return value / 16.0;
}

void main() {
    // Pixelate UVs
    vec2 pixelUV = floor(vUv * uResolution / uPixelSize) * uPixelSize / uResolution;
    
    // Calculate distance to mouse
    float dist = distance(pixelUV, uMouse);
    float interaction = smoothstep(0.4, 0.0, dist); // Radius of influence
    
    // Wave animation based on time, position, and mouse interaction
    // The interaction term adds a phase shift to the waves
    float wave1 = sin(pixelUV.x * 10.0 + uTime * 0.5 + interaction * 2.0);
    float wave2 = cos(pixelUV.y * 10.0 + uTime * 0.3 + interaction * 1.5);
    float pattern = (wave1 + wave2 + 2.0) * 0.15; // Normalize roughly to 0-1 range
    
    // Get screen pixel coordinates for aligned dithering
    vec2 screenCoord = gl_FragCoord.xy / uPixelSize;
    
    // Get dither threshold
    float threshold = bayer4x4(screenCoord);
    
    // Apply threshold
    float strength = step(threshold, pattern);
    
    // Mix background (transparent/faint) with color
    // We output opacity based on strength to allow layering
    gl_FragColor = vec4(uColor, strength * 0.15); // Low opacity for subtle background
}
`;

export default function DitherBackground({
    waveColor = [0.5, 0.5, 0.5],
    pixelSize = 4.0
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup Scene
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create Plane
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uPixelSize: { value: pixelSize },
                uColor: { value: new THREE.Vector3(...waveColor) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) } // Initialize center
            },
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation Loop
        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            material.uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
        };
        animate();

        // Handle Resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            renderer.setSize(width, height);
            material.uniforms.uResolution.value.set(width, height);
            // Orthographic camera doesn't need aspect update for full screen quad 
            // but if we were using perspective it would.
        };

        window.addEventListener('resize', handleResize);

        // Handle Mouse Move
        const handleMouseMove = (e) => {
            // Normalize mouse coordinates to 0-1 (UV space)
            // UV (0,0) is bottom-left, but standard mouse (0,0) is top-left
            // So y needs to be inverted: 1.0 - (y / height)
            const x = e.clientX / window.innerWidth;
            const y = 1.0 - (e.clientY / window.innerHeight);
            material.uniforms.uMouse.value.set(x, y);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [waveColor, pixelSize]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none'
            }}
        />
    );
}
