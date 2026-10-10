const ROW = 9;
const COL = 16;
const TYPES = 36;
const COPIES = 4;

const game = document.getElementsByClassName("game")[0];
const gameScreen = document.getElementsByClassName("game-screen")[0];
const play = document.getElementsByClassName("play")[0];
const board = document.getElementsByClassName("board")[0];

//tạo danh sách
function createList() {
    const list = [];
    for (let type = 1; type <= TYPES; type++) {
        for (let i = 0; i < COPIES; i++) {
            list.push(type);
        }
    }
    return list;
}

//Fisher-Yates
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = list[i];
        list[i] = list[j];
        list[j] = temp;
    }
    return list;
}
//chuyển danh sách sang 2 chiều
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

//vẽ bảng
function drawBoard(matrix) {
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            const img = document.createElement("img");
            img.src = "assets/pkm-icon/" + matrix[row][col] + ".png";
            img.alt = "";
            cell.appendChild(img);
            board.appendChild(cell);
        }
    }
}

//khởi tạo game
function initGame() {
    game.style.display = "none";
    gameScreen.style.display = "flex";
    const matrix = createBoard();
    drawBoard(matrix);
}
play.addEventListener("click", initGame);
