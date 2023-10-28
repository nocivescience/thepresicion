Math.minmax = (value, limit) => {
    return Math.max(Math.min(value, limit), -limit);
}
const joystickHeadElement = document.querySelector('#joystick-head');   // Joystick head element
const mazeEl = document.querySelector('#maze');                          // Maze element
let gameInProgress, mouseStartX, mouseStartY, accelerationX, accelerationY, frictionX, frictionY, balls, walls, previousTimestamp;
let hardMode = false;
let ballElements = [];
let holeElements = [];
const pathW= 25;
const wallW= 10;
const ballSize = 10;
const holeSize = 18;
resetGame();
function distance2D(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};
function getAngle(p1, p2) { //revisa esto
    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    if (angle < 0) angle += 360;  // hasta acá
    return angle;
};
const closestItCanBe = (cap, ball) => {
    let angle = getAngle(cap, ball);
    const deltaX= Math.cos(angle) * (wallW+ballSize)/2;
    const deltaY= Math.sin(angle) * (wallW+ballSize)/2;
    return {x: cap.x + deltaX, y: cap.y + deltaY};
};
const rollAroundCap =(cap, ball)=>{
    const nextX= 1
    const nextY= 1
    return {nextX, nextY}
}
function slow(number, difference){
    if(Math.abs(number) <= difference){
        return 0;
    }
    if(number>difference){
        return number-difference;
    }
    return number+difference;
}
function resetGame() {
    gameInProgress = false;
    previousTimestamp = undefined;
    mouseStartX = undefined;
    mouseStartY = undefined;
    accelerationX = undefined;
    accelerationY = undefined;
    frictionX = undefined;
    frictionY = undefined;
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
    {column:0, row: 6, horizontal: true, length: 1},
    {column:0, row: 8, horizontal: true, length: 1},
    {column:2, row: 2, horizontal: true, length: 2},
    {column:2, row: 4, horizontal: true, length: 1},
    {column:2, row: 5, horizontal: true, length: 1},
    {column:2, row: 6, horizontal: true, length: 1},
    { column: 3, row: 3, horizontal: true, length: 1 },
  { column: 3, row: 8, horizontal: true, length: 3 },

  // Horizontal lines starting in 5th column
  { column: 4, row: 6, horizontal: true, length: 1 },

  // Horizontal lines starting in 6th column
  { column: 5, row: 2, horizontal: true, length: 2 },
  { column: 5, row: 7, horizontal: true, length: 1 },

  // Horizontal lines starting in 7th column
  { column: 6, row: 1, horizontal: true, length: 1 },
  { column: 6, row: 6, horizontal: true, length: 2 },

  // Horizontal lines starting in 8th column
  { column: 7, row: 3, horizontal: true, length: 2 },
  { column: 7, row: 7, horizontal: true, length: 2 },

  // Horizontal lines starting in 9th column
  { column: 8, row: 1, horizontal: true, length: 1 },
  { column: 8, row: 2, horizontal: true, length: 1 },
  { column: 8, row: 3, horizontal: true, length: 1 },
  { column: 8, row: 4, horizontal: true, length: 2 },
  { column: 8, row: 8, horizontal: true, length: 2 },

  // Vertical lines after the 1st column
  { column: 1, row: 1, horizontal: false, length: 2 },
  { column: 1, row: 4, horizontal: false, length: 2 },

  // Vertical lines after the 2nd column
  { column: 2, row: 2, horizontal: false, length: 2 },
  { column: 2, row: 5, horizontal: false, length: 1 },
  { column: 2, row: 7, horizontal: false, length: 2 },

  // Vertical lines after the 3rd column
  { column: 3, row: 0, horizontal: false, length: 1 },
  { column: 3, row: 4, horizontal: false, length: 1 },
  { column: 3, row: 6, horizontal: false, length: 2 },

  // Vertical lines after the 4th column
  { column: 4, row: 1, horizontal: false, length: 2 },
  { column: 4, row: 6, horizontal: false, length: 1 },

  // Vertical lines after the 5th column
  { column: 5, row: 0, horizontal: false, length: 2 },
  { column: 5, row: 6, horizontal: false, length: 1 },
  { column: 5, row: 8, horizontal: false, length: 1 },

  // Vertical lines after the 6th column
  { column: 6, row: 4, horizontal: false, length: 1 },
  { column: 6, row: 6, horizontal: false, length: 1 },

  // Vertical lines after the 7th column
  { column: 7, row: 1, horizontal: false, length: 4 },
  { column: 7, row: 7, horizontal: false, length: 2 },

  // Vertical lines after the 8th column
  { column: 8, row: 2, horizontal: false, length: 1 },
  { column: 8, row: 4, horizontal: false, length: 2 },

  // Vertical lines after the 9th column
  { column: 9, row: 1, horizontal: false, length: 1 },
  { column: 9, row: 5, horizontal: false, length: 2 }
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
            if(accelerationX!==undefined&&accelerationY!==undefined){
                console.log(accelerationX, accelerationY);
            }
            const velocityChangeX = accelerationX * timeElapsed;
            const velocityChangeY = accelerationY * timeElapsed;
            const frictionDeltaX = frictionX * timeElapsed;
            const frictionDeltaY = frictionY * timeElapsed;
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
window.addEventListener('mousemove', (e) => {
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
// window.addEventListener('mouseup', () => {
//     joystickHeadElement.style.cssText = `
//         left: 0;
//         top: 0;
//         animation: glow;
//         cursor: grab;
//     `;
// });
// joystickHeadElement.addEventListener('mouseup', () => {
//     if (gameInProgress) {
//         gameInProgress = false;
//         console.log('Game stopped');
//     }
// });