class QuestGame {
    constructor() {
        this.selectedAvatar = null;
        this.difficulty = null;
        this.currentLevel = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.rewards = 0;
        this.totalRewards = 30;
        this.healsLeft = 1;
        this.playerPos = { x: 0, y: 0 };
        this.gameData = this.generateGameData();
        
        this.backgrounds = ['bg-field', 'bg-cave', 'bg-mountain', 'bg-beach', 'bg-fire', 'bg-clouds', 'bg-stars'];
        this.stories = [
            "Vous entrez dans les champs verdoyants. Méfiez-vous des gobelins !",
            "Les grottes sombres vous attendent. Des chauves-souris géantes rôdent...",
            "Les montagnes escarpées cachent des trésors. Attention aux trolls !",
            "Sur la plage dorée, des crabes géants défendent leurs territoires.",
            "Dans les terres de feu, des dragons mineurs crachent leurs flammes.",
            "Au royaume des nuages, les esprits du vent vous défient.",
            "Parmi les étoiles, des créatures cosmiques vous observent...",
            "Les terres perdues recèlent de dangers ancestraux.",
            "Le royaume oublié teste votre courage et votre sagesse.",
            "Face au boss final ! Utilisez toute votre expérience pour triompher !"
        ];
        
        this.rewards_list = [
            "🗡️", "🛡️", "💎", "👑", "🏺", "📿", "🔮", "⚔️", "🏹", "🛡️",
            "💍", "🗝️", "📜", "🧿", "⚱️", "🏆", "💰", "🎖️", "🔱", "⭐",
            "🌟", "✨", "💫", "🔥", "❄️", "⚡", "🌪️", "🌈", "🍀", "🎁"
        ];
        
        this.animals_houses = [
            "🏠", "🐶", "🏡", "🐱", "🏰", "🐦", "🏯", "🐴", "🏛️", "🐲"
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Avatar selection
        document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => {
                document.querySelectorAll('.avatar').forEach(a => a.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedAvatar = e.target.dataset.avatar;
                this.checkStartButton();
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.difficulty = e.target.dataset.difficulty;
                this.checkStartButton();
            });
        });
        
        // Start game
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.movePlayer(e.target.dataset.direction);
            });
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.getCurrentScreen() !== 'game-screen') return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down', 
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                'Up': 'up',
                'Down': 'down',
                'Left': 'left', 
                'Right': 'right'
            };
            
            if (keyMap[e.key] || keyMap[e.code]) {
                e.preventDefault();
                this.movePlayer(keyMap[e.key] || keyMap[e.code]);
            }
        });
        
        // Heal button
        document.getElementById('heal-btn').addEventListener('click', () => {
            this.heal();
        });
        
        // Regenerate map button
        document.getElementById('regen-btn').addEventListener('click', () => {
            this.regenerateCurrentLevel();
        });
        
        // Restart level button
        document.getElementById('restart-level-btn').addEventListener('click', () => {
            this.restartCurrentLevel();
        });
        
        // Quit button
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitGame();
        });
        
        // Restart game
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restart();
        });
    }
    
    checkStartButton() {
        const startBtn = document.getElementById('start-game');
        startBtn.disabled = !this.selectedAvatar || !this.difficulty;
    }
    
    generateGameData() {
        const data = [];
        for (let level = 1; level <= 10; level++) {
            data.push(this.generateLevel(level));
        }
        return data;
    }
    
    // Algorithme simple pour garantir un chemin
    createPath(grid, size) {
        // Créer un chemin simple de (0,0) à (7,7)
        let x = 0, y = 0;
        
        while (x < size - 1 || y < size - 1) {
            grid[x][y] = 0; // marquer comme chemin
            
            if (x < size - 1 && Math.random() > 0.3) {
                x++; // avancer vers le bas
            } else if (y < size - 1) {
                y++; // avancer vers la droite
            } else {
                x++; // forcer vers le bas si bloqué
            }
        }
        grid[size-1][size-1] = 0; // s'assurer que la sortie est accessible
    }
    
    // Vérifier si un chemin existe entre start et exit
    hasPath(grid, size) {
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const queue = [[0, 0]];
        visited[0][0] = true;
        
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            
            if (x === size - 1 && y === size - 1) {
                return true;
            }
            
            for (let [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && 
                    !visited[nx][ny] && grid[nx][ny] !== 1) {
                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }
        
        return false;
    }
    
    generateLevel(level) {
        const size = 8;
        let grid;
        let attempts = 0;
        
        // Générer jusqu'à avoir un chemin valide
        do {
            grid = Array(size).fill().map(() => Array(size).fill(0));
            
            // Générer des murs aléatoirement
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if ((i !== 0 || j !== 0) && (i !== size-1 || j !== size-1)) {
                        if (Math.random() < 0.25) { // réduire la densité des murs
                            grid[i][j] = 1; // mur
                        }
                    }
                }
            }
            
            attempts++;
            if (attempts > 10) {
                // Forcer la création d'un chemin si trop d'échecs
                this.createPath(grid, size);
                break;
            }
        } while (!this.hasPath(grid, size));
        
        // Définir start et exit
        grid[0][0] = 2; // start
        grid[size-1][size-1] = 3; // exit
        
        // Ajouter ennemis et trésors
        let enemyCount = Math.min(level, 5);
        let treasureCount = 3;
        let safeAttempts = 0;
        
        while ((enemyCount > 0 || treasureCount > 0) && safeAttempts < 50) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            
            if (grid[x][y] === 0) {
                if (enemyCount > 0) {
                    grid[x][y] = 4; // enemy
                    enemyCount--;
                } else if (treasureCount > 0) {
                    grid[x][y] = 5; // treasure
                    treasureCount--;
                }
            }
            safeAttempts++;
        }
        
        return {
            grid: grid,
            enemies: this.difficulty === 'easy' ? level * 10 : this.difficulty === 'medium' ? level * 15 : level * 20
        };
    }
    
    regenerateCurrentLevel() {
        this.gameData[this.currentLevel - 1] = this.generateLevel(this.currentLevel);
        this.playerPos = { x: 0, y: 0 };
        this.renderBoard();
    }
    
    restartCurrentLevel() {
        this.healsLeft = this.currentLevel === 10 ? 2 : 1;
        this.health = this.maxHealth;
        this.playerPos = { x: 0, y: 0 };
        this.updateHUD();
        this.renderBoard();
    }
    
    quitGame() {
        if (confirm('Êtes-vous sûr de vouloir abandonner ?')) {
            this.restart();
        }
    }
    
    startGame() {
        this.switchScreen('game-screen');
        this.currentLevel = 1;
        this.health = this.maxHealth;
        this.rewards = 0;
        this.loadLevel();
    }
    
    loadLevel() {
        this.healsLeft = this.currentLevel === 10 ? 2 : 1;
        this.updateBackground();
        this.updateHUD();
        this.updateStory();
        this.renderBoard();
        this.playerPos = { x: 0, y: 0 };
    }
    
    updateBackground() {
        const bgIndex = Math.min(this.currentLevel - 1, this.backgrounds.length - 1);
        document.body.className = this.backgrounds[bgIndex];
    }
    
    updateHUD() {
        document.getElementById('level-info').textContent = `Niveau ${this.currentLevel}/10`;
        document.getElementById('health').textContent = `❤️ ${this.health}`;
        document.getElementById('rewards').textContent = `🏆 ${this.rewards}/${this.totalRewards}`;
        
        const healBtn = document.getElementById('heal-btn');
        healBtn.textContent = `💊 Soigner (${this.healsLeft})`;
        healBtn.disabled = this.healsLeft === 0 || this.health === this.maxHealth;
    }
    
    updateStory() {
        document.getElementById('story-text').textContent = this.stories[this.currentLevel - 1];
    }
    
    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        const level = this.gameData[this.currentLevel - 1];
        const grid = level.grid;
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                switch (grid[i][j]) {
                    case 0:
                        cell.classList.add('path');
                        break;
                    case 1:
                        cell.classList.add('wall');
                        break;
                    case 2:
                        cell.classList.add('start');
                        break;
                    case 3:
                        cell.classList.add('exit');
                        cell.textContent = '🚪';
                        break;
                    case 4:
                        cell.classList.add('enemy');
                        cell.textContent = '👹';
                        break;
                    case 5:
                        cell.classList.add('treasure');
                        cell.textContent = this.rewards_list[this.rewards % this.rewards_list.length];
                        break;
                }
                
                if (i === this.playerPos.x && j === this.playerPos.y) {
                    cell.textContent = this.selectedAvatar;
                    cell.style.background = '#ffd700';
                    cell.style.fontWeight = 'bold';
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    movePlayer(direction) {
        let newX = this.playerPos.x;
        let newY = this.playerPos.y;
        
        switch (direction) {
            case 'up': newX--; break;
            case 'down': newX++; break;
            case 'left': newY--; break;
            case 'right': newY++; break;
        }
        
        // Check boundaries
        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) return;
        
        const level = this.gameData[this.currentLevel - 1];
        const cellType = level.grid[newX][newY];
        
        // Check wall
        if (cellType === 1) return;
        
        // Move player
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        
        // Handle cell interactions
        this.handleCellInteraction(newX, newY, cellType);
        
        this.renderBoard();
    }
    
    handleCellInteraction(x, y, cellType) {
        const level = this.gameData[this.currentLevel - 1];
        
        switch (cellType) {
            case 3: // exit
                this.nextLevel();
                break;
            case 4: // enemy
                this.fight();
                level.grid[x][y] = 0; // remove enemy
                break;
            case 5: // treasure
                this.collectTreasure();
                level.grid[x][y] = 0; // remove treasure
                break;
        }
    }
    
    fight() {
        const damage = this.difficulty === 'easy' ? 15 : this.difficulty === 'medium' ? 20 : 25;
        this.health = Math.max(0, this.health - damage);
        
        if (this.health === 0) {
            this.gameOver();
        } else {
            this.updateHUD();
        }
    }
    
    collectTreasure() {
        this.rewards++;
        this.updateHUD();
    }
    
    heal() {
        if (this.healsLeft > 0 && this.health < this.maxHealth) {
            this.health = this.maxHealth;
            this.healsLeft--;
            this.updateHUD();
        }
    }
    
    nextLevel() {
        if (this.currentLevel === 10) {
            this.victory();
        } else {
            this.currentLevel++;
            this.loadLevel();
        }
    }
    
    victory() {
        document.getElementById('end-title').textContent = '🎉 Victoire !';
        document.getElementById('end-message').innerHTML = `
            Félicitations ! Vous avez terminé votre quête !<br>
            Récompenses collectées : ${this.rewards}/${this.totalRewards}<br>
            Vous avez gagné : ${this.animals_houses.join(' ')}
        `;
        this.switchScreen('end-screen');
    }
    
    gameOver() {
        document.getElementById('end-title').textContent = '💀 Défaite';
        document.getElementById('end-message').textContent = 'Votre aventure se termine ici... Voulez-vous réessayer ?';
        this.switchScreen('end-screen');
    }
    
    restart() {
        this.currentLevel = 1;
        this.health = this.maxHealth;
        this.rewards = 0;
        this.healsLeft = 1;
        this.playerPos = { x: 0, y: 0 };
        this.gameData = this.generateGameData();
        document.body.className = '';
        this.switchScreen('start-screen');
    }
    
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    getCurrentScreen() {
        const activeScreen = document.querySelector('.screen.active');
        return activeScreen ? activeScreen.id : null;
    }
}

// Service Worker pour le mode hors ligne
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}

// Initialiser le jeu
const game = new QuestGame();
