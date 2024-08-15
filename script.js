// ゲームの設定
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const blockSize = 30;
const boardWidth = canvas.width / blockSize;
const boardHeight = canvas.height / blockSize;

let board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
let score = 0;
let currentBlock = null;
let blockX = 0;
let blockY = 0;
let intervalId = null;

const colors = ['red', 'blue', 'yellow', 'green', 'purple', 'cyan'];

function updateScore() {
    document.getElementById('score').textContent = `スコア: ${score}`;
}

function removeFullLines() {
    let linesToRemove = [];
    for (let y = 0; y < boardHeight; y++) {
        if (board[y].every(cell => cell > 0)) {
            linesToRemove.push(y);
        }
    }
    
    linesToRemove.forEach(line => {
        board.splice(line, 1);
        board.unshift(Array(boardWidth).fill(0));
        score += 100; // スコアの増加
    });
    
    updateScore();
    if (score % 500 === 0) {
        increaseDifficulty();
    }
}

function randomBlock() {
    const shapes = [
        [[1, 1, 1, 1]], // I
        [[1, 1], [1, 1]], // O
        [[0, 1, 1], [1, 1, 0]], // S
        [[1, 1, 0], [0, 1, 1]], // Z
        [[1, 1, 1], [0, 1, 0]], // T
        [[1, 1, 1], [1, 0, 0]], // L
        [[1, 1, 1], [0, 0, 1]]  // J
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return { shape, color };
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeStyle = '#fff'; // 白い線
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x] > 0) {
                drawBlock(x, y, colors[board[y][x] - 1]);
            }
        }
    }
}

function drawCurrentBlock() {
    if (currentBlock) {
        currentBlock.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    drawBlock(blockX + dx, blockY + dy, currentBlock.color);
                }
            });
        });
    }
}

function moveBlockDown() {
    blockY++;
    if (collision()) {
        blockY--;
        mergeBlock();
        removeFullLines();
        newBlock();
    }
    drawBoard();
    drawCurrentBlock();
}

function collision() {
    return currentBlock.shape.some((row, dy) => 
        row.some((value, dx) => 
            value && (board[blockY + dy] && board[blockY + dy][blockX + dx]) !== 0
        )
    );
}

function mergeBlock() {
    currentBlock.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[blockY + dy][blockX + dx] = colors.indexOf(currentBlock.color) + 1;
            }
        });
    });
}

function newBlock() {
    currentBlock = randomBlock();
    blockX = Math.floor(boardWidth / 2) - Math.floor(currentBlock.shape[0].length / 2);
    blockY = 0;

    if (collision()) {
        clearInterval(intervalId);
        alert('ゲームオーバー');
    }
}

function startGame() {
    board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
    score = 0;
    updateScore();
    newBlock();
    document.getElementById('start-btn').style.display = 'none'; // ゲーム開始ボタンを非表示
    clearInterval(intervalId); 
    intervalId = setInterval(moveBlockDown, 1500); 
}

function increaseDifficulty() {
    clearInterval(intervalId); 
    intervalId = setInterval(moveBlockDown, Math.max(500, 1500 - (Math.floor(score / 500)) * 100)); 
}

document.getElementById('start-btn').addEventListener('click', function() {
    startGame();
});

document.getElementById('left-btn').addEventListener('click', function() {
    blockX--;
    if (collision()) blockX++;
    drawBoard();
    drawCurrentBlock();
});

document.getElementById('right-btn').addEventListener('click', function() {
    blockX++;
    if (collision()) blockX--;
    drawBoard();
    drawCurrentBlock();
});

document.getElementById('down-btn').addEventListener('click', function() {
    moveBlockDown();
});

document.getElementById('rotate-btn').addEventListener('click', function() {
    const tempShape = currentBlock.shape;
    currentBlock.shape = rotate(currentBlock.shape);
    if (collision()) {
        currentBlock.shape = tempShape;
    }
    drawBoard();
    drawCurrentBlock();
});

function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

