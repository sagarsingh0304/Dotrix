const gameBoard = document.querySelector("#game-board");
const dimensions = document.querySelector("#dimension").innerHTML;


// Set game canvas
let canva = document.createElement("canvas");
canva.width = gameBoard.clientWidth;
canva.height = gameBoard.clientHeight;
canva.id = "game-canvas";
gameBoard.appendChild(canva);


// game parameters
const FPS = 30;     // Frames Per Second
const GRID_ROWS = Number(dimensions[0]);    // number of rows in grid
const GRID_COLUMNS = Number(dimensions[dimensions.length - 1]);    // number of columns in grid
const WIDTH = canva.width;     // width of game board
const HEIGHT = canva.height;      // height of game board

// derived parameters
const CELL_ROWS = HEIGHT / (GRID_ROWS + 1);         // width of cell or width between 2 dots
const CELL_COLUMNS = WIDTH / (GRID_COLUMNS + 1);    // height of cell or height between 2 dots
const DOT_RADIUS = CELL_COLUMNS / 12;               //  dot radius
const STROKE = DOT_RADIUS;                          // size of stroke of width of stroke


// Colors
const COLOR_BOARD = "#F2F1D3";
const COLOR_DOT = "#293858";

// Set up canvas context
let ctx = canva.getContext('2d');

// Set up game loop
setInterval(gameLoop, 1000 / FPS);

function gameLoop() {
    drawBoard();
    drawGrid();
}

function drawBoard() {
    ctx.fillStyle = COLOR_BOARD;
    ctx.fillRect(0,0, WIDTH, HEIGHT);
    // console.log(WIDTH, HEIGHT);
}

function drawDot(x, y) {
    ctx.fillStyle = COLOR_DOT;
    ctx.beginPath();
    ctx.arc(x, y, DOT_RADIUS, 0 , 360);
    ctx.fill();
}

function getGridX(col) {
    return CELL_COLUMNS * (col + 1);
}

function getGridY(row) {
    return CELL_ROWS * (row + 1)
}

function drawGrid() {
    for(let i = 0; i < GRID_ROWS; i++) {
        for(let j = 0; j < GRID_COLUMNS; j++) {
            drawDot(getGridX(j), getGridY(i));
        }
    }
}
