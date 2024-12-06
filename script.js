// Game Constants & Variables
let inputDir = {x: 0, y: 0};
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');
let speed = 5;
let score = 0;
let lastPaintTime = 0;
let gridSize = 22;
let snakeArr = [];
let food = {x: 6, y: 7};
let isGameRunning = false; // Flag to control game state
let hiscoreval = localStorage.getItem("hiscore") ? JSON.parse(localStorage.getItem("hiscore")) : 0;

// Function to reset the game
function resetGame(difficulty) {
    // Stop the game loop
    isGameRunning = false;

    // Reset game variables
    inputDir = {x: 0, y: 0};
    score = 0;
    scoreBox.innerHTML = "Score: 0";

    // Set game parameters based on difficulty
    if (difficulty === 'low') {
        speed = 5;
        gridSize = 22;
    } else if (difficulty === 'medium') {
        speed = 10;
        gridSize = 18;
    } else if (difficulty === 'high') {
        speed = 15;
        gridSize = 14;
    }

    // Initialize the snake to 1 block and center it
    const centerX = Math.floor(gridSize / 2);
    snakeArr = [{x: centerX, y: centerX}]; // Single block snake

    // Generate new food position away from the snake
    generateFood();

    // Reset the board dimensions
    const board = document.getElementById('board');
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    // Render the board with the new settings
    renderBoard();

    // Resume the game loop
    setTimeout(() => {
        isGameRunning = true;
    }, 500); // Short delay to avoid immediate collision checks
}

// Function to generate food away from the snake
function generateFood() {
    let newFoodPosition;
    while (true) {
        newFoodPosition = {
            x: Math.round(2 + (gridSize - 4) * Math.random()),
            y: Math.round(2 + (gridSize - 4) * Math.random())
        };

        // Ensure food does not overlap with the snake
        const isOnSnake = snakeArr.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y);
        if (!isOnSnake) break;
    }
    food = newFoodPosition;
}

// Function to render the board
function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear the board

    // Render the snake
    snakeArr.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.style.gridColumnStart = segment.x;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake');
        board.appendChild(snakeElement);
    });

    // Render the food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

// Game Functions
function main(ctime) {
    window.requestAnimationFrame(main);
    if (!isGameRunning) return; // Pause game logic during resets

    if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

function isCollide(snake) {
    // Check collision with walls
    if (snake[0].x >= gridSize || snake[0].x <= 0 || snake[0].y >= gridSize || snake[0].y <= 0) return true;

    // Check collision with itself (irrelevant for single block but keeps it extendable)
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function gameEngine() {
    if (isCollide(snakeArr)) {
        gameOverSound.play();
        musicSound.pause();
        if (score > hiscoreval) {
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
        }
        hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
        alert("Game Over. Press any key to restart!");
        resetGame(document.getElementById('difficulty').value); // Reset game
        return;
    }

    // Check if food is eaten
    if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
        foodSound.play();
        score += 1;
        scoreBox.innerHTML = "Score: " + score;
        snakeArr.unshift({x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y});
        generateFood(); // Generate new food
    }

    // Move the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = {...snakeArr[i]};
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    renderBoard();
}

// Initialize the game with difficulty
document.getElementById('difficulty').addEventListener('change', (e) => {
    resetGame(e.target.value);
});

// Start Game
musicSound.play();
hiscoreBox.innerHTML = "HiScore: " + hiscoreval; // Display the initial high score
resetGame('low');
window.requestAnimationFrame(main);

window.addEventListener('keydown', (e) => {
    if (!isGameRunning) return; // Ignore inputs if game isn't running

    inputDir = {x: 0, y: 1}; // Start moving the snake
    moveSound.play();
    switch (e.key) {
        case 'ArrowUp':
            inputDir = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            inputDir = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            inputDir = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            inputDir = {x: 1, y: 0};
            break;
    }
});
