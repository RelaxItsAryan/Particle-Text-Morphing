let scene, camera, renderer, particles;
const count = 22000; 
let currentState = 'sphere';
let time = 0;

// Mouse & HUD Data
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const hudLayer = document.getElementById('hudLayer');
const coordDisplay = document.querySelector('.coords');
const reticle = document.querySelector('.cursor-reticle');
const systemLogs = document.getElementById('systemLogs');

// Animation State
let morphData = { val: 0, explosion: 0 };

// Fake Log Data
const logMessages = [
    "CALCULATING TRAJECTORY...", "UPDATING MESH...", "OPTIMIZING V-SYNC...", 
    "BUFFERING DATA...", "PACKET RECEIVED...", "CORE TEMP: NORMAL", 
    "SCANNING SECTOR 7...", "MEMORY ALLOCATED..."
];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000); 
    document.getElementById('container').appendChild(renderer.domElement);

    createParticles();
    setupEventListeners();
    animate();
}

// ... [insert createParticles, createTextTargets, morphToText, morphToSphere functions from previous step] ...
// (These functions remain IDENTICAL to the optimized version I gave you in the last step. 
//  For brevity, I will focus on the NEW logic below, but you need the particle logic here)

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const spherePos = new Float32Array(count * 3);
    const textPos = new Float32Array(count * 3); 
    const randoms = new Float32Array(count); 
    const normals = new Float32Array(count * 3);
    const radius = 11; 

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        spherePos[i * 3] = x;
        spherePos[i * 3 + 1] = y;
        spherePos[i * 3 + 2] = z;
        normals[i * 3] = x / radius;
        normals[i * 3 + 1] = y / radius;
        normals[i * 3 + 2] = z / radius;
        randoms[i] = Math.random();

        const color = new THREE.Color();
        const normalizedY = (y + radius) / (radius * 2);
        color.setHSL(0.04 + (normalizedY * 0.02), 1.0, 0.3 + (normalizedY * 0.4));
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('spherePos', new THREE.BufferAttribute(spherePos, 3));
    geometry.setAttribute('textPos', new THREE.BufferAttribute(textPos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('rnd', new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createTextTargets(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1600; 
    const height = 600;
    
    canvas.width = width;
    canvas.height = height;
    
    let fontSize = 300;
    ctx.font = `900 ${fontSize}px Arial`;
    
    while(ctx.measureText(text).width > width * 0.8) {
        fontSize -= 10;
        ctx.font = `900 ${fontSize}px Arial`;
    }
    
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width/2, height/2);
    
    const data = ctx.getImageData(0,0, width, height).data;
    const validPoints = [];
    
    for(let i=0; i<data.length; i+=4) {
        if(data[i] > 128) { 
            if(Math.random() < 0.22) { 
                const x = (i/4) % width;
                const y = Math.floor((i/4) / width);
                validPoints.push({
                    x: (x - width/2) * 0.05,
                    y: -(y - height/2) * 0.05
                });
            }
        }
    }
    
    const attr = particles.geometry.attributes.textPos;
    const count = attr.count;
    
    for(let i=0; i<count; i++) {
        if(i < validPoints.length) {
            attr.setXYZ(i, validPoints[i].x, validPoints[i].y, 0);
        } else {
            const angle = Math.random() * Math.PI * 2;
            const r = 20 + Math.random() * 30;
            attr.setXYZ(i, Math.cos(angle)*r, Math.sin(angle)*r, (Math.random()-0.5)*20);
        }
    }
    attr.needsUpdate = true;
}

function morphToText(text) {
    if(!text || currentState === 'transition') return;
    currentState = 'transition';
    createTextTargets(text);
    addLog(`EXECUTING: ${text}`);

    const tl = gsap.timeline({ onComplete: () => { currentState = 'text'; } });
    tl.to(morphData, { explosion: 15, duration: 0.8, ease: "power2.out" });
    tl.to(morphData, { val: 1, explosion: 0, duration: 1.2, ease: "power4.out" });
    gsap.to(camera.position, { z: 40, duration: 2 });
    setTimeout(() => { morphToSphere(); }, 5000);
}

function morphToSphere() {
    currentState = 'transition';
    addLog("RESETTING CORE...");
    const tl = gsap.timeline({ onComplete: () => { currentState = 'sphere'; } });
    tl.to(morphData, { val: 0, duration: 2.5, ease: "power2.inOut" });
    gsap.to(camera.position, { z: 28, duration: 2.5 });
}

// --- NEW: HUD LOGIC ---
function updateHUD() {
    // 1. Update Coords in Top Right
    const mx = (mouse.x * 100).toFixed(2);
    const my = (mouse.y * 100).toFixed(2);
    coordDisplay.innerText = `X: ${mx} | Y: ${my}`;

    // 2. Randomly Twitch Bars (Left Side)
    if(Math.random() > 0.95) {
        const bars = document.querySelectorAll('.fill');
        bars.forEach(bar => {
            bar.style.width = Math.random() * 100 + "%";
        });
    }

    // 3. Random Log Injection (Right Side)
    if(Math.random() > 0.99) {
        const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
        addLog(msg);
    }
}

function addLog(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerText = `> ${msg}`;
    systemLogs.prepend(div);
    if(systemLogs.children.length > 6) systemLogs.lastChild.remove();
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.015;

    updateHUD();

    if (!particles) return;

    const positions = particles.geometry.attributes.position;
    const spherePos = particles.geometry.attributes.spherePos;
    const textPos = particles.geometry.attributes.textPos;
    const normals = particles.geometry.attributes.normal;
    const rnd = particles.geometry.attributes.rnd;
    const val = morphData.val;
    const exp = morphData.explosion;

    // Raycast for interaction
    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);

    for (let i = 0; i < count; i++) {
        const sx = spherePos.getX(i);
        const sy = spherePos.getY(i);
        const sz = spherePos.getZ(i);
        const layer = rnd.getX(i);
        const speed = 0.5 + (layer * 0.5);
        const angle = time * speed;

        const rotX = sx * Math.cos(angle) - sz * Math.sin(angle);
        const rotZ = sx * Math.sin(angle) + sz * Math.cos(angle);
        const rotY = sy;

        let jx=0, jy=0, jz=0;
        if (currentState === 'sphere') {
            const wave = Math.sin(rotY * 0.5 - time * 3);
            if (wave > 0.8) { jx = (Math.random()-0.5)*0.1; jy = (Math.random()-0.5)*0.1; jz = (Math.random()-0.5)*0.1; }
        }

        const tx = textPos.getX(i);
        const ty = textPos.getY(i);
        const tz = textPos.getZ(i);

        const nx = normals.getX(i); const ny = normals.getY(i); const nz = normals.getZ(i);
        const nRotX = nx * Math.cos(angle) - nz * Math.sin(angle);
        const nRotZ = nx * Math.sin(angle) + nz * Math.cos(angle);
        const nRotY = ny;

        let cx = (rotX + jx) + (tx - (rotX + jx)) * val;
        let cy = (rotY + jy) + (ty - (rotY + jy)) * val;
        let cz = (rotZ + jz) + (tz - (rotZ + jz)) * val;

        cx += nRotX * exp; cy += nRotY * exp; cz += nRotZ * exp;

        // Interaction
        if (val < 0.1) {
            const dx = cx - intersect.x; const dy = cy - intersect.y;
            const distSq = dx*dx + dy*dy;
            if (distSq < 25) {
                const dist = Math.sqrt(distSq);
                const force = (5 - dist) / 5;
                cx += (dx / dist) * force * 2;
                cy += (dy / dist) * force * 2;
                cz += force * 3;
            }
        }
        positions.setXYZ(i, cx, cy, cz);
    }

    positions.needsUpdate = true;
    
    if (currentState === 'sphere') {
        particles.rotation.z = Math.sin(time * 0.1) * 0.05;
        particles.rotation.y += 0.002;
    } else {
        particles.rotation.y = 0; particles.rotation.z = 0;
    }

    renderer.render(scene, camera);
}

function setupEventListeners() {
    const btn = document.getElementById('typeBtn');
    const inp = document.getElementById('morphText');
    
    function trigger() {
        const text = inp.value.trim();
        if(text) morphToText(text);
    }
    
    btn.addEventListener('click', trigger);
    inp.addEventListener('keydown', (e) => { if(e.key === 'Enter') trigger(); });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Custom Cursor movement
        reticle.style.left = e.clientX + 'px';
        reticle.style.top = e.clientY + 'px';

        // Parallax Effect on HUD
        // We move the HUD slightly opposite to the mouse
        const xOffset = (e.clientX - window.innerWidth / 2) * -0.02;
        const yOffset = (e.clientY - window.innerHeight / 2) * -0.02;
        hudLayer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
    
    window.addEventListener('mousedown', () => reticle.classList.add('active'));
    window.addEventListener('mouseup', () => reticle.classList.remove('active'));
}

init();