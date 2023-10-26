Math.minmax = (value, limit) => {
    return Math.max(Math.min(value, limit), -limit);
}
const joystickHeadElement = document.querySelector('#joystick-head');   // Joystick head element
const mazeEl = document.querySelector('#maze');                          // Maze element
let gameInProgress, mouseStartX, mouseStartY, accelerationX, accelerationY, frictionX, frictionY, balls, walls, previousTimestamp;
let hardMode = false;
let ballElements = [];
let holeElements = [];
const pathW= 10;
const wallW= 18;
const ballSize = 10;
const holeSize = 18;
resetGame();
function resetGame() {
    gameInProgress = false;
    previousTimestamp = undefined;
    mouseStartX = undefined;
    mouseStartY = undefined;
    accelerationX = 0;
    accelerationY = 0;
    frictionX = 0;
    frictionY = 0;
    joystickHeadElement.style.cssText = `
        left: 0;
        top: 0;
        animation: glow;
        cursor: grab;
    `;
    balls = [
        {column:0, row: 0},
        {column:9, row: 0},
        {column:0, row: 8},
        {column:9, row: 8},
    ].map((ball) => ({
        x : ball.column * (wallW+pathW) + wallW/2+pathW/2,
        y : ball.row * (wallW+pathW) + wallW/2+pathW/2,
        velocityX: 0,
        velocityY: 0,
    }));
    balls.forEach(({x,y}) => {
        const ball= document.createElement('div');
        ball.setAttribute('class', 'ball');
        ball.style.cssText = `
            left: ${ball.x}px;
            top: ${ball.y}px;
        `;
        mazeEl.appendChild(ball);
        ballElements.push(ball);
    });
    if(ballElements.length){
        balls.forEach(({x, y}, index) => {
            ballElements[index].style.cssText = `
                left: ${x}px;
                top: ${y}px;
            `;
        })
    }
}
walls=[
    {column:0, row: 0, horizontal: true, length: 10},
    {column:0, row: 0, horizontal: false, length: 9},
    {column:0, row: 9, horizontal: true, length: 10},
    {column:10, row: 0, horizontal: false, length: 9},
].map((wall) => ({
    x : wall.column * (wallW+pathW),
    y : wall.row * (wallW+pathW),
    horizontal: wall.horizontal,
    length: wall.length * (wallW+pathW),
}))
walls.forEach(({x,y,horizontal,length}) => {
    const wall= document.createElement('div');
    wall.setAttribute('class', 'wall');
    wall.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${wallW}px;
        height: ${length}px;
        transform: rotate(${horizontal ? -90 : 0}deg);
    `;
    mazeEl.appendChild(wall);
})
function slow(number, difference){
    if(Math.abs(number) < difference){
        return 0;
    }
    if(number>difference){
        return number-difference;
    }
    return number+difference;
}
function main(timestamp) {
    if (!gameInProgress) return;
    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
        window.requestAnimationFrame(main);
        return;
    }
    const maxVelocity = 1.5;
    const timeElapsed = (timestamp - previousTimestamp) / 16;
    try {
        if (accelerationX !== undefined && accelerationY !== undefined) {
            const velocityChangeX = accelerationX * timeElapsed;
            const velocityChangeY = accelerationY * timeElapsed;
            const frictionDeltaX = frictionX * timeElapsed;
            const frictionDeltaY = frictionY * timeElapsed;
            balls.forEach((ball)=>{
                if(velocityChangeX === 0){
                    ball.velocityX = slow(ball.velocityX, frictionDeltaX);
                }else{
                    ball.velocityX += velocityChangeX;
                    ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
                    ball.velocityX = ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
                    ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
                }
                if(velocityChangeY === 0){
                    ball.velocityY = slow(ball.velocityY, frictionDeltaY);
                }else{
                    ball.velocityY += velocityChangeY;
                    // ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
                    ball.velocityY = ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
                    ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}
joystickHeadElement.addEventListener('mousedown', (e) => {
    if (!gameInProgress) {
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        gameInProgress = true;
        window.requestAnimationFrame(main);
        // las notas van aca
        joystickHeadElement.style.cssText = `   
            animation: none;
            cursor: grabbing;
        `;
    }
});
joystickHeadElement.addEventListener('mousemove', (e) => {
    if (gameInProgress) {
        const mouseDeltaX = -Math.minmax(mouseStartX - e.clientX, 15);
        const mouseDeltaY = -Math.minmax(mouseStartY - e.clientY, 15);
        joystickHeadElement.style.cssText = `
            left: ${mouseDeltaX}px;
            top: ${mouseDeltaY}px;
            animation: none;
            cursor: grabbing;
        `;
        const rotationY = mouseDeltaX / 10;
        const rotationX = mouseDeltaY / 10;
        // aca el maze
        mazeEl.style.cssText = `
        transform: rotateX(${rotationX}deg) rotateY(${rotationY}deg);
        `;
        const gravity = 2;
        const friction = 0.01;
        accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI); //que seno no es con angulo
        accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
        frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
        frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
        window.requestAnimationFrame(main);
    }
});
window.addEventListener('keydown', (e) => {
    if (![' ', 'H', 'h', 'E', 'e'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === ' ') {
        resetGame();
        console.log('Game reset');
    }
    if (e.key === 'H' || e.key === 'h') {
        console.log('Help');
        hardMode = true;
        resetGame();
        return;
    }
    if (e.key === 'E' || e.key === 'e') {
        console.log('Easy');
        hardMode = false;
        resetGame();
        return;
    }
});
window.addEventListener('mouseup', () => {
    joystickHeadElement.style.cssText = `
        left: 0;
        top: 0;
        animation: glow;
        cursor: grab;
    `;
});
joystickHeadElement.addEventListener('mouseup', () => {
    if (gameInProgress) {
        gameInProgress = false;
        console.log('Game stopped');
    }
});