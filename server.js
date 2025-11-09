const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Game state
const players = {};
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1500;
const PLAYER_SPEED = 5;

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  // Create new player
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * WORLD_WIDTH,
    y: Math.random() * WORLD_HEIGHT,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    name: `Player${Object.keys(players).length}`,
    velocityX: 0,
    velocityY: 0
  };

  // Send current players to new player
  socket.emit('currentPlayers', players);

  // Notify all other players about new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Handle player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].velocityX = movementData.velocityX;
      players[socket.id].velocityY = movementData.velocityY;

      // Broadcast to other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: movementData.x,
        y: movementData.y,
        velocityX: movementData.velocityX,
        velocityY: movementData.velocityY
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Start server
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
