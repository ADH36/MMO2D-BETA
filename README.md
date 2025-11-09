# MMO2D-BETA

A real-time 2D MMO game with map rendering, multiple online characters, and multiplayer functionality.

## Features

- **Home Screen**: Professional landing page with navigation menu
- **User Authentication**: Sign up and login system with local storage
- **Settings Panel**: Customize game preferences including:
  - Sound volume control
  - Graphics quality settings
  - Toggle minimap visibility
  - Toggle player names display
- **2D Map System**: Rendered with HTML5 Canvas featuring a tile-based grass environment
- **Multiple Characters**: Support for unlimited players online simultaneously
- **Online Multiplayer**: Real-time synchronization using Socket.IO
- **Player Movement**: WASD or Arrow keys for smooth character movement
- **Camera System**: Dynamic camera that follows your player
- **Minimap**: Shows all players and your current view area
- **Player Info Panel**: Displays online player count and your position

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ADH36/MMO2D-BETA.git
cd MMO2D-BETA
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. **Home Screen**: When you first visit the game, you'll see the home screen with options to:
   - Play Game (as guest or logged-in user)
   - Access Settings
   - View About information
   - Login or Sign Up

2. **Create an Account** (optional):
   - Click "Login" then "Sign Up"
   - Enter a username, email, and password
   - Your account will be saved locally and you'll be logged in automatically

3. **Customize Settings**:
   - Click "Settings" from the home screen
   - Adjust sound volume, graphics quality, and display preferences
   - Click "Save Settings" to apply changes

4. **Play the Game**:
   - Click "Play Game" to enter the game world
   - **Movement**: Use WASD or Arrow keys to move your character
   - **Map**: Explore the 2000x1500 pixel world with a grass tile map
   - **Multiplayer**: Open multiple browser windows to see multiple characters interact in real-time
   - **Info Panel**: Check the top-left corner for player count and your position
   - **Minimap**: View all players on the minimap in the top-right corner (if enabled)
   - **Back to Home**: Click the "Back to Home" button to return to the home screen

## Technology Stack

- **Frontend**: HTML5 Canvas, JavaScript, CSS
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Game Architecture**: Client-side prediction with server authority

## Development

For development with auto-restart:
```bash
npm run dev
```

## Game Architecture

- **Server (`server.js`)**: Manages player connections, game state, player names, and broadcasts updates
- **Home System (`public/home.html`, `home.js`, `home-style.css`)**: Landing page with authentication and settings
- **Client (`public/game.js`)**: Handles rendering, input, and client-side game logic
- **Map System**: Tile-based grid with procedural coloring
- **Player System**: Each player has unique color, position, ID, and customizable name
- **Settings System**: User preferences stored in localStorage and applied to gameplay

## Customization

You can customize the game by modifying these constants in `server.js` and `public/game.js`:

- `WORLD_WIDTH`: Width of the game world
- `WORLD_HEIGHT`: Height of the game world  
- `PLAYER_SPEED`: Movement speed of characters
- `TILE_SIZE`: Size of map tiles

## License

MIT