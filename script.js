const ROW = 9;
const COL = 16;
const TYPES = 36;
const COPIES = 4;
const TIME_LIMIT = 360;
const CELL_SIZE = 70;
const BOARD_PADDING = 70;
const STONE = -1;
const STONE_CELLS = [
    [2, 3],
    [2, 12],
    [4, 6],
    [4, 9],
    [6, 3],
    [6, 12],
    [7, 6],
    [7, 9]
];
const FROZEN_COUNT = 14;

const game = document.getElementsByClassName("game")[0];
const gameScreen = document.getElementsByClassName("game-screen")[0];
const play = document.getElementsByClassName("play")[0];
const board = document.getElementsByClassName("board")[0];
const timeTxt = document.getElementById("time");
const scoreTxt = document.getElementById("score");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart");
const hintBtn = document.getElementById("hint-btn");
const shuffleBtn = document.getElementById("shuffle");
const canvas = document.getElementById("path-canvas");
const ctx = canvas.getContext("2d");
const levelSelect = document.getElementById("level-select");

canvas.width = COL * CELL_SIZE + BOARD_PADDING * 2;
canvas.height = ROW * CELL_SIZE + BOARD_PADDING * 2;

let matrix = [];
let selected = null;
let score = 0;
let timeLeft = TIME_LIMIT;
let timerId = null;
let gameOver = false;
let level = 1;
let frozen = [];
let hiddenCells = new Set();

//List
function createList() {
    const list = [];
    for (let type = 1; type <= TYPES; type++) {
        for (let i = 0; i < COPIES; i++) {
            list.push(type);
        }
    }
    return list;
}

//Apply Fisher-Yates to shuffle 
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = list[i];
        list[i] = list[j];
        list[j] = temp;
    }
    return list;
}
//Change to 2d array
function createBoard(){
    const list = shuffle(createList());
    const matrix = [];
    let k = 0;
    for (let row = 0; row < ROW; row++) {
        matrix[row] = [];
        for (let col = 0; col < COL; col++) {
            matrix[row][col] = list[k];
            k++;
        }
    }
    return matrix;
}

//render
function renderBoard(matrix) {
    board.innerHTML = "";
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            if (matrix[row][col] === STONE) {
                cell.classList.add("stone");
                cell.textContent = "🪨";
                board.appendChild(cell);
                continue;
            }
            if (matrix[row][col] === 0) {
                cell.classList.add("empty");
                board.appendChild(cell);
                continue;
            }
            if(frozen[row][col]) {
                cell.classList.add("frozen");
            }
            if (level === 6 && isHidden(row, col)) {
                const cover = document.createElement("div");

                cover.className = "hidden-cover";
                cover.textContent = "?";

                cell.appendChild(cover);
            }

            const img = document.createElement("img");
            img.src = "assets/pkm-icon/" + matrix[row][col] + ".png";
            img.alt = "";
            cell.appendChild(img);
            board.appendChild(cell);
        }
    }
}

function getCell(row, col) {
    return board.children[row * COL + col];
}

function removeCell(row, col) {
    matrix[row][col] = 0;
    getCell(row, col).classList.add("empty");
}

function handleClick(row, col) {
    if (level === 6 && isHidden(row, col)) {
        hiddenCells.delete(cellKey(row, col));

        const cell = getCell(row, col);
        const cover = cell.querySelector(".hidden-cover");

        if (cover) {
            cover.remove();
        }

        setTimeout(() => {
            if (level !== 6 || matrix[row][col] <= 0) return;

            if (selected?.row === row && selected?.col === col) return;

            hiddenCells.add(cellKey(row, col));

            const cover = document.createElement("div");
            cover.className = "hidden-cover";
            cover.textContent = "?";

            getCell(row, col).appendChild(cover);
        }, 5000);
    }
    //select nothing
    if (selected === null) {
        selected = {row, col};
        getCell(row, col).classList.add("selected");
        return;
    }
    //1 cell selected
    if (selected.row === row && selected.col === col) {
        getCell(row, col).classList.remove("selected");
        selected = null;
        return;
    }

    //compare with the one selected
    const first = selected;
    getCell(first.row, first.col).classList.remove("selected");
    const path = canConnect(first.row, first.col, row, col);

    if (path) {
        drawPath(path);
        selected = null;

        setTimeout(() => {
            unfreezeNearPath(path);
            removeCell(first.row, first.col);
            removeCell(row, col);

            score += 10;
            scoreTxt.textContent = score;

            if (checkWin()) {
                if (level < 6) {
                    startLevel(level + 1);
                } else {
                    endGame("You win!");
                }
            } else {
                if (level === 2) {
                    applyGravity();
                }

                if (level === 5) {
                    swapRandom();
                }

                autoShuffle();
            }
        }, 300);
    } else {
        selected = {row, col};
        getCell(row, col).classList.add("selected");
    }
}

//Time
function startTimer() {
    stopTimer();
    timeLeft = TIME_LIMIT;
    timeTxt.textContent = timeLeft;
    timerId = setInterval(() => {
        timeLeft--;
        timeTxt.textContent = timeLeft;
        if(timeLeft <= 0) {
            stopTimer();
            endGame("Time's up!");
        }
    }, 1000);
    
}

function stopTimer() {
    clearInterval(timerId);
}

function isEmpty(r, c) {
    if (r < 0 || r >= ROW || c < 0 || c >= COL) return true;

    if(frozen[r][c]) return false;
    return matrix[r][c] === 0;
}

function canGoStraight(r1, c1, r2, c2) {
    if(r1 === r2) {
        const start = Math.min(c1, c2);
        const end = Math.max(c1, c2);
        for (let c = start + 1; c < end; c++) {
            if(!isEmpty(r1, c)) return null;
        }
        return [[r1, c1], [r2, c2]];
    }
    if (c1 === c2) {
        const start = Math.min(r1, r2);
        const end = Math.max(r1, r2);
        for (let r = start + 1; r < end; r++) {
            if(!isEmpty(r, c1)) return null;
        }
        return [[r1, c1], [r2, c2]];
    }
    return null;
}
function canGoWith2Lines(r1, c1, r2, c2) {
    if(isEmpty(r1, c2) &&
        canGoStraight(r1, c1, r1, c2 ) &&
        canGoStraight(r1, c2, r2, c2))
        return [[r1,c1], [r1, c2], [r2, c2]];
    if(isEmpty(r2, c1) &&
        canGoStraight(r1, c1, r2, c1) &&
        canGoStraight(r2, c1, r2, c2))
        return [[r1, c1], [r2, c1], [r2, c2]];
    return null;
}

function canGoWith3Lines(r1, c1, r2, c2) {
    for(let c = -1; c <= COL; c++) {
        if(isEmpty(r1, c) && isEmpty(r2, c) && 
            canGoStraight(r1, c1, r1, c) && 
            canGoStraight(r1, c, r2, c) && 
            canGoStraight(r2, c, r2, c2))
            return [[r1, c1], [r1, c], [r2, c], [r2, c2]];
    }
    for(let r = -1; r <= ROW; r++) {
        if(isEmpty(r, c1) && isEmpty(r, c2) && 
            canGoStraight(r1, c1, r, c1) && 
            canGoStraight(r, c1, r, c2) && 
            canGoStraight(r, c2, r2, c2))
            return [[r1, c1], [r, c1], [r, c2], [r2, c2]];
    }
    return null;
}

function canConnect(r1, c1, r2, c2) {
    if(frozen[r1][c1] || frozen[r2][c2]) return null;
    if(r1 === r2 && c1 === c2) return null;

    if (matrix[r1][c1] <= 0 || matrix[r2][c2] <= 0) {
        return null;
    }
    if (matrix[r1][c1] !== matrix[r2][c2]) {
        return null;
    }

    return canGoStraight(r1, c1, r2, c2) || canGoWith2Lines(r1, c1, r2, c2) || canGoWith3Lines(r1, c1, r2, c2);
}

function drawPath(path) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    path.forEach(([row, col], index) => {
        const x = BOARD_PADDING + col * CELL_SIZE + CELL_SIZE / 2;
        const y = BOARD_PADDING + row * CELL_SIZE + CELL_SIZE / 2;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 300);
}

function checkWin() {
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if (matrix[row][col] > 0) return false;
        }
    }
    return true;
}

function endGame(text) {
    stopTimer();
    gameOver = true;
    message.textContent = text;
    finalScore.textContent = "Score:" + score;
    overlay.style.display = "flex";
}

function connectPossible() {
    for (let r1 = 0; r1 < ROW; r1++) {
        for (let c1 = 0; c1 < COL; c1++) {
            if (matrix[r1][c1] <= 0 || frozen[r1][c1]) continue;
            
            for (let r2 = 0; r2 < ROW; r2++) {
                for (let c2  = 0; c2 < COL; c2++) {
                    if (matrix[r2][c2] <= 0 || frozen[r2][c2]) continue;
                    
                    if(canConnect(r1, c1, r2, c2)){
                        return {r1, c1, r2, c2};
                    }
                }
            }
        }
    }
    return null;
}

function showHint() {
    if(gameOver) return;
    const find = connectPossible();
    if(find === null) return;
    
    const cell1 = getCell(find.r1, find.c1);
    const cell2 = getCell(find.r2, find.c2);
    cell1.classList.add("hint");
    cell2.classList.add("hint");
    setTimeout(() => {
        cell1.classList.remove("hint");
        cell2.classList.remove("hint");
    }, 1000);
    
}

function shuffleCurrentBoard() {
    if (gameOver) return;

    //collect current cell
    const values = [];
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if (matrix[row][col] > 0) {
                values.push(matrix[row][col]);
            }
        }
    }
    
    shuffle(values);

    // shuffle again
    let k = 0;
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if (matrix[row][col] > 0) {
                matrix[row][col] = values[k];
                const img = getCell(row, col).querySelector("img");
                img.src = "assets/pkm-icon/" + values[k] + ".png";
                k++;
            }
        }
    }
    
    if (selected !== null) {
        getCell(selected.row, selected.col).classList.remove("selected");
        selected = null;
    }
}

function autoShuffle() {
    if(gameOver) return;
    for(let i = 0; i < 50 && connectPossible() === null; i++) {
        shuffleCurrentBoard();
    }
}

//level game
function startLevel(newLevel) {
    level = newLevel;
    levelSelect.value = level;

    if (level === 3) {
        matrix = createLevel3Board();
    } else {
        matrix = createBoard();
    }
    createFrozen();

    createHiddenCells();

    selected = null;
    renderBoard(matrix);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//lv2
function applyGravity() {
    for (let col = 0; col < COL; col++) {
        const values = [];
        for (let row = ROW - 1; row >= 0; row--) {
            if(matrix[row][col] !== 0) {
                values.push(matrix[row][col]);
            }
        }
        for (let row = ROW - 1; row >= 0; row--) {
            matrix[row][col] = values.shift() || 0;
        }
    }

    renderBoard(matrix);
}

//lv3
function createLevel3Board() {
    const list = [];
    for (let type = 1; type <= 34; type++) {
        for (let i = 0; i < 4; i++) {
            list.push(type);
        }
    }
    shuffle(list);
    
    const newMatrix = [];
    let index = 0;
    
    for (let row = 0; row < ROW; row++) {
        newMatrix[row] = [];
        for (let col = 0; col < COL; col++) {
            const isStone = STONE_CELLS.some(([r, c]) => r === row && c === col);
            if (isStone) {
                newMatrix[row][col] = STONE;
            } else {
                newMatrix[row][col] = list[index];
                index++;
            }
        }
    }
    return newMatrix;
}

//lv4
function createFrozen() {
    frozen = [];
    for (let row = 0; row < ROW; row++) {
        frozen[row] = [];
        for (let col = 0; col < COL; col++) {
            frozen[row][col] = false;
        }
    }
    if (level === 4) {
        let count = 0;
        while (count < FROZEN_COUNT) {
            const row = Math.floor(Math.random() * ROW);
            const col = Math.floor(Math.random() * COL);
            if(frozen[row][col] === false) {
                frozen[row][col] = true;
                count++;
            }
        }
    }
}

function unfreeze(row, col) {
    if(row < 0 || row >= ROW || col < 0 || col >= COL) return;

    if(frozen[row][col]) {
        frozen[row][col] = false;
        getCell(row, col).classList.remove("frozen");
    }
}

function unfreezeNearCell(row, col) {
    unfreeze(row - 1, col);
    unfreeze(row + 1, col);
    unfreeze(row, col - 1);
    unfreeze(row, col + 1);
}

function unfreezeNearPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
        const [r1, c1] = path[i];
        const [r2, c2] = path[i + 1];
        
        if (r1 === r2) {
            const start = Math.min(c1, c2);
            const end = Math.max(c1, c2);

            for (let col = start; col <= end; col++) {
                unfreezeNearCell(r1, col);
            }
        }
        
        if (c1 === c2) {
            const start = Math.min(r1, r2);
            const end = Math.max(r1, r2);

            for (let row = start; row <= end; row++) {
                unfreezeNearCell(row, c1);
            }
        }
    }
}

//lv5
function swapRandom() {
    const positions = [];
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if(matrix[row][col] > 0) {
                positions.push({row, col});
            }
        }
    }
    const pairs = [];
    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            const a = positions[i];
            const b = positions[j];
            if( matrix[a.row][a.col] !== matrix[b.row][b.col] ) {
                pairs.push([a, b]);
            }
        }
    }
    if (pairs.length === 0) return;

    //randomly choose two animals
    const index = Math.floor(Math.random() * pairs.length);
    const [a, b] = pairs[index];

    //swap their values in the matrix
    const temp = matrix[a.row][a.col];
    matrix[a.row][a.col] = matrix[b.row][b.col];
    matrix[b.row][b.col] = temp;
    
    //update img
    getCell(a.row, a.col).querySelector("img").src =
        "assets/pkm-icon/" + matrix[a.row][a.col] + ".png";

    getCell(b.row, b.col).querySelector("img").src =
        "assets/pkm-icon/" + matrix[b.row][b.col] + ".png";
}

//lv6
function cellKey(row, col) {
    return `${row}-${col}`;
}

function isHidden(row, col) {
    return hiddenCells.has(cellKey(row, col));
}

function createHiddenCells() {
    hiddenCells.clear();

    if (level !== 6) return;

    const positions = [];

    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            //only hide cell > 0
            if (matrix[r][c] > 0) {
                positions.push({ r, c });
            }
        }
    }

    //random 30-40% hide
    const ratio = 0.3 + Math.random() * 0.1;
    const hiddenCount = Math.floor(positions.length * ratio);

    //shuffle list position
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] =
            [positions[j], positions[i]];
    }

    for (let i = 0; i < hiddenCount; i++) {
        const { r, c } = positions[i];
        hiddenCells.add(cellKey(r, c));
    }
}

//start game
function initGame() {
    game.style.display = "none";
    gameScreen.style.display = "flex";
    gameOver = false;
    overlay.style.display = "none";
    score = 0;
    scoreTxt.textContent = score;
    startTimer();
    startLevel(Number(levelSelect.value));
}
play.addEventListener("click", initGame);
board.addEventListener("click", function (e) {
    if(gameOver === true) {
        return;
    }
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (matrix[row][col] <= 0 || frozen[row][col]) return;
    handleClick(row, col);
});

restartBtn.addEventListener("click", initGame);
hintBtn.addEventListener("click", showHint);
shuffleBtn.addEventListener("click", shuffleCurrentBoard);
levelSelect.addEventListener("change", function () {
    const newLevel = Number(levelSelect.value);
    
    if (gameOver) {
        gameOver = false;
        overlay.style.display = "none";
        startTimer();
    }

    startLevel(newLevel);
});

