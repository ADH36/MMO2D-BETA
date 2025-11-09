// User authentication and navigation system
class GameAuth {
    constructor() {
        this.currentUser = null;
        this.settings = {
            soundVolume: 50,
            graphicsQuality: 'medium',
            showMinimap: true,
            showPlayerNames: true
        };
        this.init();
    }

    init() {
        // Load user from localStorage
        this.loadUser();
        this.loadSettings();
        this.updateUI();
        this.attachEventListeners();
    }

    loadUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    updateUI() {
        const userDisplay = document.getElementById('userDisplay');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.currentUser) {
            userDisplay.textContent = `Logged in as: ${this.currentUser.username}`;
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            userDisplay.textContent = 'Not logged in';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    attachEventListeners() {
        // Home screen buttons
        document.getElementById('playBtn').addEventListener('click', () => this.playGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('aboutBtn').addEventListener('click', () => this.showScreen('about'));
        document.getElementById('loginBtn').addEventListener('click', () => this.showScreen('login'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Login/Signup navigation
        document.getElementById('showSignupBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('signup');
        });
        document.getElementById('showLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('login');
        });

        // Back buttons
        document.getElementById('backFromLogin').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('backFromSignup').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('backFromSettings').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('backFromAbout').addEventListener('click', () => this.showScreen('home'));

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        // Settings
        document.getElementById('saveSettings').addEventListener('click', () => this.handleSaveSettings());
        document.getElementById('soundVolume').addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });

        // Initialize settings UI
        this.updateSettingsUI();
    }

    showScreen(screen) {
        // Hide all screens
        document.querySelector('.home-screen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('signupScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'none';
        document.getElementById('aboutScreen').style.display = 'none';

        // Show selected screen
        switch(screen) {
            case 'home':
                document.querySelector('.home-screen').style.display = 'block';
                break;
            case 'login':
                document.getElementById('loginScreen').style.display = 'block';
                break;
            case 'signup':
                document.getElementById('signupScreen').style.display = 'block';
                break;
            case 'settings':
                document.getElementById('settingsScreen').style.display = 'block';
                this.updateSettingsUI();
                break;
            case 'about':
                document.getElementById('aboutScreen').style.display = 'block';
                break;
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = { username: user.username, email: user.email };
            this.saveUser();
            this.updateUI();
            this.showNotification('Login successful!', 'success');
            this.showScreen('home');
            document.getElementById('loginForm').reset();
        } else {
            this.showNotification('Invalid username or password!', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters!', 'error');
            return;
        }

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            this.showNotification('Username already exists!', 'error');
            return;
        }

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            this.showNotification('Email already registered!', 'error');
            return;
        }

        // Create new user
        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login
        this.currentUser = { username, email };
        this.saveUser();
        this.updateUI();
        
        this.showNotification('Account created successfully!', 'success');
        this.showScreen('home');
        document.getElementById('signupForm').reset();
    }

    logout() {
        this.currentUser = null;
        this.saveUser();
        this.updateUI();
        this.showNotification('Logged out successfully!', 'success');
    }

    updateSettingsUI() {
        document.getElementById('soundVolume').value = this.settings.soundVolume;
        document.getElementById('volumeValue').textContent = this.settings.soundVolume + '%';
        document.getElementById('graphicsQuality').value = this.settings.graphicsQuality;
        document.getElementById('showMinimap').checked = this.settings.showMinimap;
        document.getElementById('showPlayerNames').checked = this.settings.showPlayerNames;
    }

    handleSaveSettings() {
        this.settings.soundVolume = parseInt(document.getElementById('soundVolume').value);
        this.settings.graphicsQuality = document.getElementById('graphicsQuality').value;
        this.settings.showMinimap = document.getElementById('showMinimap').checked;
        this.settings.showPlayerNames = document.getElementById('showPlayerNames').checked;
        
        this.saveSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }

    playGame() {
        // Save settings to pass to game
        sessionStorage.setItem('gameSettings', JSON.stringify(this.settings));
        
        if (this.currentUser) {
            sessionStorage.setItem('playerName', this.currentUser.username);
        } else {
            sessionStorage.setItem('playerName', `Guest${Math.floor(Math.random() * 1000)}`);
        }
        
        // Redirect to game
        window.location.href = '/game.html';
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the auth system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameAuth();
});
