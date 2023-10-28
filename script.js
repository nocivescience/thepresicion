Math.minmax = (value, limit) => {
    return Math.max(Math.min(value, limit), -limit);
}
const joystickHeadElement = document.querySelector('#joystick-head');   // Joystick head element
const mazeEl = document.querySelector('#maze');                          // Maze element
let gameInProgress, mouseStartX, mouseStartY, accelerationX, accelerationY, frictionX, frictionY, balls, walls, previousTimestamp;
let hardMode = false;
let ballElements = [];
let holeElements = [];
let debugMode = false;
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
    // It is possible to reset the game mid-game. This case the look should stop
    if (!gameInProgress) return;
  
    if (previousTimestamp === undefined) {
      previousTimestamp = timestamp;
      window.requestAnimationFrame(main);
      return;
    }
  
    const maxVelocity = 1.5;
  
    // Time passed since last cycle divided by 16
    // This function gets called every 16 ms on average so dividing by 16 will result in 1
    const timeElapsed = (timestamp - previousTimestamp) / 16;
  
    try {
      // If mouse didn't move yet don't do anything
      if (accelerationX != undefined && accelerationY != undefined) {
        const velocityChangeX = accelerationX * timeElapsed;
        const velocityChangeY = accelerationY * timeElapsed;
        const frictionDeltaX = frictionX * timeElapsed;
        const frictionDeltaY = frictionY * timeElapsed;
  
        balls.forEach((ball) => {
          if (velocityChangeX == 0) {
            // No rotation, the plane is flat
            // On flat surface friction can only slow down, but not reverse movement
            ball.velocityX = slow(ball.velocityX, frictionDeltaX);
          } else {
            ball.velocityX = ball.velocityX + velocityChangeX;
            ball.velocityX = Math.max(Math.min(ball.velocityX, 1.5), -1.5);
            ball.velocityX =
              ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
            ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
          }
  
          if (velocityChangeY == 0) {
            // No rotation, the plane is flat
            // On flat surface friction can only slow down, but not reverse movement
            ball.velocityY = slow(ball.velocityY, frictionDeltaY);
          } else {
            ball.velocityY = ball.velocityY + velocityChangeY;
            ball.velocityY =
              ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
            ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
          }
  
          // Preliminary next ball position, only becomes true if no hit occurs
          // Used only for hit testing, does not mean that the ball will reach this position
          ball.nextX = ball.x + ball.velocityX;
          ball.nextY = ball.y + ball.velocityY;
  
          if (debugMode) console.log("tick", ball);
  
          walls.forEach((wall, wi) => {
            if (wall.horizontal) {
              // Horizontal wall
  
              if (
                ball.nextY + ballSize / 2 >= wall.y - wallW / 2 &&
                ball.nextY - ballSize / 2 <= wall.y + wallW / 2
              ) {
                console.log(ball.nextY + ballSize / 2 >= wall.y - wallW / 2 &&
                ball.nextY - ballSize / 2 <= wall.y + wallW / 2);
                // Ball got within the strip of the wall
                // (not necessarily hit it, could be before or after)
  
                const wallStart = {
                  x: wall.x,
                  y: wall.y
                };
                const wallEnd = {
                  x: wall.x + wall.length,
                  y: wall.y
                };
  
                if (
                  ball.nextX + ballSize / 2 >= wallStart.x - wallW / 2 &&
                  ball.nextX < wallStart.x
                ) {
                  // Ball might hit the left cap of a horizontal wall
                  const distance = distance2D(wallStart, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  if (distance < ballSize / 2 + wallW / 2) {
                    if (debugMode && wi > 4)
                      console.warn("too close h head", distance, ball);
  
                    // Ball hits the left cap of a horizontal wall
                    const closest = closestItCanBe(wallStart, {
                      x: ball.nextX,
                      y: ball.nextY
                    });
                    const rolled = rollAroundCap(wallStart, {
                      x: closest.x,
                      y: closest.y,
                      velocityX: ball.velocityX,
                      velocityY: ball.velocityY
                    });
  
                    Object.assign(ball, rolled);
                  }
                }
  
                if (
                  ball.nextX - ballSize / 2 <= wallEnd.x + wallW / 2 &&
                  ball.nextX > wallEnd.x
                ) {
                  // Ball might hit the right cap of a horizontal wall
                  const distance = distance2D(wallEnd, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  if (distance < ballSize / 2 + wallW / 2) {
                    if (debugMode && wi > 4)
                      console.warn("too close h tail", distance, ball);
  
                    // Ball hits the right cap of a horizontal wall
                    const closest = closestItCanBe(wallEnd, {
                      x: ball.nextX,
                      y: ball.nextY
                    });
                    const rolled = rollAroundCap(wallEnd, {
                      x: closest.x,
                      y: closest.y,
                      velocityX: ball.velocityX,
                      velocityY: ball.velocityY
                    });
  
                    Object.assign(ball, rolled);
                  }
                }
  
                if (ball.nextX >= wallStart.x && ball.nextX <= wallEnd.x) {
                  // The ball got inside the main body of the wall
                  if (ball.nextY < wall.y) {
                    // Hit horizontal wall from top
                    ball.nextY = wall.y - wallW / 2 - ballSize / 2;
                  } else {
                    // Hit horizontal wall from bottom
                    ball.nextY = wall.y + wallW / 2 + ballSize / 2;
                  }
                  ball.y = ball.nextY;
                  ball.velocityY = -ball.velocityY / 3;
  
                  if (debugMode && wi > 4)
                    console.error("crossing h line, HIT", ball);
                }
              }
            } else {
              // Vertical wall
  
              if (
                ball.nextX + ballSize / 2 >= wall.x - wallW / 2 &&
                ball.nextX - ballSize / 2 <= wall.x + wallW / 2
              ) {
                // Ball got within the strip of the wall
                // (not necessarily hit it, could be before or after)
  
                const wallStart = {
                  x: wall.x,
                  y: wall.y
                };
                const wallEnd = {
                  x: wall.x,
                  y: wall.y + wall.length
                };
  
                if (
                  ball.nextY + ballSize / 2 >= wallStart.y - wallW / 2 &&
                  ball.nextY < wallStart.y
                ) {
                  // Ball might hit the top cap of a horizontal wall
                  const distance = distance2D(wallStart, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  if (distance < ballSize / 2 + wallW / 2) {
                    if (debugMode && wi > 4)
                      console.warn("too close v head", distance, ball);
  
                    // Ball hits the left cap of a horizontal wall
                    const closest = closestItCanBe(wallStart, {
                      x: ball.nextX,
                      y: ball.nextY
                    });
                    const rolled = rollAroundCap(wallStart, {
                      x: closest.x,
                      y: closest.y,
                      velocityX: ball.velocityX,
                      velocityY: ball.velocityY
                    });
  
                    Object.assign(ball, rolled);
                  }
                }
  
                if (
                  ball.nextY - ballSize / 2 <= wallEnd.y + wallW / 2 &&
                  ball.nextY > wallEnd.y
                ) {
                  // Ball might hit the bottom cap of a horizontal wall
                  const distance = distance2D(wallEnd, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  if (distance < ballSize / 2 + wallW / 2) {
                    if (debugMode && wi > 4)
                      console.warn("too close v tail", distance, ball);
  
                    // Ball hits the right cap of a horizontal wall
                    const closest = closestItCanBe(wallEnd, {
                      x: ball.nextX,
                      y: ball.nextY
                    });
                    const rolled = rollAroundCap(wallEnd, {
                      x: closest.x,
                      y: closest.y,
                      velocityX: ball.velocityX,
                      velocityY: ball.velocityY
                    });
  
                    Object.assign(ball, rolled);
                  }
                }
  
                if (ball.nextY >= wallStart.y && ball.nextY <= wallEnd.y) {
                  // The ball got inside the main body of the wall
                  if (ball.nextX < wall.x) {
                    // Hit vertical wall from left
                    ball.nextX = wall.x - wallW / 2 - ballSize / 2;
                  } else {
                    // Hit vertical wall from right
                    ball.nextX = wall.x + wallW / 2 + ballSize / 2;
                  }
                  ball.x = ball.nextX;
                  ball.velocityX = -ball.velocityX / 3;
  
                  if (debugMode && wi > 4)
                    console.error("crossing v line, HIT", ball);
                }
              }
            }
          });
  
          // Detect is a ball fell into a hole
          if (hardMode) {
            holes.forEach((hole, hi) => {
              const distance = distance2D(hole, {
                x: ball.nextX,
                y: ball.nextY
              });
  
              if (distance <= holeSize / 2) {
                // The ball fell into a hole
                holeElements[hi].style.backgroundColor = "red";
                throw Error("The ball fell into a hole");
              }
            });
          }
  
          // Adjust ball metadata
          ball.x = ball.x + ball.velocityX;
          ball.y = ball.y + ball.velocityY;
        });
  
        // Move balls to their new position on the UI
        balls.forEach(({ x, y }, index) => {
          ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
        });
      }
  
      // Win detection
      if (
        balls.every(
          (ball) => distance2D(ball, { x: 350 / 2, y: 315 / 2 }) < 65 / 2
        )
      ) {
        noteElement.innerHTML = `Congrats, you did it!
          ${!hardMode ? "<p>Press H for hard mode</p>" : ""}
          <p>
            Follow me
            <a href="https://twitter.com/HunorBorbely" , target="_blank"
              >@HunorBorbely</a
            >
          </p>`;
        noteElement.style.opacity = 1;
        gameInProgress = false;
      } else {
        previousTimestamp = timestamp;
        window.requestAnimationFrame(main);
      }
    } catch (error) {
      if (error.message == "The ball fell into a hole") {
        noteElement.innerHTML = `A ball fell into a black hole! Press space to reset the game.
          <p>
            Back to easy? Press E
          </p>`;
        noteElement.style.opacity = 1;
        gameInProgress = false;
      } else throw error;
    }
  }

// function main(timestamp) {
//     if (!gameInProgress) return;
//     if (previousTimestamp === undefined) {
//         previousTimestamp = timestamp;
//         window.requestAnimationFrame(main);
//         return;
//     }
//     const maxVelocity = 1.5;
//     const timeElapsed = (timestamp - previousTimestamp) / 16;
//     try {
//         if (accelerationX !== undefined && accelerationY !== undefined) {
//             const velocityChangeX = accelerationX * timeElapsed;
//             const velocityChangeY = accelerationY * timeElapsed;
//             const frictionDeltaX = frictionX * timeElapsed;
//             const frictionDeltaY = frictionY * timeElapsed;
//             balls.forEach((ball)=>{
//                 if(velocityChangeX === 0){
//                     ball.velocityX = slow(ball.velocityX, frictionDeltaX);
//                 }else{
//                     ball.velocityX += velocityChangeX;
//                     ball.velocityX = Math.minmax(ball.velocityX, 1.5);
//                     ball.velocityX = ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
//                     ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
//                 }
//                 if(velocityChangeY === 0){
//                     ball.velocityY = slow(ball.velocityY, frictionDeltaY);
//                 }else{
//                     ball.velocityY += velocityChangeY;
//                     // ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
//                     ball.velocityY = ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
//                     ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
//                 };
//                 ball.nextX = ball.x + ball.velocityX;
//                 ball.nextY = ball.y + ball.velocityY;
//                 // ballElements.forEach((ballElement, index) => {
//                 //     ballElement.style.cssText = `}
//                 //         left: ${ball.x}px;
//                 //         top: ${ball.y}px;
//                 //     `;
//                 // });
//                 walls.forEach((wall, wi) => {
//                     if(wall.horizontal){
//                         if(ball.nextY+ballSize/2>=wall.y-wallW/2 && ball.nextY-ballSize/2<=wall.y+wallW/2){
//                             console.log(ball.nextY+ballSize/2>=wall.y-wallW/2 && ball.nextY-ballSize/2<=wall.y+wallW/2);
//                         }
//                     }
//                 });
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }
joystickHeadElement.addEventListener('mousedown', (e) => {
    if (!gameInProgress) {
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        gameInProgress = true;
        window.requestAnimationFrame(main); //super
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