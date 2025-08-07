// Game elements
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d"); // Context
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");

// Game width and height
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

// Colors for elements
const boardBackground = "white";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";

// Game variables and constants
const unitSize = 25;
let running = false;
let xVelosity = unitSize;
let yVelosity = 0;
let foodX;
let foodY;
let score = 0;
let snake = [
    {x:unitSize * 4, y:0},
    {x:unitSize * 3, y:0},
    {x:unitSize * 2, y:0},
    {x:unitSize, y:0},
    {x:0, y:0}
];

// Events
window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

// Start the game
gameStart();

// Game functions
function gameStart() {
    running = true;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
};

function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, 100);
    }
    else {
        displayGameOver();
    }
};

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};

function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    };

    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameHeight - unitSize);
};

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
};

function moveSnake() {
    const head = { x: snake[0].x + xVelosity,
                   y: snake[0].y + yVelosity};
    snake.unshift(head);

    // if food is eaten
    if (snake[0].x == foodX &&
        snake[0].y == foodY) {
        score++;
        scoreText.textContent = score;
        createFood();
    }
    else {
        snake.pop();
    }
};

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
};

function changeDirection(event) {
    const keyPressed = event.keyCode;

    const LEFT = 65;
    const UP = 87;
    const RIGHT = 68;
    const DOWN = 83;

    const movingUp = (yVelosity == -unitSize);
    const movingDown = (yVelosity == unitSize);
    const movingLeft = (xVelosity == -unitSize);
    const movingRight = (xVelosity == unitSize);

    switch (true) {
        case (keyPressed == LEFT && !movingRight):
            xVelosity = -unitSize;
            yVelosity = 0;
            break;
        case (keyPressed == UP && !movingDown):
            xVelosity = 0;
            yVelosity = -unitSize;
            break;
        case (keyPressed == RIGHT && !movingLeft):
            xVelosity = unitSize;
            yVelosity = 0;
            break;
        case (keyPressed == DOWN && !movingUp):
            xVelosity = 0;
            yVelosity = unitSize;
            break;
    }
};

function checkGameOver() {
    switch (true) {
        case (snake[0].x < 0):
        case (snake[0].x >= gameWidth):
        case (snake[0].y < 0):
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }

    for (let i = 1; i < snake.length; i++)
        if (snake[i].x == snake[0].x &&
            snake[i].y == snake[0].y)
            running = false
};

function displayGameOver() {
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Game over!", gameWidth / 2, gameHeight / 2);
    running = false;
};

function resetGame() {
    score = 0;
    xVelosity = unitSize;
    yVelosity = 0;

    snake = [
        {x:unitSize * 4, y:0},
        {x:unitSize * 3, y:0},
        {x:unitSize * 2, y:0},
        {x:unitSize, y:0},
        {x:0, y:0}
    ];
    gameStart();
};