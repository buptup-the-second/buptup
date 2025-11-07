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
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], 
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const tileSize = 64;
const mapWidth = map[0].length;
const mapHeight = map.length;

let player = {
    x: tileSize * 1.5,
    y: tileSize * 1.5,
    angle: 0,
    pitch: 0,
    speed: 1.5,
    turnSpeed: 0.05
};

let ambience;

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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const numRays = canvas.width;
    const fov = Math.PI / 4;

    for (let i = 0; i < numRays; i++) {
        let angle = (player.angle - fov / 2) + (i / numRays) * fov;
        let distance = castRay(angle);

        let wallHeight = (tileSize / distance) * 277;

        let shade = 255 / (1 + distance * distance * 0.0001);
        shade = Math.min(255, Math.max(0, shade));
        shade = shade * 0.5; // Darker shade for a more unsettling effect

        ctx.fillStyle = `rgb(${shade}, ${shade * 0.8}, ${shade * 0.8})`; // Dark red shade for a more unsettling effect
        ctx.fillRect(i, (canvas.height / 2) - (wallHeight / 2) - player.pitch, 1, wallHeight);
    }

    drawVignette();
}

function drawVignette() {
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.width / 2, canvas.height / 2, canvas.width);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    if (keys['d']) {
        newX -= Math.sin(player.angle) * player.speed;
        newY += Math.cos(player.angle) * player.speed;
    }
    if (keys['a']) {
        newX += Math.sin(player.angle) * player.speed;
        newY -= Math.cos(player.angle) * player.speed;
    }

    if (canMove(newX, player.y)) {
        player.x = newX;
    }
    if (canMove(player.x, newY)) {
        player.y = newY;
    }
}

let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
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
    player.pitch += e.movementY * 0.002;
    player.pitch = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, player.pitch)); // Limit pitch to prevent extreme looking up/down
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function init() {
    ambience = new Audio('ambient.mp3');
    ambience.loop = true;
    ambience.volume = 0.5; // Adjust volume as needed
    ambience.play();
}

init();
gameLoop();
