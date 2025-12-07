import React, { useState, useEffect, useRef } from 'react';

const characters = 'javierlabordemondo={}[]%#"!"?¿;«»_*+¬∞•~∫≈ß∂ƒλ~πøı¥†';

export default function DecryptedText({
    text,
    speed = 30,
    maxIterations = 10,
    revealDirection = 'start', // 'start', 'end', 'center', 'random'
    animateOnMount = true,
    className = ''
}) {
    // Determine initial content: if animating, start with random garbage
    const [displayText, setDisplayText] = useState(() => {
        if (!animateOnMount) return text;
        return text.split('').map((char) => {
            if (char === ' ') return ' ';
            return characters[Math.floor(Math.random() * characters.length)];
        }).join('');
    });

    const [isScrambling, setIsScrambling] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        let iteration = 0;
        const totalIterations = maxIterations + text.length;

        if (intervalRef.current) clearInterval(intervalRef.current);

        setIsScrambling(true);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev => {
                let nextText = text.split('').map((char, index) => {
                    if (char === ' ') return ' ';

                    // Logic to determine if this character should be revealed
                    let shouldReveal = false;

                    /* 
                       Simple progressive reveal based on iteration count relative to maxIterations.
                       For a more complex "scramble then reveal" effect layer by layer, 
                       we check if the current iteration is past a threshold for this index.
                    */

                    if (iteration >= maxIterations + index) {
                        shouldReveal = true;
                    }

                    if (shouldReveal) {
                        return char;
                    }

                    // To reduce "craziness", only change the random character every 2nd frame or so if needed,
                    // but with speed=30 it should be fine. We can limit the charset if requested.
                    return characters[Math.floor(Math.random() * characters.length)];
                }).join('');

                if (iteration >= totalIterations) {
                    clearInterval(intervalRef.current);
                    setIsScrambling(false);
                    return text;
                }

                iteration += 2; // Linear progression for predictable timing
                return nextText;
            });

        }, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, speed, maxIterations]);

    return (
        <span className={className}>
            {displayText}
        </span>
    );
}
