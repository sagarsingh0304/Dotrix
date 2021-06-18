// document.addEventListener('DOMContentLoaded', () => {
const avtarInput = document.querySelector('#avtar-name');
const sendAvtar = document.querySelector('#send-avtar');
const area = document.querySelector('#text-area');
const myGameId = document.querySelector('#gameid').textContent;
const playerList = document.querySelector('#players-list');
const gameBoard = document.querySelector("#game-board");//
let playersInGame = []

const addMessage = text => {
    let p = document.createElement('p');
    p.className = "text-message"
    p.innerText = text;
    area.appendChild(p);
    setTimeout(()=>{
        area.removeChild(p)
    }, 5000);
}
const addPlayer = player => {
    playersInGame.push(player)
    let li = document.createElement('li');        
    li.className = 'each-player';
    li.innerText = player["name"];
    li.style.backgroundColor = player["color"];
    playerList.appendChild(li);
}

const socketio = io({ transports: ["websocket"] });

socketio.on('connect', () => {
    addMessage('connected to server');
    socketio.emit('join', myGameId);
});

socketio.on('message', msg => addMessage(msg));

socketio.on("start-game", () =>{    //
    startGame(playersInGame);       //
})                                  //

socketio.on('update-players', playerList => {
    playerList.forEach(player => addPlayer(player));        
});

socketio.once('set-avtar', myPlayer => {
    addMessage(`You are ${myPlayer.name}`);
    playersInGame.forEach(player => {
        if((player.name == myPlayer.name) && (player.color == myPlayer.color)) {
            player.isMe = true;
        }
    })
    socketio.send(`${myPlayer.name} joined the game`, myGameId);
    if(myPlayer.isStarter) {
        startButton = document.createElement("button");
        startButton.innerText = 'Start Game';
        startButton.className = "button";
        startButton.id = 'start-game-button';      
        gameBoard.appendChild(startButton);
        startButton.addEventListener('click', () => {
            gameBoard.removeChild(startButton);
            socketio.emit('start', myGameId)
        })
    }
});

socketio.on('disconnet', ()=> console.log('server has closed my connection'));

sendAvtar.addEventListener('click', () => {
    const avtarName = avtarInput.value;
    socketio.emit('avtar', avtarName, myGameId);
    avtarInput.value = '';
    document.querySelector("#input-area").style.display = "none";
}, {once: true});

// });

function sendMove(move){
    
}

// const gameBoard = document.querySelector("#game-board");
const dimensions = document.querySelector("#dimension").innerHTML;

function startGame(playersInGame) {
    const playersInGameHtmlList = document.querySelectorAll(".each-player");           
    // Set game canvas
    let canva = document.createElement("canvas");
    canva.width = gameBoard.clientWidth;
    canva.height = gameBoard.clientHeight;
    canva.id = "game-canvas";
    gameBoard.appendChild(canva);

    let canvaRect = canva.getBoundingClientRect();

    // canvas variables
    const FPS = 20;                                                        // Frames Per Second
    const GRID_ROWS = Number(dimensions[0]) + 1;                           // number of rows in grid
    const GRID_COLUMNS = Number(dimensions[dimensions.length - 1]) + 1;    // number of columns in grid
    const WIDTH = canva.width;                                             // width of game board
    const HEIGHT = canva.height;                                           // height of game board

    // derived CONSTANT VARIABLES
    const CELL_HEIGHT = Math.trunc(HEIGHT / (GRID_ROWS + 1));     // width of cell or width between 2 dots
    const CELL_WIDTH = Math.trunc(WIDTH / (GRID_COLUMNS + 1));    // height of cell or height between 2 dots
    const DOT_RADIUS = CELL_WIDTH / 12;                           //  dot radius
    const STROKE = DOT_RADIUS;                                    // size of stroke of width of stroke
    const TOTAL_CELLS = (GRID_ROWS - 1) * (GRID_COLUMNS - 1);


    // game variables
    let playersTurnIndex, cellsArray, currentCells;
    let Side = {                 
        LEFT : 0,
        TOP : 1,
        RIGHT : 2,
        BOTTOM : 3
    };

    // game flag
    let isGameOn = true;

    // Colors
    const COLOR_BOARD = "#F2F1D3";
    const COLOR_DOT = "#293858";
    const COLOR_DOT_SHADOW = "#DD5D00"

    canva.addEventListener('mousemove', e => {
        if(!playersInGame[playersTurnIndex].isMe) {
            return;
        }
        let x = e.clientX - canvaRect.left,
            y = e.clientY - canvaRect.top;
        highlightSide(x, y);
    });

    canva.addEventListener('click', e => {
        if(!playersInGame[playersTurnIndex].isMe) {
            return;
        }
        selectSide();
    });

    // Set up canvas context
    let ctx = canva.getContext('2d');

    // Set up game loop
    gameIntervalHandler = setInterval(gameLoop, 1000 / FPS);

    function gameLoop() {
        if(isGameOn) {
            drawBoard();
            drawCells();
            drawGrid();
        } else {
            drawScore();
            clearInterval(gameIntervalHandler)
        }
    }
    function drawScore() {
        playersInGame.forEach(player => console.log(player))
    }

    function drawBoard() {                           // draws rectangle white board 
        ctx.fillStyle = COLOR_BOARD;
        ctx.fillRect(0,0, WIDTH, HEIGHT);
    }

    function drawDot(x, y) {                         // draws a single dot and it's shadow on canvas
        ctx.fillStyle = COLOR_DOT;
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0 , 360);
        ctx.fill();
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = COLOR_DOT_SHADOW;
    }

    function getGridX(col) {                          // returns the x coordinate of dot on the basis of no. of columns 
        return CELL_WIDTH * (col + 1);
    }

    function getGridY(row) {                          // returns the x coordinate of dot on the basis of no. of columns 
        return CELL_HEIGHT * (row + 1)
    }

    function drawGrid() {                                   // draws the gird of dots by determining x and y position
        for(let i = 0; i < GRID_ROWS; i++) 
            for(let j = 0; j < GRID_COLUMNS; j++) 
                drawDot(getGridX(j), getGridY(i));       
    }

    function drawCells() {                              //  draws selected cellsides and aquired cells every FPS on canvas
        for (let row of cellsArray) {
            for(let cell of row) {
                cell.drawFill();
                cell.drawCellSides();
            }
        }
    }

    function drawLine(x1, y1, x2, y2, color) {              // draws a line with given color whether
        ctx.beginPath()
        ctx.strokeStyle = color;
        ctx.lineWidth = STROKE;
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke();
        ctx.closePath();
    }

    function getColor(playerIndex, isLight) {                         // returns the color on the basis of index passed it is
        let color = playersInGame[playerIndex].color
        return isLight?`${color}90`:color;    
    }

    function highlightSide(x, y) {
        for(let row of cellsArray) {                // clears the previous highlighting
            for(let cell of row) {
                cell.highlighted = null;            
            }
        }

        let rows = cellsArray.length;
        let columns = cellsArray[0].length;
        currentCells = [];

        OUTER: for(let i = 0; i < rows; i++) {                //  highlights the single side of a cell
            for(let j = 0; j < columns; j++) {
                if(cellsArray[i][j].contains(x, y)) {
                    let side = cellsArray[i][j].highlightSide(x, y)
                    if(side != null) {
                        currentCells.push({row: i, column: j})
                    }

                    // determine neighbour
                    let neighbourRow = i, neighbourCol = j, highlight, neighbour = true;

                    if(side == Side.LEFT && j > 0) {
                        neighbourCol = j - 1;
                        highlight = Side.RIGHT;
                    } else if(side == Side.TOP && i > 0) {
                        neighbourRow = i - 1;
                        highlight = Side.BOTTOM;
                    } else if(side == Side.RIGHT && j < columns - 1) {
                        neighbourCol = j + 1;
                        highlight = Side.LEFT;
                    } else if(side == Side.BOTTOM && i < rows - 1) {
                        neighbourRow = i + 1;
                        highlight = Side.TOP;
                    } else {
                        neighbour = false;
                    }

                    if(neighbour) {
                        cellsArray[neighbourRow][neighbourCol].highlighted = highlight;
                        currentCells.push({row: neighbourRow, column: neighbourCol});
                    }


                    break OUTER;
                }
            }
        }
    }

    class Cell {                                    // Cell class 
        constructor(x, y, width, height) {
            this.width = width;
            this.height = height;

            this.left = x;                          // these four properties are the position of
            this.right = x + width;                 // each side of a cell on canvas
            this.top = y;                           
            this.bottom = y + height;                 

            this.highlighted = null;        //  the side of a cell can be selected after its highlighted and a cell can have only one highlighted side

            this.selectedSides = 0;         
            this.owner = null;              // index of player in list of players who will own this cell
            
            this.sideLeft = {owner:null, isSelected:false};     // these properties store the owner(index of player) of cell side 
            this.sideRight = {owner:null, isSelected:false};    //  and whether that side is selected or not
            this.sideTop = {owner:null, isSelected:false};      //
            this.sideBottom = {owner:null, isSelected:false};
        }

        static filledCellCount = 0;         // stores the count of total cells owned/accquired/won/filled
        
        contains(x, y) {            // this function will returns whether the given position lies on the cells or not
            return x >= this.left && x < this.right && y >= this.top && y < this.bottom;
        }

        highlightSide(x, y) {                  // highlights the side near to the cursor        
            let dLeft = x - this.left,          // These four properties calculate the
                dRight = this.right - x,        // distance of each side from the current 
                dTop = y - this.top,            // position of cursor
                dBottom = this.bottom - y;
            
            let minDist = Math.min(dLeft, dRight, dTop, dBottom);   // selects the nearest side to the cursor

            if(minDist == dLeft && !this.sideLeft.isSelected) {             // set the highlight property to nearest side
                this.highlighted = Side.LEFT;                              // which will be displayed in next frame of FPS
            } else if(minDist == dTop && !this.sideTop.isSelected) {
                this.highlighted = Side.TOP;
            } else if(minDist == dRight && !this.sideRight.isSelected) {
                this.highlighted = Side.RIGHT;
            } else if(minDist == dBottom && !this.sideBottom.isSelected) {
                this.highlighted = Side.BOTTOM;
            }

            return this.highlighted;
        }

        selectSide() {
            if (this.highlighted == null) {     // a side cannot be selected if not highlighted
                return;
            }
            // this will set the side owner(index of player) of the currently highlighted side if it is selected
            switch(this.highlighted) {  
                case Side.LEFT:
                    this.sideLeft.owner = playersTurnIndex;
                    this.sideLeft.isSelected = true;
                    break;

                case Side.TOP:
                    this.sideTop.owner = playersTurnIndex;
                    this.sideTop.isSelected = true;
                    break;

                case Side.RIGHT:
                    this.sideRight.owner = playersTurnIndex;
                    this.sideRight.isSelected = true;
                    break;

                case Side.BOTTOM:
                    this.sideBottom.owner = playersTurnIndex;
                    this.sideBottom.isSelected = true;
                    break;
            }
            
            this.selectedSides++;   // incresed the count of selected side of a cell
            let sideHighlighted = this.highlighted;
            this.highlighted = null;    // sets highlighted to null so that you can highlight another side of that cell at every FPS

            if(this.selectedSides == 4) {           // checks if the cell is filled or completed, sets the owner and returns true
                this.owner = playersTurnIndex;
                Cell.filledCellCount++;
                playersInGame[playersTurnIndex].score++;
                return [true, sideHighlighted];
            }

            return [false, sideHighlighted];           // if we reach this statement that means the cell is not filled and will return false
        }

        drawFill() {
            // will the cell if there is a owner else just return
            if(this.owner == null) {
                return;
            }

            // We will reach this statement if there is a owner and will fill the cell with the color of owner
            ctx.fillStyle = getColor(this.owner, true);
            ctx.fillRect(this.left, this.top, this.width, this.height);
        }

        drawCellSides() {

            // will just highlight the side
            if(this.highlighted != null) {
                this.drawCellSide(this.highlighted, getColor(playersTurnIndex,true))
            } 

            // will select the highlighted side
            if(this.sideLeft.isSelected) {
                this.drawCellSide(Side.LEFT, getColor(this.sideLeft.owner, false));
            }
            if(this.sideTop.isSelected) {
                this.drawCellSide(Side.TOP, getColor(this.sideTop.owner, false));
            }
            if(this.sideRight.isSelected) {
                this.drawCellSide(Side.RIGHT, getColor(this.sideRight.owner, false));
            }
            if(this.sideBottom.isSelected) {
                this.drawCellSide(Side.BOTTOM, getColor(this.sideBottom.owner, false));
            }

        }

        drawCellSide(side, sideColor) {
            switch(side) {
                case Side.LEFT:
                    drawLine(this.left, this.top, this.left, this.bottom, sideColor);
                    break;
                case Side.TOP:
                    drawLine(this.left, this.top, this.right, this.top, sideColor);
                    break;
                case Side.RIGHT:
                    drawLine(this.right, this.top, this.right, this.bottom, sideColor);
                    break;
                case Side.BOTTOM:
                    drawLine(this.left, this.bottom, this.right, this.bottom, sideColor);
                    break;
            }
        }       
        
    }

    function newGame() {
        currentCells = []
        playersTurnIndex = 0;
        playersInGameHtmlList[0].classList.toggle("turn");
        cellsArray = []
        for(let i = 0; i < GRID_ROWS -1; i++) {
            cellsArray[i] = []
            for(let j = 0; j < GRID_COLUMNS -1; j++) {
                cellsArray[i][j] = new Cell(getGridX(j), getGridY(i), CELL_WIDTH, CELL_HEIGHT);
            }
        }
    }

    newGame(); 

    function selectSide() {
        // if there is no cell side highlighted then the currentCells will be empty
        if(currentCells == null || currentCells.length == 0) {
            return;
        }
        let moves = []

        // select the side
        let filledCell = false;
        for(cell of currentCells) {  
            let [isFilled, sideHighlighted] = cellsArray[cell.row][cell.column].selectSide();
            let move = {
                "cellRow": cell.row,
                "cellColumn": cell.column,
                "cellSide": sideHighlighted,
                "isFilled": isFilled,
                "playerIndex": playersTurnIndex
            }
            moves.push(move);       // pushes each move in array (since sides of 2 cells are selected therefore we have to use array)
            if(isFilled){         // if the current selected side completes the Cell then filledCell is true
                filledCell = true;
            }
        }
        currentCells = [];

        // check for filled CELL that is winner of that cell which will not change the turn
        if(filledCell) {
            if(TOTAL_CELLS == Cell.filledCellCount) {
                setTimeout(() => {          // this timeout prevents the draw loop to stop before filling the last move cell
                    isGameOn = false;    
                }, 1000)
            }
            // playersInGame[playersTurnIndex].score++;
        } else {
            // change players turn
            playersInGameHtmlList[playersTurnIndex].classList.toggle("turn");
            playersTurnIndex = (playersTurnIndex + 1) % playersInGame.length;
            playersInGameHtmlList[playersTurnIndex].classList.toggle("turn");
        }

        socketio.emit('move', moves, myGameId);     // this sends the moves array to the game room

    }    

    socketio.on("c-move", moves => {
        console.log("moves", moves)
        let moveCell = null;
        let anyFilled = false       // 
        if(playersInGame[moves[0].playerIndex].isMe) {
            return
        }
        moves.forEach(move => {
            moveCell = cellsArray[move.cellRow][move.cellColumn]
            moveCell.highlighted = move.cellSide;
            [fill, a] = moveCell.selectSide();  
            if (move.isFilled){
                anyFilled = true;
            }      
        })

        console.log("cell", moveCell)
        console.log('this turn', playersTurnIndex)
        
        // if(move.isFilled){
        if(anyFilled){

        } else {
            playersInGameHtmlList[playersTurnIndex].classList.toggle("turn");
            playersTurnIndex = (playersTurnIndex + 1) % playersInGame.length;
            playersInGameHtmlList[playersTurnIndex].classList.toggle("turn");
        }
        console.log("next turn", playersTurnIndex)
        
    })
}
