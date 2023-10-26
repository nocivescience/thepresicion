const joystickHeadElement = document.querySelector('#joystick-head');   // Joystick head element
let gameInProgress, mouseStartX, mouseStartY, accelerationX, accelerationY, frictionX, frictionY;
let previousTimestamp;
function resetGame(){
    gameInProgress=false;
    previousTimestamp=undefined;
    mouseStartX=undefined;
    mouseStartY=undefined;
    accelerationX=0;
    accelerationY=0;
    frictionX=0;
    frictionY=0;
}
function main(timestamp){
    if(!gameInProgress) return;
    if(previousTimestamp===undefined){   
        previousTimestamp=timestamp;
        window.requestAnimationFrame(main);
        return;
    }
    const maxVelocity=1.5;
    const timeElapsed=(timestamp-previousTimestamp)/16;
    try{
        if(mouseStartX!==undefined && mouseStartY!==undefined){
            const velocityChangeX= accelerationX*timeElapsed;
            const velocityChangeY= accelerationY*timeElapsed;
            console.log(velocityChangeX, velocityChangeY);
        }
    }catch(error){
        console.log(error);
    }
}
joystickHeadElement.addEventListener('mousedown', (e) => {
    if(!gameInProgress){
        mouseStartX= e.clientX;
        mouseStartY= e.clientY;
        gameInProgress=true;
        window.requestAnimationFrame(main);
        joystickHeadElement.style.cssText=`
            left: ${mouseStartX}px;
            top: ${mouseStartY}px;
            animation: none;
            cursor: grabbing;
        `;
        const rotationY=mouseDeltaX/10;
        const rotationX=mouseDeltaY/10;
    }
});
joystickHeadElement.addEventListener('mousemove', () => {
    if(gameInProgress){
        console.log('Game in progress');
    }
});
joystickHeadElement.addEventListener('mouseup', () => {
    if(gameInProgress){
        gameInProgress=false;
        console.log('Game stopped');
    }
});