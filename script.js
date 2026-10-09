const ROW = 9;
const COL = 16;
const TYPES = 36;
const COPIES = 4;

// const game = document.getElementsByClassName("game")[0];
// const gameScreen = document.getElementsByClassName("game-screen")[0];
// const play = document.getElementsByClassName("play")[0];
// const board = document.getElementsByClassName("board")[0];
// const cells = document.getElementsByClassName("cell");
// const boardIcon = [];
// const pokemon = [];
// const pokemonList = [];
// let index =0;

//tạo danh sách
function createList() {
    const list = [];
    for (let type = 1; type < TYPES; type++) {
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
console.log(createList());
console.log(shuffle(createList()));
