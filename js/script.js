const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen") 
const buttonPlay = document.querySelector(".btn-play")
const buttonMode = document.querySelector(".btn-mode");
const startMenu = document.querySelector(".start-menu");
const playerNameInput = document.querySelector(".player-name");
const startButton = document.querySelector(".btn-start");
const playerFinalName = document.querySelector(".player-final-name");
const btnSolo = document.querySelector(".btn-start-solo");
const btnVersus = document.querySelector(".btn-start-versus");
const btnMenu = document.querySelector(".btn-menu");

const audio = new Audio('../assets/audio.mp3')

const size = 30

let isSoloMode = true;
let playerName = "";
let snake = [{ x: 270, y: 240}]
let hasPlayerMoved = false; 
let aiSnake = [{ x: 90, y: 240 }] 

canvas.style.display = "none";
buttonMode.style.display = "none";
menu.style.display = "none";

const incrementScore = () => {
    score.innerText = +score.innerText + 10
}
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
   
}

let direction, loopId
let aiDirection = "right" 

const foodImage = new Image();
foodImage.src = "images/food.png"; 

const foodSize = size * 1.5; 

const drawFood = () => {
    ctx.shadowColor = food.color;

    const offset = (foodSize - size) / 2;
    ctx.drawImage(foodImage, food.x - offset, food.y - offset, foodSize, foodSize);

    ctx.shadowBlur = 0;
}

const drawSnake = () => {
        ctx.fillStyle = "#ddd"
        
        snake.forEach((position, index) => {

            if(index == snake.length-1){
                ctx.fillStyle = "white"
            }
            ctx.fillRect(position.x, position.y, size, size)
        })       
}

const drawAISnake = () => { 
    ctx.fillStyle = "red"
    aiSnake.forEach((position, index) => {
        if(index == aiSnake.length-1){
            ctx.fillStyle = "orange"
        }
        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if(!direction) return

    const head = snake[snake.length -1]

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }

    snake.shift()
}

const moveAISnake = () => { 
    const head = aiSnake[aiSnake.length - 1]
    let newHead = { x: head.x, y: head.y }

    if (food.x > head.x) aiDirection = "right"
    if (food.x < head.x) aiDirection = "left"
    if (food.y > head.y) aiDirection = "down"
    if (food.y < head.y) aiDirection = "up"

    if (aiDirection == "right") newHead.x += size
    if (aiDirection == "left") newHead.x -= size
    if (aiDirection == "down") newHead.y += size
    if (aiDirection == "up") newHead.y -= size

    aiSnake.push(newHead)
    aiSnake.shift()
}

const drawGrid = () => {
    const color1 = "#A0D468"; 
    const color2 = "#8CC152"; 

    for (let row = 0; row < canvas.height / size; row++) {
        for (let col = 0; col < canvas.width / size; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? color1 : color2;
            ctx.fillRect(col * size, row * size, size, size);
        }
    }
}

const checkEat = () => {
    const head = snake[snake.length -1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)){
             x = randomPosition()
             y = randomPosition()
        }
        
        food.x = x
        food.y = y
      
    }
}

const checkAIEat = () => {
    const aiHead = aiSnake[aiSnake.length - 1];

    if (aiHead.x == food.x && aiHead.y == food.y) {
        aiSnake.push(aiHead); 

        let x = randomPosition();
        let y = randomPosition();

        while (
            snake.find(position => position.x == x && position.y == y) ||
            aiSnake.find(position => position.x == x && position.y == y)
        ) {
            x = randomPosition();
            y = randomPosition();
        }

        food.x = x;
        food.y = y;    
    }
}

const checkColision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision =
        (head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit)

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || selfCollision){
        gameOver()
    }
}

const checkAIColision = () => {
    const aiHead = aiSnake[aiSnake.length - 1];
    const canvasLimit = canvas.width - size;
    const aiNeckIndex = aiSnake.length - 2;

    const wallCollision =
        aiHead.x < 0 || aiHead.x > canvasLimit || aiHead.y < 0 || aiHead.y > canvasLimit;

    const selfCollision = aiSnake.find((position, index) => {
        return index < aiNeckIndex && position.x == aiHead.x && position.y == aiHead.y;
    });

    if (wallCollision || selfCollision) {
        aiDirection = undefined; 
    }
}

const checkPlayerAICollision = () => {
    const head = snake[snake.length - 1]; 
    const aiHead = aiSnake[aiSnake.length - 1]; 

    const playerHitsAI = aiSnake.some(position => position.x === head.x && position.y === head.y);

    const aiHitsPlayer = snake.some(position => position.x === aiHead.x && position.y === aiHead.y);

    if (playerHitsAI || aiHitsPlayer) {
        gameOver();
    }
}

const gameOver = () => {
    direction = undefined

    menu.style.display = "flex" 
    finalScore.innerText = score.innerText
    playerFinalName.innerText = `Jogador: ${playerName}`; 
    canvas.style.filter = "blur(2px)"

}

const gameLoop =() =>{
    clearInterval(loopId);
    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    moveSnake();
    
    if (!isSoloMode && hasPlayerMoved) { 
        moveAISnake();
        drawAISnake();
        checkAIEat();
        checkAIColision();
        checkPlayerAICollision();
    }

    drawSnake();
    checkEat();
    checkColision();

    loopId = setInterval(() =>{
        gameLoop()
    }, 300)
}

gameLoop()  

startButton.addEventListener("click", () => {
    if (playerNameInput.value.trim() === "") {
        alert("Por favor, digite seu nome!");
        return;
    }

    playerName = playerNameInput.value.trim(); 
    startMenu.style.display = "none"; 


    canvas.style.display = "block";
    buttonMode.style.display = "block";

    gameLoop(); 
})

document.addEventListener("keydown", ({ key }) => {
    if(key == "ArrowRight" && direction != "left") {
        direction = "right"
    }
    
    if(key == "ArrowLeft"  && direction != "right") {
        direction = "left"
    }

    if(key == "ArrowDown"  && direction != "up") {
        direction = "down"
    }

    if(key == "ArrowUp"  && direction != "down") {
        direction = "up"
    }

    hasPlayerMoved = true; 
})

buttonPlay.addEventListener ("click", () => {
    score.innerText = "00"
    menu.style.display = "none"
    canvas.style.filter = "none"
     
    snake = [{ x: 270, y: 240}]
    aiSnake = [{x: 90, y: 300}]

    hasPlayerMoved = false;
})

btnSolo.addEventListener("click", () => {
    iniciarJogo(true); 
})

btnVersus.addEventListener("click", () => {
    iniciarJogo(false); 
})

buttonMode.addEventListener("click", () => {
    isSoloMode = !isSoloMode; 
    buttonMode.innerText = isSoloMode ? "Modo: Solo" : "Modo: Versus IA";
});

btnMenu.addEventListener("click", () => {
    menu.style.display = "none"; 
    startMenu.style.display = "flex"; 
    canvas.style.display = "none"; 
    buttonMode.style.display = "none"; 
    canvas.style.filter = "none"; 

    playerNameInput.value = ""; 
    score.innerText = "00";
    snake = [{ x: 270, y: 240 }];
    aiSnake = [{ x: 90, y: 300 }];
    hasPlayerMoved = false;
});

function iniciarJogo(solo) {
    if (playerNameInput.value.trim() === "") {
        alert("Por favor, digite seu nome!");
        return;
    }

    playerName = playerNameInput.value.trim();
    isSoloMode = solo; 
    startMenu.style.display = "none"; 

    canvas.style.display = "block";
    buttonMode.style.display = "block";
    buttonMode.innerText = isSoloMode ? "Modo: Solo" : "Modo: Versus IA";

    gameLoop(); 
}

