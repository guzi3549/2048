const gridContainer = document.querySelector('.grid-container');
const restartButton = document.getElementById('restart');
const undoButton = document.getElementById('undo');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('languageSelect');

let grid = [...Array(4)].map(() => Array(4).fill(0));
let score = 0;
let startX, startY;
let previousStates = [];

const texts = {
    en: {
        title: "2048",
        winMessage: "Congratulations! You've reached 2048!",
        loseMessage: "Game Over! No more moves.",
        score: "Score: "
    },
    ru: {
        title: "2048",
        winMessage: "Поздравляем! Вы достигли 2048!",
        loseMessage: "Игра окончена! У вас не осталось ходов.",
        score: "Счет: "
    }
};

let currentLanguage = 'ru';

function updateText() {
    document.querySelector('h1').innerText = texts[currentLanguage].title;
    document.getElementById('scoreLabel').innerText = texts[currentLanguage].score;
}

function createTile() {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    return tile;
}

function drawGrid() {
    gridContainer.innerHTML = '';
    for (let row of grid) {
        for (let tile of row) {
            const tileElement = createTile();
            tileElement.innerText = tile || '';
            tileElement.style.backgroundColor = getTileColor(tile);
            gridContainer.appendChild(tileElement);
        }
    }
}

function getTileColor(value) {
    switch (value) {
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f67c5f';
        case 128: return '#f9f5d9';
        case 256: return '#e8e4d0';
        case 512: return '#e9c97c';
        case 1024: return '#edc53f';
        case 2048: return '#edc53f';
        default: return '#cdc1b4';
    }
}

function initGame() {
    grid = [...Array(4)].map(() => Array(4).fill(0));
    score = 0;
    previousStates = []; // Очистка истории ходов
    addRandomTile();
    addRandomTile();
    drawGrid();
    document.getElementById('score').innerText = score;
}

function addRandomTile() {
    let emptyTiles = [];
    grid.forEach((row, rIndex) => {
        row.forEach((tile, cIndex) => {
            if (tile === 0) {
                emptyTiles.push([rIndex, cIndex]);
            }
        });
    });
    if (emptyTiles.length > 0) {
        const [rIndex, cIndex] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[rIndex][cIndex] = Math.random() < 0.9 ? 2 : 4;
    }
}

function canMove() {
    if (grid.some(row => row.includes(0))) return true;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return true;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return true;
        }
    }
    return false;
}

function move(direction) {
    if (!canMove()) {
        alert(texts[currentLanguage].loseMessage);
        return;
    }
    
    previousStates.push(JSON.parse(JSON.stringify(grid))); // Сохраняем текущее состояние для отмены
    let moved = false;
    const originalGrid = JSON.parse(JSON.stringify(grid));

    for (let i = 0; i < 4; i++) {
        const row = direction === 'left' || direction === 'right' ? grid[i] : grid.map(r => r[i]);
        if (direction === 'right' || direction === 'down') {
            row.reverse();
        }

        const newRow = [];
        let skip = false;

        for (let j = 0; j < 4; j++) {
            if (row[j] === 0) continue;

            if (!skip && row[j] === row[j + 1]) {
                newRow.push(row[j] * 2);
                score += row[j] * 2; // Увеличиваем счет
                skip = true;
                j++; // пропустить следующую плитку
            } else {
                newRow.push(row[j]);
                skip = false;
            }
        }

        while (newRow.length < 4) {
            newRow.push(0);
        }

        if (direction === 'right' || direction === 'down') {
            newRow.reverse();
        }

        if (direction === 'left' || direction === 'right') {
            grid[i] = newRow;
        } else {
            for (let k = 0; k < 4; k++) {
                grid[k][i] = newRow[k];
            }
        }

        if (JSON.stringify(originalGrid) !== JSON.stringify(grid)) {
            moved = true;
        }
    }

    if (moved) {
        addRandomTile();
        drawGrid();
        document.getElementById('score').innerText = score; // Обновляем счет
        checkWin();
    }
}

function undoMove() {
    if (previousStates.length > 0) {
        grid = previousStates.pop(); // Возвращаем предыдущее состояние
        drawGrid();
        document.getElementById('score').innerText = score; // Обновляем счет
    }
}

function checkWin() {
    for (let row of grid) {
        if (row.includes(2048)) {
            alert(texts[currentLanguage].winMessage);
            return true;
        }
    }
    return false;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
    }
});

function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (diffY > 0) {
            move('down');
        } else {
            move('up');
        }
    }
}

document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleTouchEnd);

restartButton.addEventListener('click', initGame);
undoButton.addEventListener('click', undoMove);
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});

languageSelect.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    updateText();
});

initGame();
