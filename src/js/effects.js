const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createHeart = (container, options = {}) => {
    if (!container) return null;
    const heart = document.createElement('div');
    heart.classList.add(...(options.className || 'heart').split(/\s+/));
    if (options.fixed) {
        heart.style.position = 'fixed';
    }
    if (options.left !== undefined) heart.style.left = options.left;
    if (options.top !== undefined) heart.style.top = options.top;
    if (options.scale !== undefined) heart.style.transform = `scale(${options.scale})`;
    if (options.opacity !== undefined) heart.style.opacity = options.opacity;
    if (options.animationDuration) heart.style.animationDuration = options.animationDuration;
    container.appendChild(heart);
    const lifetime = options.lifetime || 4000;
    setTimeout(() => heart.remove(), lifetime);
    return heart;
};

const createHeartBurst = (element, count = 15) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 15;
            const duration = Math.random() * 0.4 + 0.4;
            const heart = createHeart(document.body, {
                className: 'heart',
                fixed: true,
                left: `${centerX}px`,
                top: `${centerY}px`,
                scale: 0.5,
                opacity: 0.8,
                lifetime: duration * 1000
            });
            if (heart) {
                heart.animate([
                    { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.8 },
                    { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: duration * 1000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)'
                });
            }
        }, i * 80);
    }
};

const createButtonHeartEffect = (button) => {
    if (!button || button.style.display === 'none') return;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const angle = (i / 8) * Math.PI * 2;
            const offsetX = Math.cos(angle) * (buttonWidth / 1.5);
            const offsetY = Math.sin(angle) * (buttonHeight / 1.2);
            const heart = createHeart(document.body, {
                className: 'heart button-heart',
                fixed: true,
                left: `${centerX + offsetX}px`,
                top: `${centerY + offsetY}px`,
                opacity: 0,
                lifetime: 1200
            });
            if (heart) {
                heart.style.transform = 'translate(-50%, -50%) scale(0)';
                heart.animate([
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
                    { transform: 'translate(-50%, -50%) scale(0.7)', opacity: 0.9, offset: 0.4 },
                    { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.7, offset: 0.8 },
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
                ], {
                    duration: 1200,
                    easing: 'ease-in-out'
                });
            }
        }, i * 100);
    }
};

const sprinkleHearts = (container, count = 15) => {
    if (!container) return;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = createHeart(container, {
                left: `${Math.random() * 100}%`,
                top: '100%',
                animationDuration: `${Math.random() * 2 + 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
                scale: Math.random() * 0.8 + 0.5
            });
            if (heart) {
                heart.style.setProperty('--drift-x', (Math.random() * 100 - 50) + 'px');
            }
        }, i * 150);
    }
};

const startCherryBlossoms = (container) => {
    if (!container) return null;
    const createCherryBlossoms = () => {
        const total = 50;
        for (let i = 0; i < total; i++) {
            setTimeout(() => {
                const blossom = document.createElement('div');
                blossom.classList.add('blossom');
                const size = Math.floor(Math.random() * 15) + 15;
                blossom.style.width = `${size}px`;
                blossom.style.height = `${size}px`;
                blossom.style.left = `${Math.random() * 100}vw`;
                blossom.style.setProperty('--random-x', Math.random() * 10 - 5);
                blossom.style.setProperty('--random-r', Math.random() * 2 - 1);
                const duration = Math.random() * 4 + 8;
                blossom.style.animation = `fall ${duration}s linear forwards`;
                container.appendChild(blossom);
                setTimeout(() => blossom.remove(), duration * 1000);
            }, i * 200);
        }
    };
    createCherryBlossoms();
    return setInterval(createCherryBlossoms, 7000);
};

const startBackgroundHearts = (container) => {
    if (!container) return null;
    return setInterval(() => {
        createHeart(container, {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 5}s`,
            opacity: Math.random() * 0.5 + 0.3,
            scale: Math.random() * 0.6 + 0.4,
            lifetime: 7000
        });
    }, 500);
};

const attachCursorHearts = () => {
    const heartTrailContainer = document.createElement('div');
    heartTrailContainer.className = 'heart-trail-container';
    document.body.appendChild(heartTrailContainer);
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (Math.random() > 0.7) {
            createHeartAtCursor(heartTrailContainer, mouseX, mouseY);
        }
    });
};

const createHeartAtCursor = (container, x, y) => {
    const size = Math.random() * 15 + 8;
    const opacity = clamp(Math.random() * 0.5 + 0.5, 0, 1);
    const heart = document.createElement('div');
    heart.className = 'cursor-heart';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty('--random-x', (Math.random() * 2 - 1));
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.opacity = `${opacity}`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
};

export {
    createHeart,
    createHeartBurst,
    createButtonHeartEffect,
    sprinkleHearts,
    startCherryBlossoms,
    startBackgroundHearts,
    attachCursorHearts
};
