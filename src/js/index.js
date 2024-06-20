let canvas = new Canvas("canvas"); // Assuming the class name is Canvas

let gravity = parseFloat(document.getElementById("gravity").value);
let friction = parseFloat(document.getElementById("friction").value);
let damping = parseFloat(document.getElementById("damping").value);

let collisionFriction = friction;
let ballCount = 0;
let balls = [];

let ballcounter = document.getElementById("ball-count");
let btClear = document.getElementById("clear");

canvas.canvas.addEventListener("mousemove", function (event) {
    mouse = new Vector(event.clientX, event.clientY);
});

let mouseDownPosition = null;
let ball = null;
let mouseIsDown = false;

canvas.canvas.addEventListener("mousedown", function (event) {
    if (!ball) {
        let rect = canvas.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        mouseDownPosition = new Vector(x, y);
        let ballSize = parseInt(document.getElementById("ball-size").value);
        let ballMass = parseInt(document.getElementById("ball-mass").value);
        let ballColor = document.getElementById("ball-color").value;
        ball = new Ball(ballMass, ballSize, new Vector(x, y), new Vector(0, 0), new Vector(0, 0), ballColor, canvas.context);
        balls.push(ball);
        mouseIsDown = true;
    }
});

canvas.canvas.addEventListener("mousemove", function (event) {
    let rect = canvas.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    mouse = new Vector(x, y);
});

canvas.canvas.addEventListener("mouseup", function (event) {
    if (ball) {
        let rect = canvas.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let mouseUpPosition = new Vector(x, y);
        let throwVector = mouseUpPosition.subtract(mouseDownPosition);
        let scalingFactor = 0.1;
        throwVector = throwVector.multiply(scalingFactor);
        ball.velocity = throwVector;
        ball = null;
        mouseIsDown = false;
    }
});

canvas.canvas.addEventListener("click", function (event) {
    if (balls.length > 0) {
        document.getElementById('overlay').style.display = 'none';
    }
    if (ballcounter) {
        ballcounter.value = balls.length;
    }
});

btClear.addEventListener("click", function () {
    balls = [];
    ballcounter.value = 0;
    document.getElementById('overlay').style.display = 'block';
});

function loop() {
    gravity = parseFloat(document.getElementById("gravity").value);
    friction = parseFloat(document.getElementById("friction").value);
    damping = parseFloat(document.getElementById("damping").value);

    canvas.clear();
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        let frictionForce = ball.velocity.multiply(-1).normalize().multiply(friction);
        ball.applyForce(frictionForce);
        ball.applyForce(new Vector(0, gravity));
        ball.update();
        ball.checkCollision(canvas.canvas);

        let ballcounter = document.getElementById("ballcounter");
        if (ballcounter) {
            ballcounter.innerHTML = "Ball count: " + balls.length;
        }

        for (let j = i + 1; j < balls.length; j++) {
            if (ball.collidesWith(balls[j])) {
                ball.resolveCollision(balls[j], canvas.canvas); // Pass the canvas object
            }
        }

        ball.display(); // Call the display method to draw the ball and its trail
    }
    requestAnimationFrame(loop);
}

loop(); // Start the animation loop
