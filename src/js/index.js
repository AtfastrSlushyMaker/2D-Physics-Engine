let canvas = new Canvas("canvas"); // Assuming the class name is Canvas

const gravity = 0.5;
let friction = 0.99;
let damping = 0.70;
let collisionFriction = 0.9;
let balls = [];

canvas.canvas.addEventListener("mousemove", function (event) {
    mouse = new Vector(event.clientX, event.clientY);
});

canvas.canvas.addEventListener("click", function (event) {
    console.log("Canvas clicked"); // Debug line
    let rect = canvas.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let ball = new Ball(1, 10, new Vector(x, y), new Vector(0, 0), new Vector(0, 0), "white", canvas.context);
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

