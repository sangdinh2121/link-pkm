const game = document.getElementsByClassName("game");
const gameScreen = document.getElementsByClassName("game-screen");
const play = document.getElementsByClassName("play");

play.addEventListener("click", function() {
    home.style.display = "none";
    gameScreen.style.display = "block";
})
