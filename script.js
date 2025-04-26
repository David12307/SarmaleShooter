// 1. Referințe DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const chooseBunica = document.getElementById('choose-bunica');
const chooseBunicul = document.getElementById('choose-bunicul');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 2. Variabile globale
let character = null; // 'bunica' sau 'bunicul'
let playerImage = new Image();
let playerX = canvas.width / 2 - 32;
let playerY = canvas.height - 80;
let playerSpeed = 5;
let playerScore = 0;
let playerHealth = 4;
let keys = {}; 
let bullets = []; 
let gameLoopId = null;

let fallingSpeedMultiplier = 1; // multiplu pentru viteza obiectelor care cad
const bulletImage = new Image();
bulletImage.src = 'sarma.png';

let fallingObjects = []; // lista cu obiecte care cad

// 3. Event listeners
chooseBunica.addEventListener('click', () => startGame('bunica'));
chooseBunicul.addEventListener('click', () => startGame('bunicul'));

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.code === 'Space') {
        fireBullet(); // Apăsarea Space va trimite o "sarmală"
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});


// Selectăm elementele
const loadingScreen = document.getElementById('loading-screen');

// Funcție comună pentru alegerea personajului
function startLoading() {
    startScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        setTimeout(() => {
            gameScreen.classList.remove('opacity-0'); // Facem fade-in
        }, 10); // mic delay ca să forțăm browserul să aplice tranziția
        startGame(); 
    }, 3000);
}

// Adaugă evenimente la butoane
chooseBunica.addEventListener('click', startLoading);
chooseBunicul.addEventListener('click', startLoading);


// 4. Start joc
function startGame(selectedChar) {
    character = selectedChar;

    if (character === 'bunica') {
        playerImage.src = 'bunica.png';
    } else {
        playerImage.src = 'bunicul.png';
    }

    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    initGame();
}

// 5. Inițializare joc
function initGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerX = canvas.width / 2 - 32;
    playerY = canvas.height - 80;

    ctx.drawImage(playerImage, playerX, playerY, 64, 64);

    setInterval(spawnFallingObject, 1500);
    requestAnimationFrame(updateLoop);
}

// 6. Loop-ul principal de joc
function updateLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mișcare jucător
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['ArrowRight'] && playerX < canvas.width - 64) {
        playerX += playerSpeed;
    }

    ctx.drawImage(playerImage, playerX, playerY, 64, 64);

    updateBullets();
    updateFallingObjects();
    checkCollisions();

    playerSpeed += 0.001;
    fallingSpeedMultiplier += 0.0001; 

    gameLoopId = requestAnimationFrame(updateLoop);
}

// 7. Trage sarmale
function fireBullet() {
    bullets.push({
        x: playerX + 32 - 8,
        y: playerY,
        speed: 6,
        width: 16,
        height: 16
    });
}

function updateBullets() {
    for (let bullet of bullets) {
        bullet.y -= bullet.speed;
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
    }

    bullets = bullets.filter(bullet => bullet.y > -bullet.height && !bullet.hit);
}

// 8. Obiective de doborât
const targets = [
    { name: 'fiica', src: 'fiica.png', hp: 1 },
    { name: 'fiu', src: 'fiu.png', hp: 1 },
    { name: 'mama', src: 'mama.png', hp: 2 },
    { name: 'tata', src: 'tata.png', hp: 3 },
];

function spawnFallingObject() {
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    const image = new Image();
    image.src = randomTarget.src;

    const x = Math.random() * (canvas.width - 48);
    const y = -48;

    fallingObjects.push({
        image,
        x,
        y,
        speed: 2 + Math.random() * 2,
        hp: randomTarget.hp,
        width: 40,
        height: 40,
        name: randomTarget.name,
        destroyed: false,
        destroyAnimationTime: 0,
        scale: 1,
    });
}

function updateFallingObjects() {
    for (let obj of fallingObjects) {
        obj.y += obj.speed * fallingSpeedMultiplier;

        if (obj.destroyed) {
            obj.scale -= 0.03;
            obj.destroyAnimationTime--;

            if (obj.scale < 0) obj.scale = 0;
        }

        const drawWidth = obj.width * obj.scale;
        const drawHeight = obj.height * obj.scale;
        ctx.drawImage(obj.image, obj.x + (obj.width - drawWidth)/2, obj.y + (obj.height - drawHeight)/2, drawWidth, drawHeight);

        if (!obj.destroyed) {
            ctx.fillStyle = 'red';
            ctx.font = '12px sans-serif';
            ctx.fillText('❤️'.repeat(obj.hp), obj.x, obj.y - 5);
        }
    }

    fallingObjects = fallingObjects.filter(obj => !(obj.destroyed && obj.destroyAnimationTime <= 0) && obj.y < canvas.height + 48);
}

function endGame() {
    cancelAnimationFrame(gameLoopId); // 🛑 STOP the game loop
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');

    let gameOverText = document.getElementById("gameOverMessage");
    let gameOverIcon = document.getElementById("gameOverIcon");
    let finalScore = document.getElementById('finalScore');
    finalScore.textContent = playerScore;
    if (playerScore >= 100) {
        gameOverText.innerHTML = `Ai distrus sarmalele cu stil! 🍽️`;
        gameOverIcon.textContent = '🏆';
    } else if (playerScore >= 50) {
        gameOverText.innerHTML = `Ai făcut o treabă bună! Aproape câștigător! 😎`;
        gameOverIcon.textContent = '😱';
    } else if (playerScore >= 20) {
        gameOverText.innerHTML = `Nu-i rău! Mai antrenează-te! 💪`;
        gameOverIcon.textContent = '😱';
    } else {
        gameOverText.innerHTML = `Oh nu! Ai scăpat prea multe sarmale! 😱`;
        gameOverIcon.textContent = '😱';
    }

    document.getElementById('reloadButton').addEventListener('click', () => {
        location.reload();
    });
    document.getElementById('backToStartButton').addEventListener('click', () => {
        location.reload();
    });
}

function checkCollisions() {
    for (let bullet of bullets) {
        for (let obj of fallingObjects) {
            // Check if the bullet hits the falling object
            if (
                bullet.x < obj.x + obj.width &&
                bullet.x + bullet.width > obj.x &&
                bullet.y < obj.y + obj.height &&
                bullet.y + bullet.height > obj.y
            ) {
                obj.hp--; // Decrease object health by 1 on bullet hit
                playerScore += 2;
                document.getElementById('score').textContent = playerScore;
                bullet.hit = true; // Mark the bullet as hit

                // If object's health reaches 0, mark it for destruction and start animation
                if (obj.hp <= 0 && !obj.destroyed) {
                    obj.destroyed = true;
                    obj.destroyAnimationTime = 30; // Animation time for destruction
                }
            }
        }
    }

    // Remove bullets that hit objects
    bullets = bullets.filter(bullet => !bullet.hit);

    // Check if falling objects reach the bottom of the screen
    for (let obj of fallingObjects) {
        // If object reaches the bottom and is not destroyed
        if (obj.y >= canvas.height - obj.height && !obj.destroyed) {
            // Reduce grandparent's health based on the object’s remaining health
            playerHealth -= obj.hp / 4; // Adjust this value for different health effects
            obj.destroyed = true; // Mark object as destroyed when it hits the bottom
            obj.destroyAnimationTime = 30; // Start destruction animation
        }
    }

    // Filter out destroyed objects that have completed their destruction animation
    fallingObjects = fallingObjects.filter(obj => !(obj.destroyed && obj.destroyAnimationTime <= 0) && obj.y < canvas.height + 48);

    document.getElementById('lives').textContent = playerHealth;

    // Check if the player's health reaches 0
    if (playerHealth <= 0) {
        endGame(); // Call the endGame function when health reaches 0
    }
}

