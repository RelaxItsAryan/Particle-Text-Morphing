let scene, camera, renderer, particles;
const count = 12000;
let currentState = 'sphere';

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);

    camera.position.z = 25;

    createParticles();
    setupEventListeners();
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    function sphericalDistribution(i) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        return {
            x: 8 * Math.cos(theta) * Math.sin(phi),
            y: 8 * Math.sin(theta) * Math.sin(phi),
            z: 8 * Math.cos(phi)
        };
    }

    for (let i = 0; i < count; i++) {
        const point = sphericalDistribution(i);
        
        positions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;

        const color = new THREE.Color();
        const depth = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z) / 8;
        color.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    if (particles) scene.remove(particles);
    particles = new THREE.Points(geometry, material);
    particles.rotation.x = 0;
    particles.rotation.y = 0;
    particles.rotation.z = 0;
    scene.add(particles);
}

function setupEventListeners() {
    const typeBtn = document.getElementById('typeBtn');
    const input = document.getElementById('morphText');

    typeBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            morphToText(text);
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = input.value.trim();
            if (text) {
                morphToText(text);
            }
        }
    });
}

function createTextPoints(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxCanvasWidth = Math.min(window.innerWidth * 0.88, 750);
    const maxCanvasHeight = Math.min(window.innerHeight * 0.6, 450); // EVEN TIGHTER
    const safePadding = 20;
    
    const words = text.trim().split(/\s+/);
    let fontSize = 120;
    
    if (words.length > 1) {
        // Find perfect font size FIRST
        let bestConfig = { fontSize: 24, lines: [], totalHeight: Infinity };
        
        while (fontSize > 20) {
            ctx.font = `bold ${fontSize}px Arial`;
            const lines = wrapText(ctx, text, maxCanvasWidth - safePadding * 2);
            const lineHeight = fontSize * 1.35;
            const totalHeight = (lines.length * lineHeight) + (safePadding * 3); // EXTRA BOTTOM PADDING
            
            if (totalHeight <= maxCanvasHeight * 0.92 && fontSize > bestConfig.fontSize) {
                bestConfig = { fontSize, lines, totalHeight };
            }
            fontSize *= 0.94;
        }
        
        fontSize = bestConfig.fontSize;
        const lines = bestConfig.lines;
        
        // Calculate EXACT height needed
        const lineHeight = fontSize * 1.35;
        canvas.width = maxCanvasWidth;
        canvas.height = Math.max(
            (lines.length * lineHeight) + (safePadding * 3), 
            fontSize * 2.5  // Minimum height
        );
        
        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic'; // Better baseline
        
        // Draw with EXTRA bottom padding
        lines.forEach((line, i) => {
            const yPos = safePadding + (i * lineHeight) + fontSize;
            ctx.fillText(line, canvas.width / 2, yPos);
        });
        
    } else {
        // SINGLE WORD
        while (fontSize > 20) {
            ctx.font = `bold ${fontSize}px Arial`;
            if (ctx.measureText(text).width <= maxCanvasWidth - safePadding * 2) break;
            fontSize *= 0.92;
        }
        
        const textWidth = ctx.measureText(text).width;
        canvas.width = textWidth + safePadding * 2;
        canvas.height = fontSize * 1.8 + safePadding * 2; 
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 3);
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const points = [];
    const threshold = 110;
    
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > threshold) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            
            if (Math.random() < 0.32) {
                points.push({
                    x: (x - canvas.width / 2) * 0.075,
                    y: -(y - canvas.height / 2) * 0.075
                });
            }
        }
    }
    
    return points;
}


function wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= maxWidth * 0.96) { // 4% safety margin
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
            
            // Handle very long individual words
            if (ctx.measureText(currentLine).width > maxWidth * 0.92) {
                currentLine = currentLine.substring(0, 15) + '…';
            }
        }
    }
    lines.push(currentLine);
    return lines;
}

function morphToText(text) {
    currentState = 'text';
    const textPoints = createTextPoints(text);
    const positions = particles.geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);

    gsap.to(particles.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
            // Adjust camera based on text size
            camera.position.z = Math.max(20, Math.min(40, particles.geometry.boundingSphere?.radius * 1.5 || 25));
        }
    });

    for (let i = 0; i < count; i++) {
        if (i < textPoints.length) {
            targetPositions[i * 3] = textPoints[i].x;
            targetPositions[i * 3 + 1] = textPoints[i].y;
            targetPositions[i * 3 + 2] = 0;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 20 + 10;
            targetPositions[i * 3] = Math.cos(angle) * radius;
            targetPositions[i * 3 + 1] = Math.sin(angle) * radius;
            targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
    }

    for (let i = 0; i < positions.length; i += 3) {
        gsap.to(particles.geometry.attributes.position.array, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    setTimeout(() => {
        morphToCircle();
    }, 4000);
}

function morphToCircle() {
    currentState = 'sphere';
    const positions = particles.geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);
    const colors = particles.geometry.attributes.color.array;

    function sphericalDistribution(i) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        return {
            x: 8 * Math.cos(theta) * Math.sin(phi),
            y: 8 * Math.sin(theta) * Math.sin(phi),
            z: 8 * Math.cos(phi)
        };
    }

    for (let i = 0; i < count; i++) {
        const point = sphericalDistribution(i);
        
        targetPositions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
        targetPositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
        targetPositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;

        const depth = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z) / 8;
        const color = new THREE.Color();
        color.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    for (let i = 0; i < positions.length; i += 3) {
        gsap.to(particles.geometry.attributes.position.array, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    for (let i = 0; i < colors.length; i += 3) {
        gsap.to(particles.geometry.attributes.color.array, {
            [i]: colors[i],
            [i + 1]: colors[i + 1],
            [i + 2]: colors[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.color.needsUpdate = true;
            }
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (currentState === 'sphere') {
        particles.rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
