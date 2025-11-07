const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], 
    [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const tileSize = 64;

let player = {
    x: tileSize * 1.5,
    y: tileSize * 1.5,
    angle: 0,
    pitch: 0,
    speed: 1.5
};

let ambience = new Audio('ambient.mp3');
ambience.loop = true;
ambience.volume = 0.5;

// World creature
let creatureImg = new Image();
creatureImg.src = 'creature.png';

let creature = {
    x: player.x,
    y: player.y,
    visible: true,
    mode: "idle", // idle, stalking, peeking, fleeing
    nextActionTime: 0
};

let keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('click', () => canvas.requestPointerLock());

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', mouseMoveHandler);
    } else {
        document.removeEventListener('mousemove', mouseMoveHandler);
    }
});

function mouseMoveHandler(e) {
    player.angle += e.movementX * 0.002;
    player.pitch += e.movementY * 0.002;
    player.pitch = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, player.pitch));
}

function canMove(x, y) {
    let mapX = Math.floor(x / tileSize);
    let mapY = Math.floor(y / tileSize);
    return map[mapY][mapX] === 0;
}

function update() {
    let newX = player.x;
    let newY = player.y;

    if (keys['w']) {
        newX += Math.cos(player.angle) * player.speed;
        newY += Math.sin(player.angle) * player.speed;
    }
    if (keys['s']) {
        newX -= Math.cos(player.angle) * player.speed;
        newY -= Math.sin(player.angle) * player.speed;
    }
    if (keys['a']) {
        newX += Math.sin(player.angle) * player.speed;
        newY -= Math.cos(player.angle) * player.speed;
    }
    if (keys['d']) {
        newX -= Math.sin(player.angle) * player.speed;
        newY += Math.cos(player.angle) * player.speed;
    }

    if (canMove(newX, player.y)) player.x = newX;
    if (canMove(player.x, newY)) player.y = newY;

    updateCreature();
}

function castRay(angle) {
    let x = player.x;
    let y = player.y;
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    while (true) {
        x += cos;
        y += sin;
        let mapX = Math.floor(x / tileSize);
        let mapY = Math.floor(y / tileSize);
        if (map[mapY][mapX] === 1) {
            return Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        }
    }
}

function hasLineOfSight(px, py, tx, ty) {
    const dx = tx - px;
    const dy = ty - py;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) / 4;
    let x = px;
    let y = py;

    for (let i = 0; i < steps; i++) {
        x += dx / steps;
        y += dy / steps;

        let mapX = Math.floor(x / tileSize);
        let mapY = Math.floor(y / tileSize);

        if (map[mapY][mapX] === 1) {
            return false;
        }
    }
    return true;
}

// --- CREATURE AI BEHAVIOR ---
function updateCreature() {
    const now = performance.now();
    const dx = player.x - creature.x;
    const dy = player.y - creature.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const canSee = hasLineOfSight(player.x, player.y, creature.x, creature.y);
    const isFacing = Math.abs(Math.atan2(dy, dx) - player.angle) < Math.PI / 6;

    if (now > creature.nextActionTime) {
        creature.nextActionTime = now + 3000 + Math.random() * 4000;

        if (!canSee) {
            // Sometimes appear behind player
            if (Math.random() < 0.3) {
                const offset = 150 + Math.random() * 100;
                creature.x = player.x - Math.cos(player.angle) * offset;
                creature.y = player.y - Math.sin(player.angle) * offset;
                creature.mode = "stalking";
                creature.visible = true;
            }
            // Sometimes peek near walls
            else if (Math.random() < 0.5) {
                creature.mode = "peeking";
                creature.visible = true;
            }
            // Sometimes stay distant and watch
            else {
                creature.mode = "idle";
                creature.visible = true;
            }
        } else {
            // If seen, go invisible or flee
            if (dist < 250) {
                creature.mode = "fleeing";
            } else {
                creature.visible = false;
            }
        }
    }

    // Move behavior
    if (creature.mode === "fleeing") {
        const fleeAngle = Math.atan2(creature.y - player.y, creature.x - player.x);
        const speed = 2.5;
        const newX = creature.x + Math.cos(fleeAngle) * speed;
        const newY = creature.y + Math.sin(fleeAngle) * speed;
        if (canMove(newX, newY)) {
            creature.x = newX;
            creature.y = newY;
        }
        if (Math.random() < 0.01) creature.visible = false;
    }

    if (creature.mode === "peeking") {
        creature.visible = Math.random() < 0.7;
    }
}

// --- DRAWING ---
function drawWallSlice(i, distance) {
    let wallHeight = (tileSize / distance) * 400;
    let shade = 255 / (1 + distance * distance * 0.0001);
    shade = Math.min(255, Math.max(0, shade * 0.5));
    ctx.fillStyle = `rgb(${shade}, ${shade * 0.8}, ${shade * 0.8})`;
    ctx.fillRect(i, (canvas.height / 2) - (wallHeight / 2) - player.pitch, 2, wallHeight);
}

function drawCreatureSprite() {
    if (!creature.visible) return;

    let dx = creature.x - player.x;
    let dy = creature.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (!hasLineOfSight(player.x, player.y, creature.x, creature.y)) return;

    let angleToCreature = Math.atan2(dy, dx);
    let angleDiff = angleToCreature - player.angle;

    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    const fov = Math.PI / 4;
    if (Math.abs(angleDiff) < fov / 2 + 0.2) {
        let screenX = (canvas.width / 2) + (angleDiff * (canvas.width / fov));
        let spriteHeight = (tileSize / distance) * 500;
        let spriteWidth = spriteHeight * (creatureImg.width / creatureImg.height);

        let x = screenX - spriteWidth / 2;
        let y = (canvas.height / 2) - spriteHeight / 2 - player.pitch;

        // Darken with distance
        let alpha = Math.max(0, 1 - distance / 800);
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.drawImage(creatureImg, x, y, spriteWidth, spriteHeight);
        ctx.restore();
    }
}

function drawVignette() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const numRays = canvas.width;
    const fov = Math.PI / 4;

    for (let i = 0; i < numRays; i++) {
        let angle = (player.angle - fov / 2) + (i / numRays) * fov;
        let distance = castRay(angle);
        drawWallSlice(i, distance);
    }

    drawCreatureSprite();
    drawVignette();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function init() {
    ambience.play();
}

init();
gameLoop();
