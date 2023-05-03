class Tetris {
    constructor(imageX, imageY, template) {
        this.imageX = imageX;
        this.imageY = imageY;
        this.template = template;
        this.x = squareCountX / 2 - Math.floor(this.template.length / 2);
        this.y = 0;
    }

    getTruncedPosition() {
        return {x: Math.trunc(this.x), y: Math.trunc(this.y)};
    }

    checkBottom() {
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j ++) {
                if(this.template[i][j] == 0) {
                    continue;
                }

                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realY + 1 >= squareCountY) {
                    return false;
                } else if(gameMap[realY + 1][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    checkLeft() {
        let n = this.template.length;
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                if(this.template[i][j] == 0) {
                    continue;
                }

                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX - 1 < 0) {
                    return false;
                } else if(gameMap[realY][realX - 1].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    checkRight() {
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j++) {
                if(this.template[i][j] == 0) {
                    continue;
                }

                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX + 1 >= squareCountX) {
                    return false;
                } else if(gameMap[realY][realX + 1].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    moveBottom() {
        if(this.checkBottom()) {
            this.y += 1;
            score += 1;
        }
    }

    moveLeft() {
        if(this.checkLeft()) {
            this.x -= 1;
        }
    }

    moveRight() {
        if(this.checkRight()) {
            this.x += 1;
        }
    }

    changeRotation() {
        let tempTemplate = [];
        let n = this.template.length;
        for(let i = 0; i < n; i++) {
            tempTemplate[i] = this.template[i].slice();
        }

        // Change rotation
        for(let layer = 0; layer < n/2; layer++) {
            let first = layer;
            let last = n - layer -1;
            for(let j = first; j < last; j++) {
                let offset = j - first;
                let temp = this.template[first][i]; // temp = top
                this.template[first][i] = this.template[i][last]; // top = right
                this.template[i][last] = this.template[last][last - offset]; // right = bottom
                this.template[last][last - offset] = this.template[last - offset][first]; // bottom = left
                this.template[last - offset][first] = temp; // left = temp
            }
        }

        // check to change rotation
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                if(this.template[i][j] == 0) {
                    continue;
                }

                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX < 0 || realX >= squareCountX || realY < 0 || realY >= squareCountY) {
                    this.template = tempTemplate;
                    return false;
                }
            }
        }
    }
}

const imageSquareSize = 24;
const squareCountX = 10;
const squareCountY = 20;
const framePerSecond = 24;
const gameSpeed = 2;
const canvas = document.getElementById('canvas');
const nextShapeCanvas = document.getElementById('nextShapeCanvas')
const image = document.getElementById('image');
const ctx = canvas.getContext('2d');
const nctx = nextShapeCanvas.getContext('2d');
const sctx = scoreCanvas.getContext('2d');
const size = canvas.width / 10;
const shapes = [
  new Tetris(0, 0, [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ]),
  new Tetris(0, 24, [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ]),
  new Tetris(0, 48, [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ]),
  new Tetris(0, 72, [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ]),
  new Tetris(0, 96, [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ]),
  new Tetris(0, 120, [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ]),
  new Tetris(0, 144, [
    [1, 1],
    [1, 1],
  ]),
];

let gameMap;
let gameOver;
let currentShape;
let nextShape;
let score;
let initialTwoDArr;
let whiteLineThickness = size / 10;

let gameLoop = () => {
    setInterval(update, 1000 / gameSpeed);
    setInterval(draw, 1000 / framePerSecond);
}

let deleteCompleteRows = () => {
    for(let i = 0; i < gameMap.length; i++) {
        let t = gameMap[i];
        let isComplete = true;

        for(let j = 0; j < t.length; j++) {
            if(t[j].imageX == -1) {
                isComplete = false;
            }
        }

        if(isComplete) {
            score += 1000;
            
            for(let k = i; k > 0; k--) {
                gameMap[k] = gameMap[k - 1];
            }

            let temp = [];
            for(let l = 0; l < squareCountX; l++) {
                temp.push({imageX: -1, imageY: -1});
            }

            gameMap[0] = temp;
        }
    }
}

let update = () => {
    if(gameOver) {
        return;
    } else if(currentShape.checkBottom()) {
        currentShape.y += 1;
    } else {
        for(let i = 0; i < currentShape.template.length; i++) {
            for(let j = 0; j < currentShape.template.length; j++) {
                if(currentShape.template[i][j] == 0) {
                    continue;
                } else {
                    gameMap[currentShape.getTruncedPosition().y + j][currentShape.getTruncedPosition().x + i] = {imageX: currentShape.imageX, imageY: currentShape.imageY};
                }
            }
        }

        deleteCompleteRows();
        currentShape = nextShape;
        nextShape = getRandomShape();
        score += 100;

        if(!currentShape.checkBottom()) {
            gameOver = true;
        }
    }
}

let drawRect = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

let drawBackground = () => {
    drawRect(0, 0, canvas.width, canvas.height, '#bca0dc');

    let n = squareCountX + 1;
    let m = squareCountY + 1;
    for(let i = 0; i < n; i++) {
        drawRect(size * i - whiteLineThickness, 0, whiteLineThickness, canvas.height, 'white');
    }

    for(let i = 0; i < m; i++) {
        drawRect(0, size * i - whiteLineThickness, canvas.width, whiteLineThickness, 'white');
    }
}

let drawCurrentTetris = () => {
    currentShapeLength = currentShape.template.length;
    for(let i = 0; i < currentShapeLength; i++) {
        for(let j = 0; j < currentShapeLength; j++) {
            if(currentShape.template[i][j] == 0) {
                continue;
            } else {
                ctx.drawImage(image, currentShape.imageX, currentShape.imageY, imageSquareSize, imageSquareSize, Math.trunc(currentShape.x) * size + size * i, Math.trunc(currentShape.y) * size + size * j, size, size);
            }
        }
    }
}

let drawSquare = () => {
    let n = gameMap.length;
    for(let i = 0; i < n; i++) {
        let m = gameMap[i].length;
        for(let j = 0; j < m; j++) {
            if(gameMap[i][j].imageX == -1) {
                continue;
            } else {
                ctx.drawImage(image, gameMap[i][j].imageX, gameMap[i][j].imageY, imageSquareSize, imageSquareSize, size * j, size * i, size, size);
            }
        }
    }
}

let drawNextShape = () => {
    nctx.fillStyle = '#bca0dc';
    nctx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);

    let n = nextShape.template.length;
    for(let i = 0; i < n; i++) {
        for(let j = 0; j < n; j++) {
            if(nextShape.template[i][j] == 0) {
                continue;
            } else {
                nctx.drawImage(image, nextShape.imageX, nextShape.imageY, imageSquareSize, imageSquareSize, size * i, size * j + size, size, size);
            }
        }
    }
}

let drawScore = () => {
    sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    sctx.font = '30px Poppins';
    sctx.fillStyle = 'black';
    sctx.fillText(`Score: ${score}`, 10, 50);
}

let drawGameOver = () => {
    ctx.font = '64px Poppins';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over!', 10, canvas.height / 2);
}

let draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBackground();
    drawSquare();
    drawCurrentTetris();
    drawNextShape();
    drawScore();
    if(gameOver) {
        drawGameOver();
    }
}

let getRandomShape = () => {
    return Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
}

let resetVars = () => {
    initialTwoDArr= [];
    for(let i = 0; i < squareCountY; i++) {
        let temp = [];
        for(let j = 0; j < squareCountX; j++) {
            temp.push({imageX: -1, imageY: -1});
        }
        initialTwoDArr.push(temp);
    }
    score = 0;
    gameOver = false;
    currentShape = getRandomShape();
    nextShape = getRandomShape();
    gameMap = initialTwoDArr;
}

window.addEventListener('keydown', (event) => {
    if(event.keyCode == 37) {
        currentShape.moveLeft();
    } else if(event.keyCode == 38) {
        currentShape.changeRotation();
    } else if(event.keyCode == 39) {
        currentShape.moveRight();
    } else if(event.keyCode == 40) {
        currentShape.moveBottom();
    }
})

resetVars();
gameLoop();