const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

// --- CONFIGURATION ---
const scale = 1; 
canvas.width = window.innerWidth / scale;
canvas.height = window.innerHeight / scale;

const tileSize = 64;
const fov = Math.PI / 3; 
const mapWidth = 16;
const mapHeight = 14;

// 1 = Wall, 0 = Empty, 9 = Start
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- PLAYER ---
let player = {
    x: tileSize * 1.5,
    y: tileSize * 1.5,
    angle: 0,
    pitch: 0,
    speed: 2.0,
    bobPhase: 0
};

// --- AUDIO ---
let ambience = new Audio('ambient.mp3');
ambience.loop = true;
ambience.volume = 0.3; // Lower volume

// --- CREATURE ASSETS ---
let creatureImg = new Image();
creatureImg.src = 'creature.png'; // Ensure this exists

// --- AI STATE ---
const AI_STATE = {
    STALKING: 0, // Moving towards player slowly
    FROZEN: 1,   // Player is looking at it
    HIDDEN: 2    // Teleporting logic
};

let creature = {
    x: tileSize * 8,
    y: tileSize * 8,
    state: AI_STATE.STALKING,
    speed: 0.8, // Slow speed
    radius: 15, // Collision radius
    teleportTimer: 0,
    visibleTime: 0
};

let keys = {};

// --- INPUT HANDLERS ---
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth / scale;
    canvas.height = window.innerHeight / scale;
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
    ambience.play().catch(e => {});
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', mouseMoveHandler);
    } else {
        document.removeEventListener('mousemove', mouseMoveHandler);
    }
});

function mouseMoveHandler(e) {
    player.angle += e.movementX * 0.002;
    // Keep angle normalized 0 to 2PI
    if(player.angle > Math.PI * 2) player.angle -= Math.PI * 2;
    if(player.angle < 0) player.angle += Math.PI * 2;

    player.pitch -= e.movementY * 1.5;
    // Clamp pitch to avoid flipping over or seeing void
    player.pitch = Math.max(-canvas.height / 1.5, Math.min(canvas.height / 1.5, player.pitch));
}

function canMove(x, y) {
    let mapX = Math.floor(x / tileSize);
    let mapY = Math.floor(y / tileSize);
    if (mapY < 0 || mapY >= mapHeight || mapX < 0 || mapX >= mapWidth) return false;
    return map[mapY][mapX] !== 1;
}

// --- UPDATE LOOP ---
function update() {
    // PLAYER MOVEMENT
    let dx = 0, dy = 0, moving = false;
    if (keys['w']) { dx += Math.cos(player.angle); dy += Math.sin(player.angle); moving = true; }
    if (keys['s']) { dx -= Math.cos(player.angle); dy -= Math.sin(player.angle); moving = true; }
    if (keys['a']) { dx += Math.sin(player.angle); dy -= Math.cos(player.angle); moving = true; }
    if (keys['d']) { dx -= Math.sin(player.angle); dy += Math.cos(player.angle); moving = true; }

    if (moving) {
        let len = Math.sqrt(dx*dx + dy*dy);
        dx = (dx / len) * player.speed;
        dy = (dy / len) * player.speed;

        // Player Collision (Radius approx)
        if (canMove(player.x + dx * 2, player.y)) player.x += dx;
        if (canMove(player.x, player.y + dy * 2)) player.y += dy;

        player.bobPhase += 0.15;
    } else {
        player.bobPhase = 0;
    }

    updateStalkerAI();
}

// --- STALKER AI ---
function updateStalkerAI() {
    const dx = player.x - creature.x;
    const dy = player.y - creature.y;
    const distToPlayer = Math.sqrt(dx*dx + dy*dy);

    // Calculate angle to creature relative to player view
    let angleToCreature = Math.atan2(dy, dx) - player.angle;
    // Normalize angle
    while (angleToCreature > Math.PI) angleToCreature -= 2 * Math.PI;
    while (angleToCreature < -Math.PI) angleToCreature += 2 * Math.PI;

    // Check if player is looking at creature (within FOV) and has Line of Sight
    const inFOV = Math.abs(angleToCreature) < fov / 1.5; // Slightly narrower than full render FOV
    const hasLOS = hasLineOfSight(creature.x, creature.y, player.x, player.y);
    const isSeen = inFOV && hasLOS;

    // --- BEHAVIOR LOGIC ---
    
    if (isSeen) {
        // FROZEN: "Weeping Angel" mechanic. If you see it, it stops.
        creature.state = AI_STATE.FROZEN;
        creature.visibleTime++;
        
        // If you stare at it too long, maybe it vanishes to teleport elsewhere?
        if (creature.visibleTime > 300) { 
             attemptTeleport(true); // Force teleport away
        }
    } else {
        // STALKING: If not seen, move towards player
        creature.state = AI_STATE.STALKING;
        creature.visibleTime = 0;

        // Move Logic
        if (distToPlayer > tileSize) { // Don't clip into player
            let moveX = (dx / distToPlayer) * creature.speed;
            let moveY = (dy / distToPlayer) * creature.speed;

            // Robust Wall Collision for AI
            // We check the "shoulder" width of the creature to prevent clipping
            let nextX = creature.x + moveX;
            let nextY = creature.y + moveY;
            let radius = creature.radius;

            if (canMove(nextX + radius, creature.y) && canMove(nextX - radius, creature.y) &&
                canMove(nextX, creature.y + radius) && canMove(nextX, creature.y - radius)) {
                creature.x += moveX;
            }
            
            if (canMove(creature.x + radius, nextY) && canMove(creature.x - radius, nextY) &&
                canMove(creature.x, nextY + radius) && canMove(creature.x, nextY - radius)) {
                creature.y += moveY;
            }
        }

        // TELEPORT LOGIC (The "Taunt")
        // If creature is far away or behind walls for too long, teleport behind player
        creature.teleportTimer++;
        if (creature.teleportTimer > 400 && distToPlayer > tileSize * 6) {
             attemptTeleport(false);
        }
    }
}

function attemptTeleport(forceAway) {
    // Try 10 times to find a valid spot
    for(let i=0; i<10; i++) {
        let spawnDist = forceAway ? tileSize * 10 : tileSize * 4;
        // Calculate a spot BEHIND the player
        // Player angle + PI is behind, plus some random offset
        let spawnAngle = player.angle + Math.PI + (Math.random() * 1.5 - 0.75); 
        
        let tx = player.x + Math.cos(spawnAngle) * spawnDist;
        let ty = player.y + Math.sin(spawnAngle) * spawnDist;

        if (canMove(tx, ty) && canMove(tx + 10, ty) && canMove(tx, ty + 10)) {
             // Ensure line of sight is BROKEN so it doesn't pop in visibly
             if (!hasLineOfSight(player.x, player.y, tx, ty)) {
                 creature.x = tx;
                 creature.y = ty;
                 creature.teleportTimer = 0;
                 creature.visibleTime = 0;
                 console.log("Stalker relocated...");
                 break;
             }
        }
    }
}

function hasLineOfSight(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    let dist = 0;
    while (true) {
        if (Math.abs(x0 - x1) < 5 && Math.abs(y0 - y1) < 5) return true;
        
        let mapX = Math.floor(x0 / tileSize);
        let mapY = Math.floor(y0 / tileSize);
        if (map[mapY][mapX] === 1) return false;

        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx * 8; } // Step 8 for speed
        if (e2 < dx) { err += dx; y0 += sy * 8; }
        
        // Safety break
        dist++; if(dist>1000) return false;
    }
}

// --- RENDERING ---

function castRay(angle) {
    let sin = Math.sin(angle), cos = Math.cos(angle);
    let x = player.x, y = player.y;
    let dist = 0;
    const stepSize = 1; 

    while (true) {
        x += cos * stepSize;
        y += sin * stepSize;
        dist += stepSize;
        
        let mapX = Math.floor(x / tileSize);
        let mapY = Math.floor(y / tileSize);

        if (mapY < 0 || mapY >= mapHeight || mapX < 0 || mapX >= mapWidth) return { dist: dist, hit: true };
        if (map[mapY][mapX] === 1) return { dist: dist, hit: true };
    }
}

function draw() {
    // Clear screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // --- HORIZON CALCULATION ---
    // This connects the floor and ceiling movement to the pitch correctly
    const horizon = (canvas.height / 2) + player.pitch;

    // Ceiling (Dark Gray Gradient)
    let gradC = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradC.addColorStop(0, '#050505');
    gradC.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradC;
    ctx.fillRect(0, 0, canvas.width, horizon);

    // Floor (Darker Gradient)
    let gradF = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradF.addColorStop(0, '#0d0d0d'); // Horizon color
    gradF.addColorStop(1, '#222');    // Feet color
    ctx.fillStyle = gradF;
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);

    const numRays = canvas.width;
    const bobOffset = Math.sin(player.bobPhase) * 6;
    let zBuffer = new Array(numRays).fill(0);

    for (let i = 0; i < numRays; i++) {
        let rayAngle = (player.angle - fov / 2) + (i / numRays) * fov;
        let ray = castRay(rayAngle);
        let dist = ray.dist;

        // Fish-eye fix
        let ca = player.angle - rayAngle;
        dist = dist * Math.cos(ca);
        zBuffer[i] = dist;

        let wallHeight = (tileSize / dist) * (canvas.height * 0.8);
        
        // --- DARKER SHADING ---
        // Increased the divisor from 0.00005 to 0.00015 for faster light falloff
        let shade = 200 / (1 + dist * dist * 0.00015);
        if (shade > 180) shade = 180; // Cap brightness

        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        
        // Draw Wall Strip centered around the Horizon + Bobbing
        let wallTop = horizon - (wallHeight / 2) + bobOffset;
        
        // Anti-aliasing helper (draw slightly wider strips to prevent gaps)
        ctx.fillRect(i, wallTop, 1.5, wallHeight);
    }

    drawCreature(zBuffer, bobOffset, horizon);
    drawVignette();
    drawNoise();
}

function drawCreature(zBuffer, bobOffset, horizon) {
    let dx = creature.x - player.x;
    let dy = creature.y - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    let spriteAngle = Math.atan2(dy, dx) - player.angle;
    while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;
    while (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;

    if (Math.abs(spriteAngle) < fov) {
        let screenH = (tileSize / dist) * (canvas.height * 0.8);
        let screenW = screenH * (creatureImg.width / creatureImg.height || 0.6);
        
        let screenX = (0.5 * (spriteAngle / (fov / 2)) + 0.5) * canvas.width;
        
        // Simple Z-check
        let checkIdx = Math.floor(screenX);
        if (checkIdx >= 0 && checkIdx < canvas.width) {
             if (dist < zBuffer[checkIdx]) {
                 let y = horizon - (screenH / 2) + bobOffset;
                 
                 // Lighting for sprite
                 let brightness = 1;
                 if (dist > 100) brightness = 200 / (1 + dist * dist * 0.0001);
                 
                 ctx.save();
                 // Combine fade-out with distance darkening
                 ctx.filter = `brightness(${brightness}%)`;
                 
                 if(creatureImg.complete && creatureImg.naturalHeight !== 0){
                    ctx.drawImage(creatureImg, screenX - screenW / 2, y, screenW, screenH);
                 } else {
                     // Spooky Red Eyes Fallback
                     ctx.fillStyle = 'black';
                     ctx.fillRect(screenX - screenW/2, y, screenW, screenH);
                     ctx.fillStyle = 'red';
                     ctx.fillRect(screenX - 5, y + 10, 5, 5);
                     ctx.fillRect(screenX + 5, y + 10, 5, 5);
                 }
                 ctx.restore();
             }
        }
    }
}

function drawVignette() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width / 4,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.95)'); // Darker edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawNoise() {
    ctx.fillStyle = "rgba(100, 100, 255, 0.02)"; // Slight blue tint to noise
    for(let i=0; i<canvas.width; i+=3) {
        if(Math.random() > 0.8) {
            let h = Math.random() * canvas.height;
            ctx.fillRect(i, h, 2, 2);
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
