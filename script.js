const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const noteElement = document.getElementById("note"); // Note element for instructions and game won, game failed texts

let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

const pathW = 25; // Path width
const wallW = 10; // Wall width
const ballSize = 10; // Width and height of the ball
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];
Math.minmax = function (value, limit) {
    return Math.min(Math.max(value, limit), -limit);
};
const distance2D =(p1, p2) =>{
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
const getAngle = (p1, p2) => {
    let angle = Math.atan(p1.y - p2.y, p1.x - p2.x);
    if (p2.x < p1.x) angle += Math.PI;
    return angle;
};
const closestItCanBe = (cap, ball) => {
    let angle = getAngle(cap, ball);
    const deltaX = Math.cos(angle) * (ballSize + wallW)/2;
    const deltaY = Math.sin(angle) * (ballSize + wallW)/2;
    return {x: cap.x + deltaX, y: cap.y + deltaY};
};
const rollAroundCap = (cap, ball) => {
    let impactAngle = getAngle(ball, cap);
    let ballAngle = getAngle(
        {x: 0, y: 0},
        {x: ball.velocityX, y: ball.velocityY}
    );
    let impactHeadingAngle = impactAngle - ballAngle;
    const velocityMagnitude = disntace2D(
        {x: 0, y: 0},
        {x: ball.velocityX, y: ball.velocityY}
    );
    const velocityMagnitudeDiagonalToTheImpact = Math.sin(impactHeadingAngle) * velocityMagnitude;
    const closestDistance = wallW/2 + ballSize/2;
    const rotationAngle = Math.atan(velocityMagnitudeDiagonalToTheImpact / closestDistance);
    const deltaFromCamp = {
        x: Math.cos(impactAngle+Math.PI-rotationAngle) * closestDistance,
        y: Math.sin(impactAngle+Math.PI-rotationAngle) * closestDistance,
    };
    const x = ball.x;
    const y = ball.y;
    const velocityX = ball.x - (cap.x + deltaFromCamp.x);
    const velocityY = ball.y - (cap.y + deltaFromCamp.y);
    const nextX = x + velocityX;
    const nextY = y + velocityY;
    return {x, y, velocityX, velocityY, nextX, nextY};
}
const slow= (number, difference) => {
    if (Math.abs(number) <= difference) return 0;
    if (number > difference) return number - difference;
    return number + difference;
};
const walls= [
    {column: 0, row: 0, horizontal: true, length: 10},
    {column: 0, row: 0, horizontal: false, length: 9},
    {column: 0, row: 9, horizontal: true, length: 10},
    {column: 10, row: 0, horizontal: false, length: 9},
].map(wall => ({
    x: wall.column * (pathW + wallW),
    y: wall.row * (pathW + wallW),
    horizontal: wall.horizontal,
    length: wall.length * (pathW + wallW)
}));
balls = [
    {column: 0, row: 0},
    {column: 9, row: 9},
    {column: 0, row: 8},
    {column: 9, row: 8},
].map(ball => ({
    x: ball.column * (pathW + wallW) + pathW/2 + wallW/2,
    y: ball.row * (pathW + wallW) + pathW/2 + wallW/2,
    velocityX: 0,
    velocityY: 0,
}));
walls.forEach(({x,y,horizontal,length}) => {
    const wall= document.createElement("div");
    wall.setAttribute("class", "wall");
    wall.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${wallW}px;
        height: ${length}px;
        transform: rotate(${horizontal ? -90 : 0}deg);
    `;
    mazeElement.appendChild(wall);
});
function main(timestamp){
    try{
        balls.forEach((ball)=>{
            walls.forEach((wall, wi)=>{
                
            });
        })
    }catch (e) {
        console.error(e);
    }
}
window.addEventListener('click', (e) => {
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    window.requestAnimationFrame(main);
});