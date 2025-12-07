<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Zombie Shooter</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #1a1a1a;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            cursor: none; /* Hide default OS cursor */
            user-select: none;
        }

        canvas {
            display: block;
        }

        #uiLayer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none; /* Let clicks pass through to canvas */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        /* Overlay for Game Over / Start */
        #menuOverlay {
            background: rgba(0, 0, 0, 0.8);
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            border: 2px solid #444;
            pointer-events: auto; /* Re-enable clicks for buttons */
            display: none; /* Hidden by default */
            backdrop-filter: blur(5px);
        }

        h1 {
            color: #ff3333;
            margin: 0 0 20px 0;
            text-shadow: 0 0 10px #ff0000;
            font-size: 48px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        p {
            color: #fff;
            font-size: 24px;
            margin-bottom: 30px;
        }

        button {
            padding: 15px 40px;
            font-size: 24px;
            background-color: #ff3333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.1s, background-color 0.2s;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
        }

        button:hover {
            background-color: #ff6666;
            transform: scale(1.05);
        }

        button:active {
            transform: scale(0.95);
        }

        #scoreHud {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 0 #000;
            pointer-events: none;
        }
    </style>
</head>
<body>

    <div id="scoreHud">Score: 0</div>
    
    <div id="uiLayer">
        <div id="menuOverlay">
            <h1 id="titleText">ZOMBIE SURVIVAL</h1>
            <p id="finalScoreText"></p>
            <button id="actionButton">START GAME</button>
        </div>
    </div>

    <canvas id="gameCanvas"></canvas>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreHud = document.getElementById('scoreHud');
        const menuOverlay = document.getElementById('menuOverlay');
        const actionButton = document.getElementById('actionButton');
        const finalScoreText = document.getElementById('finalScoreText');
        const titleText = document.getElementById('titleText');

        // --- Game Config ---
        let width, height;
        
        const config = {
            playerSpeed: 5,
            bulletSpeed: 12,
            baseSpawnRate: 2000,
            friction: 0.9, // smooth player movement
            colors: {
                player: '#3498db',
                bullet: '#f1c40f',
                zombie: '#2ecc71',
                bigZombie: '#e74c3c',
                bg: '#1a1a1a'
            }
        };

        // --- Game State ---
        let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
        let score = 0;
        let lastTime = 0;
        let spawnTimer = 0;
        let currentSpawnRate = config.baseSpawnRate;
        let mouse = { x: 0, y: 0 };
        
        // --- Entities ---
        const player = { x: 0, y: 0, dx: 0, dy: 0, size: 20, angle: 0, recoil: 0 };
        const bullets = [];
        const zombies = [];
        const particles = [];
        const input = { w: false, a: false, s: false, d: false, firing: false };

        // --- Resize Handling ---
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            if (gameState === 'MENU') {
                player.x = width / 2;
                player.y = height / 2;
            }
        }
        window.addEventListener('resize', resize);
        resize();

        // --- Input Handling ---
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('mousedown', () => input.firing = true);
        window.addEventListener('mouseup', () => input.firing = false);
        
        window.addEventListener('keydown', e => {
            if (e.key === 'w' || e.key === 'ArrowUp') input.w = true;
            if (e.key === 's' || e.key === 'ArrowDown') input.s = true;
            if (e.key === 'a' || e.key === 'ArrowLeft') input.a = true;
            if (e.key === 'd' || e.key === 'ArrowRight') input.d = true;
            if (e.key === 'p') togglePause();
        });

        window.addEventListener('keyup', e => {
            if (e.key === 'w' || e.key === 'ArrowUp') input.w = false;
            if (e.key === 's' || e.key === 'ArrowDown') input.s = false;
            if (e.key === 'a' || e.key === 'ArrowLeft') input.a = false;
            if (e.key === 'd' || e.key === 'ArrowRight') input.d = false;
        });

        // --- Classes & Helpers ---

        class Particle {
            constructor(x, y, color, speed) {
                this.x = x;
                this.y = y;
                this.color = color;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * speed;
                this.dx = Math.cos(angle) * velocity;
                this.dy = Math.sin(angle) * velocity;
                this.alpha = 1;
                this.decay = Math.random() * 0.03 + 0.01;
                this.size = Math.random() * 4 + 2;
            }
            update() {
                this.x += this.dx;
                this.y += this.dy;
                this.alpha -= this.decay;
                this.size *= 0.95; // Shrink
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function createExplosion(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y, color, 5));
            }
        }

        // --- Core Logic ---

        function initGame() {
            player.x = width / 2;
            player.y = height / 2;
            player.dx = 0;
            player.dy = 0;
            score = 0;
            currentSpawnRate = config.baseSpawnRate;
            bullets.length = 0;
            zombies.length = 0;
            particles.length = 0;
            scoreHud.innerText = `Score: 0`;
            
            gameState = 'PLAYING';
            menuOverlay.style.display = 'none';
        }

        function showMenu() {
            gameState = 'MENU';
            menuOverlay.style.display = 'block';
            titleText.innerText = "ZOMBIE SHOOTER";
            finalScoreText.style.display = 'none';
            actionButton.innerText = "PLAY";
        }

        function gameOver() {
            gameState = 'GAMEOVER';
            createExplosion(player.x, player.y, config.colors.player, 50);
            menuOverlay.style.display = 'block';
            titleText.innerText = "GAME OVER";
            finalScoreText.innerText = `Final Score: ${score}`;
            finalScoreText.style.display = 'block';
            actionButton.innerText = "RESTART";
        }

        function spawnZombie() {
            const edge = Math.floor(Math.random() * 4);
            let x, y;
            const buffer = 50;

            if (edge === 0) { x = Math.random() * width; y = -buffer; } // Top
            else if (edge === 1) { x = width + buffer; y = Math.random() * height; } // Right
            else if (edge === 2) { x = Math.random() * width; y = height + buffer; } // Bottom
            else { x = -buffer; y = Math.random() * height; } // Left

            const isBig = Math.random() < 0.15; // 15% chance for big zombie
            
            zombies.push({
                x: x, 
                y: y,
                size: isBig ? 35 : 18,
                speed: isBig ? 1.5 : (2 + Math.random()), // Random speed for variety
                color: isBig ? config.colors.bigZombie : config.colors.zombie,
                hp: isBig ? 5 : 1,
                maxHp: isBig ? 5 : 1
            });
        }

        let shootTimer = 0;
        function update(deltaTime) {
            if (gameState !== 'PLAYING') return;

            // -- Player Movement (Acceleration/Friction model) --
            if (input.w) player.dy -= 1;
            if (input.s) player.dy += 1;
            if (input.a) player.dx -= 1;
            if (input.d) player.dx += 1;

            player.x += player.dx;
            player.y += player.dy;

            // Friction
            player.dx *= config.friction;
            player.dy *= config.friction;

            // Boundaries
            if (player.x < player.size) player.x = player.size;
            if (player.y < player.size) player.y = player.size;
            if (player.x > width - player.size) player.x = width - player.size;
            if (player.y > height - player.size) player.y = height - player.size;

            // Player Rotation
            player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

            // -- Shooting --
            if (shootTimer > 0) shootTimer -= deltaTime;
            
            if (input.firing && shootTimer <= 0) {
                const gunTipX = player.x + Math.cos(player.angle) * 35;
                const gunTipY = player.y + Math.sin(player.angle) * 35;
                
                bullets.push({
                    x: gunTipX,
                    y: gunTipY,
                    dx: Math.cos(player.angle) * config.bulletSpeed,
                    dy: Math.sin(player.angle) * config.bulletSpeed
                });
                
                // Recoil effect
                player.recoil = 5;
                shootTimer = 150; // ms cooldown
            }
            if (player.recoil > 0) player.recoil *= 0.8;

            // -- Bullets --
            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];
                b.x += b.dx;
                b.y += b.dy;

                // Off screen removal
                if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
                    bullets.splice(i, 1);
                }
            }

            // -- Zombies --
            spawnTimer += deltaTime;
            if (spawnTimer > currentSpawnRate) {
                spawnZombie();
                spawnTimer = 0;
                // Increase difficulty slightly
                if (currentSpawnRate > 400) currentSpawnRate -= 10;
            }

            for (let i = zombies.length - 1; i >= 0; i--) {
                let z = zombies[i];
                const angle = Math.atan2(player.y - z.y, player.x - z.x);
                z.x += Math.cos(angle) * z.speed;
                z.y += Math.sin(angle) * z.speed;

                // Collision Player vs Zombie
                const distPlayer = Math.hypot(player.x - z.x, player.y - z.y);
                if (distPlayer < player.size + z.size - 5) {
                    gameOver();
                }

                // Collision Bullet vs Zombie
                for (let j = bullets.length - 1; j >= 0; j--) {
                    let b = bullets[j];
                    const distBullet = Math.hypot(b.x - z.x, b.y - z.y);
                    
                    if (distBullet < z.size + 5) {
                        z.hp--;
                        bullets.splice(j, 1); // Remove bullet

                        // Hit effect (Particle)
                        createExplosion(z.x, z.y, z.color, 3);
                        
                        // Pushback zombie
                        z.x -= Math.cos(angle) * 10;
                        z.y -= Math.sin(angle) * 10;

                        if (z.hp <= 0) {
                            score += (z.maxHp > 1) ? 50 : 10;
                            scoreHud.innerText = `Score: ${score}`;
                            createExplosion(z.x, z.y, z.color, 15); // Big explosion
                            zombies.splice(i, 1);
                        }
                        break; // Bullet hit something, stop checking other zombies for this bullet
                    }
                }
            }

            // -- Particles --
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        function draw() {
            // Clear Screen with Fade effect for trails (optional, keeping it clean here)
            ctx.fillStyle = config.colors.bg;
            ctx.fillRect(0, 0, width, height);

            // Draw Particles
            particles.forEach(p => p.draw());

            // Draw Bullets (Glowing)
            ctx.shadowBlur = 10;
            ctx.shadowColor = config.colors.bullet;
            ctx.fillStyle = config.colors.bullet;
            bullets.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            // Draw Zombies
            zombies.forEach(z => {
                ctx.fillStyle = z.color;
                
                // Add a dark outline for health indication style
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.arc(z.x, z.y, z.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Eyes (to show rotation)
                const angle = Math.atan2(player.y - z.y, player.x - z.x);
                const eyeX = z.x + Math.cos(angle) * (z.size * 0.6);
                const eyeY = z.y + Math.sin(angle) * (z.size * 0.6);
                
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(eyeX, eyeY, z.size/4, 0, Math.PI * 2);
                ctx.fill();
            });

            if (gameState !== 'GAMEOVER') {
                // Draw Player
                ctx.save();
                ctx.translate(player.x, player.y);
                ctx.rotate(player.angle);

                // Gun
                ctx.fillStyle = '#555';
                const recoilOffset = -player.recoil; // moves gun back
                ctx.fillRect(10 + recoilOffset, -5, 30, 10);

                // Body
                ctx.fillStyle = config.colors.player;
                ctx.beginPath();
                ctx.arc(0, 0, player.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Hands (visual detail)
                ctx.fillStyle = '#2980b9';
                ctx.beginPath();
                ctx.arc(15, 10, 8, 0, Math.PI * 2); // Right hand
                ctx.arc(15, -10, 8, 0, Math.PI * 2); // Left hand
                ctx.fill();

                ctx.restore();
            }

            // Draw Custom Cursor (Crosshair)
            drawCrosshair();
        }

        function drawCrosshair() {
            const size = 10;
            const gap = 5;
            
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            // Top
            ctx.moveTo(mouse.x, mouse.y - gap);
            ctx.lineTo(mouse.x, mouse.y - size);
            // Bottom
            ctx.moveTo(mouse.x, mouse.y + gap);
            ctx.lineTo(mouse.x, mouse.y + size);
            // Left
            ctx.moveTo(mouse.x - gap, mouse.y);
            ctx.lineTo(mouse.x - size, mouse.y);
            // Right
            ctx.moveTo(mouse.x + gap, mouse.y);
            ctx.lineTo(mouse.x + size, mouse.y);
            
            ctx.stroke();
            
            // Center dot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI*2);
            ctx.fill();
        }

        // --- Game Loop ---
        function loop(timestamp) {
            let deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            update(deltaTime);
            draw();

            requestAnimationFrame(loop);
        }

        // Start
        actionButton.addEventListener('click', initGame);
        showMenu();
        requestAnimationFrame(loop);

    </script>
</body>
</html>
