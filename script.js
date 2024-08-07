const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let score = 0;
let level = 1;
let gameInterval;
let isPaused = false;

const colors = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

const tetrominoes = [
    [[1, 1, 1, 1]],
    [[1, 1, 1], [1]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1]],
    [[1, 1, 1], [0, 1]]
];

let currentTetromino;
let currentPosition;

function createBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('tetromino');
            gameBoard.appendChild(cell);
        }
    }
}

function drawTetromino() {
    currentTetromino.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                const index = (currentPosition.y + i) * COLS + (currentPosition.x + j);
                gameBoard.children[index].style.backgroundColor = currentTetromino.color;
            }
        });
    });
}

function eraseTetromino() {
    currentTetromino.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                const index = (currentPosition.y + i) * COLS + (currentPosition.x + j);
                gameBoard.children[index].style.backgroundColor = '';
            }
        });
    });
}

function moveDown() {
    eraseTetromino();
    currentPosition.y++;
    if (isCollision()) {
        currentPosition.y--;
        placeTetromino();
        checkLines();
        currentTetromino = getRandomTetromino();
        currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
        if (isCollision()) {
            gameOver();
        }
    }
    drawTetromino();
}

function moveLeft() {
    eraseTetromino();
    currentPosition.x--;
    if (isCollision()) {
        currentPosition.x++;
    }
    drawTetromino();
}

function moveRight() {
    eraseTetromino();
    currentPosition.x++;
    if (isCollision()) {
        currentPosition.x--;
    }
    drawTetromino();
}

function rotate() {
    eraseTetromino();
    const rotatedShape = currentTetromino.shape[0].map((_, i) =>
        currentTetromino.shape.map(row => row[i]).reverse()
    );
    const previousShape = currentTetromino.shape;
    currentTetromino.shape = rotatedShape;
    if (isCollision()) {
        currentTetromino.shape = previousShape;
    }
    drawTetromino();
}

function isCollision() {
    return currentTetromino.shape.some((row, i) =>
        row.some((value, j) => {
            if (value) {
                const x = currentPosition.x + j;
                const y = currentPosition.y + i;
                return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && gameBoard.children[y * COLS + x].style.backgroundColor !== '');
            }
            return false;
        })
    );
}

function placeTetromino() {
    currentTetromino.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                const index = (currentPosition.y + i) * COLS + (currentPosition.x + j);
                gameBoard.children[index].style.backgroundColor = currentTetromino.color;
            }
        });
    });
}

function checkLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if ([...Array(COLS).keys()].every(col => gameBoard.children[row * COLS + col].style.backgroundColor !== '')) {
            for (let r = row; r > 0; r--) {
                for (let c = 0; c < COLS; c++) {
                    gameBoard.children[r * COLS + c].style.backgroundColor = gameBoard.children[(r - 1) * COLS + c].style.backgroundColor;
                }
            }
            score += 100;
            scoreElement.textContent = score;
            if (score % 1000 === 0) {
                level++;
                levelElement.textContent = level;
                clearInterval(gameInterval);
                gameInterval = setInterval(moveDown, 1000 - (level - 1) * 100);
            }
            row++;
        }
    }
}

function getRandomTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    return {
        shape: tetrominoes[index],
        color: colors[index]
    };
}

function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! Score: ${score}`);
}

function handleKeyPress(event) {
    if (!isPaused) {
        switch (event.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
        }
    }
}

function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(moveDown, 1000 - (level - 1) * 100);
        startButton.textContent = 'Pause';
    } else {
        clearInterval(gameInterval);
        startButton.textContent = 'Resume';
    }
    isPaused = !isPaused;
}

function handleClick(event) {
    if (!isPaused) {
        const rect = gameBoard.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickedColumn = Math.floor(clickX / (rect.width / COLS));

        eraseTetromino();
        const oldX = currentPosition.x;
        currentPosition.x = clickedColumn;

        if (isCollision()) {
            currentPosition.x = oldX;
        }

        drawTetromino();
    }
}

function startGame() {
    createBoard();
    currentTetromino = getRandomTetromino();
    currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
    drawTetromino();
    gameInterval = setInterval(moveDown, 1000);
    document.addEventListener('keydown', handleKeyPress);
    gameBoard.addEventListener('click', handleClick);
    startButton.addEventListener('click', togglePause);
}

startGame();