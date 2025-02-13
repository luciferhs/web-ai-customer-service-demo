const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
let score = 0;

const createGrid = () => {
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        gridContainer.appendChild(tile);
    }
};

const startGame = () => {
    createGrid();
    addRandomTile();
    addRandomTile();
};

const addRandomTile = () => {
    const tiles = document.querySelectorAll('.tile');
    const emptyTiles = Array.from(tiles).filter(tile => !tile.innerText);
    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    randomTile.innerText = Math.random() < 0.9 ? 2 : 4;
};

startGame();
