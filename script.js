const game = document.getElementsByClassName("game")[0];
const gameScreen = document.getElementsByClassName("game-screen")[0];
const play = document.getElementsByClassName("play")[0];
const board = document.getElementsByClassName("board")[0];
const boardIcon = [];

//nút play
play.addEventListener("click", function() {
    game.style.display = "none";
    gameScreen.style.display = "flex";
})

//thêm ô vào bảng
for (let i = 0; i < 144; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell")
    board.appendChild(cell);
}

//thêm các ảnh vào ô
for (let row = 0; row < 9; row++) {
    boardIcon[row] = [];
    for (let col = 0; col < 16; col++) {
        boardIcon[row][col] = null;
    }
}
