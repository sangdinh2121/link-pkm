const ROW = 9;
const COL = 16;
const TYPES = 36;
const COPIES = 4;

const game = document.getElementsByClassName("game")[0];
const gameScreen = document.getElementsByClassName("game-screen")[0];
const play = document.getElementsByClassName("play")[0];
const board = document.getElementsByClassName("board")[0];
let matrix = [];
let selected = null;

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
    if(matrix[first.row][first.col] === matrix[row][col]) {
        removeCell(first.row, first.col);
        removeCell(row, col);
        selected = null;
    } else {
        selected = {row, col};
        getCell(row, col).classList.add("selected");
    }
}

function isEmpty(r, c) {
    if (r < 0 || r >= ROW || c < 0 || c >= COL) return true;
    return matrix[r][c] === 0;
}

function canGoStraight(c1, c2, r1, r2) {
    if(r1 === r2) {
        const start = Math.min(c1, c2);
        const end = Math.max(c1, c2);
        for (let c = start + 1; c < end; c++) {
            if(!isEmpty(r1, c)) return false;
        }
        return true;
    }
    if (c1 === c2) {
        const start = Math.min(c1, c2);
        const end = Math.max(c1, c2);
        for (let r = start + 1; r < end; r++) {
            if(!isEmpty(c1, r)) return false;
        }
        return true;
    }
    return false;
}
function canGoWith2Lines(r1, c1, r2, c2) {
    if(isEmpty(r2, c1) && canGoStraight(r1, c1, r1, c2 ) && canGoStraight(r1, c2, r2, c2)) return true;
    if(isEmpty(r2, c1) && canGoStraight(r1, c1, r2, c1) && canGoStraight(r2, c1, r2, c2)) return true;
    return false;
}

function canGoWith3Lines(r1, c1, r2, c2) {
    
}

//start gaem
function initGame() {
    game.style.display = "none";
    gameScreen.style.display = "flex";
    matrix = createBoard();
    selected = null;
    renderBoard(matrix);
}
play.addEventListener("click", initGame);
board.addEventListener("click", function (e) {
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (matrix[row][col] === 0) return;
    handleClick(row, col);
});
