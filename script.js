const ROW = 9;
const COL = 16;
const TYPES = 36;
const COPIES = 4;
const TIME_LIMIT = 360;

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

let matrix = [];
let selected = null;
let score = 0;
let timeLeft = TIME_LIMIT;
let timerId = null;
let gameOver = false;

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
    if(canConnect(first.row, first.col, row, col)) {
        removeCell(first.row, first.col);
        removeCell(row, col);
        selected = null;
        score += 10;
        scoreTxt.textContent = score;
        if(checkWin()) endGame("You win!");
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
    return matrix[r][c] === 0;
}

function canGoStraight(r1, c1, r2, c2) {
    if(r1 === r2) {
        const start = Math.min(c1, c2);
        const end = Math.max(c1, c2);
        for (let c = start + 1; c < end; c++) {
            if(!isEmpty(r1, c)) return false;
        }
        return true;
    }
    if (c1 === c2) {
        const start = Math.min(r1, r2);
        const end = Math.max(r1, r2);
        for (let r = start + 1; r < end; r++) {
            if(!isEmpty(r, c1)) return false;
        }
        return true;
    }
    return false;
}
function canGoWith2Lines(r1, c1, r2, c2) {
    if(isEmpty(r1, c2) && canGoStraight(r1, c1, r1, c2 ) && canGoStraight(r1, c2, r2, c2)) return true;
    if(isEmpty(r2, c1) && canGoStraight(r1, c1, r2, c1) && canGoStraight(r2, c1, r2, c2)) return true;
    return false;
}

function canGoWith3Lines(r1, c1, r2, c2) {
    for(let c = -1; c <= COL; c++) {
        if(isEmpty(r1, c) && isEmpty(r2, c) && 
            canGoStraight(r1, c1, r1, c) && 
            canGoStraight(r1, c, r2, c) && 
            canGoStraight(r2, c, r2, c2)) return true;
    }
    for(let r = -1; r <= ROW; r++) {
        if(isEmpty(r, c1) && isEmpty(r, c2) && 
            canGoStraight(r1, c1, r, c1) && 
            canGoStraight(r, c1, r, c2) && 
            canGoStraight(r, c2, r2, c2)) return true;
    }
    return false;
}

function canConnect(r1, c1, r2, c2) {
    if(r1 === r2 && c1 === c2) return false;

    if(matrix[r1][c1] !== matrix[r2][c2]) return false;

    return canGoStraight(r1, c1, r2, c2) || canGoWith2Lines(r1, c1, r2, c2) || canGoWith3Lines(r1, c1, r2, c2);
}

function checkWin() {
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if (matrix[row][col] !== 0) return false;
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
            if(matrix[r1][c1] === 0) continue;
            
            for (let r2 = 0; r2 < ROW; r2++) {
                for (let c2  = 0; c2 < COL; c2++) {
                    if (matrix[r2][c2] === 0) continue;
                    
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

//start game
function initGame() {
    game.style.display = "none";
    gameScreen.style.display = "flex";
    gameOver = false;
    overlay.style.display = "none";
    matrix = createBoard();
    selected = null;
    score = 0;
    scoreTxt.textContent = score;
    startTimer();
    renderBoard(matrix);
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

    if (matrix[row][col] === 0) return;
    handleClick(row, col);
});

restartBtn.addEventListener("click", initGame);
hintBtn.addEventListener("click", showHint);

