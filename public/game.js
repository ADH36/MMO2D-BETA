// Game Configuration
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1500;
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 5;
const TILE_SIZE = 50;

// Initialize socket connection
const socket = io();

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = Math.min(window.innerWidth - 40, 1200);
canvas.height = Math.min(window.innerHeight - 40, 800);

// Game state
let players = {};
let myId = null;
let camera = { x: 0, y: 0 };

// Input handling
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
};

// Socket event listeners
socket.on('connect', () => {
    console.log('Connected to server!');
    myId = socket.id;
});

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
    myId = socket.id;
    updatePlayerCount();
});

socket.on('newPlayer', (playerInfo) => {
    players[playerInfo.id] = playerInfo;
    updatePlayerCount();
});

socket.on('playerMoved', (playerData) => {
    if (players[playerData.id]) {
        players[playerData.id].x = playerData.x;
        players[playerData.id].y = playerData.y;
        players[playerData.id].velocityX = playerData.velocityX;
        players[playerData.id].velocityY = playerData.velocityY;
    }
});

socket.on('playerDisconnected', (playerId) => {
    delete players[playerId];
    updatePlayerCount();
});

// Input event listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Window resize
window.addEventListener('resize', () => {
    canvas.width = Math.min(window.innerWidth - 40, 1200);
    canvas.height = Math.min(window.innerHeight - 40, 800);
});

// Game functions
function updatePlayerCount() {
    document.getElementById('player-count').textContent = Object.keys(players).length;
}

function updatePosition() {
    const player = players[myId];
    if (player) {
        document.getElementById('position').textContent = 
            `X: ${Math.round(player.x)}, Y: ${Math.round(player.y)}`;
    }
}

function handleInput() {
    if (!myId || !players[myId]) return;

    const player = players[myId];
    let velocityX = 0;
    let velocityY = 0;

    // Handle WASD and Arrow keys
    if (keys.w || keys.ArrowUp) velocityY -= PLAYER_SPEED;
    if (keys.s || keys.ArrowDown) velocityY += PLAYER_SPEED;
    if (keys.a || keys.ArrowLeft) velocityX -= PLAYER_SPEED;
    if (keys.d || keys.ArrowRight) velocityX += PLAYER_SPEED;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
    }

    // Update player position
    player.x += velocityX;
    player.y += velocityY;

    // Keep player in bounds
    player.x = Math.max(PLAYER_SIZE, Math.min(WORLD_WIDTH - PLAYER_SIZE, player.x));
    player.y = Math.max(PLAYER_SIZE, Math.min(WORLD_HEIGHT - PLAYER_SIZE, player.y));

    player.velocityX = velocityX;
    player.velocityY = velocityY;

    // Send position to server
    if (velocityX !== 0 || velocityY !== 0) {
        socket.emit('playerMovement', {
            x: player.x,
            y: player.y,
            velocityX: velocityX,
            velocityY: velocityY
        });
    }
}

function updateCamera() {
    if (!myId || !players[myId]) return;

    const player = players[myId];
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // Keep camera in world bounds
    camera.x = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, camera.x));
    camera.y = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camera.y));
}

function drawMap() {
    // Draw grid background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grass tiles
    ctx.strokeStyle = '#4CAF50';
    ctx.fillStyle = '#5CB85C';

    for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
        for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
            const screenX = x - camera.x;
            const screenY = y - camera.y;

            if (screenX > -TILE_SIZE && screenX < canvas.width &&
                screenY > -TILE_SIZE && screenY < canvas.height) {
                
                // Alternate grass colors for variety
                const shade = ((x / TILE_SIZE) + (y / TILE_SIZE)) % 2 === 0 ? '#5CB85C' : '#6CC76C';
                ctx.fillStyle = shade;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                
                // Draw tile border
                ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw world border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(-camera.x, -camera.y, WORLD_WIDTH, WORLD_HEIGHT);
}

function drawPlayers() {
    Object.values(players).forEach(player => {
        const screenX = player.x - camera.x;
        const screenY = player.y - camera.y;

        // Only draw if visible on screen
        if (screenX > -PLAYER_SIZE && screenX < canvas.width + PLAYER_SIZE &&
            screenY > -PLAYER_SIZE && screenY < canvas.height + PLAYER_SIZE) {
            
            // Draw player shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + PLAYER_SIZE / 2, PLAYER_SIZE / 2, PLAYER_SIZE / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw player circle
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, PLAYER_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw player outline
            ctx.strokeStyle = player.id === myId ? '#FFD700' : '#333';
            ctx.lineWidth = player.id === myId ? 3 : 2;
            ctx.stroke();

            // Draw player name
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, screenX, screenY - PLAYER_SIZE);

            // Draw direction indicator if moving
            if (player.velocityX !== 0 || player.velocityY !== 0) {
                const angle = Math.atan2(player.velocityY, player.velocityX);
                const indicatorLength = PLAYER_SIZE / 2 + 10;
                
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(
                    screenX + Math.cos(angle) * indicatorLength,
                    screenY + Math.sin(angle) * indicatorLength
                );
                ctx.stroke();
            }
        }
    });
}

function drawMinimap() {
    const minimapWidth = 200;
    const minimapHeight = 150;
    const minimapX = canvas.width - minimapWidth - 10;
    const minimapY = 10;
    const scaleX = minimapWidth / WORLD_WIDTH;
    const scaleY = minimapHeight / WORLD_HEIGHT;

    // Draw minimap background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);

    // Draw border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);

    // Draw all players on minimap
    Object.values(players).forEach(player => {
        ctx.fillStyle = player.id === myId ? '#FFD700' : player.color;
        ctx.beginPath();
        ctx.arc(
            minimapX + player.x * scaleX,
            minimapY + player.y * scaleY,
            player.id === myId ? 4 : 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    // Draw camera view rectangle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
        minimapX + camera.x * scaleX,
        minimapY + camera.y * scaleY,
        canvas.width * scaleX,
        canvas.height * scaleY
    );
}

// Game loop
function gameLoop() {
    handleInput();
    updateCamera();
    updatePosition();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw everything
    drawMap();
    drawPlayers();
    drawMinimap();

    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
