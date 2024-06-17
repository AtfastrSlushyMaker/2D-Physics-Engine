let canvas = new Canvas("canvas"); // Assuming the class name is Canvas

const gravity = parseFloat(document.getElementById("gravity").value);
const friction = parseFloat(document.getElementById("friction").value);
const damping = parseFloat(document.getElementById("damping").value);


let collisionFriction = 0.9;
let ballCount = 0;
let balls = [];

let ballcounter = document.getElementById("ballcounter");



canvas.canvas.addEventListener("mousemove", function (event) {
    mouse = new Vector(event.clientX, event.clientY);
});

canvas.canvas.addEventListener("click", function (event) {
    console.log("Canvas clicked"); // Debug line
    let rect = canvas.canvas.getBoundingClientRect();
    let ballSize = parseInt(document.getElementById("ball-size").value);
    let ballMass = parseInt(document.getElementById("ball-mass").value);
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let ball = new Ball(ballMass, ballSize, new Vector(x, y), new Vector(0, 0), new Vector(0, 0), "white", canvas.context);
    console.log(ball); // Debug line
    balls.push(ball);
});

function loop() {
    canvas.clear();
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        let frictionForce = ball.velocity.multiply(-1).normalize().multiply(friction);
        ball.applyForce(frictionForce);
        ball.applyForce(new Vector(0, gravity));
        ball.update();
        ball.checkCollision(canvas.canvas); // Check for collision with canvas

        let ballcounter = document.getElementById("ballcounter");
        if (ballcounter) {
            ballcounter.innerHTML = "Ball count: " + balls.length;
        }

        for (let j = i + 1; j < balls.length; j++) {
            if (ball.collidesWith(balls[j])) {
                ball.resolveCollision(balls[j]);
            }
        }

        ball.display();
    }
    requestAnimationFrame(loop);
}

loop(); // Start the animation loop

