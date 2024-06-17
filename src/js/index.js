let canvas = new canvas();

let gravity = 0.1;
let friction = 0.99;
let balls = [];

function setup() {
    canvas.canvas.addEventListener("mousemove", function (event) {
        mouse = new Vector(event.clientX, event.clientY);
    });

    canvas.canvas.addEventListener("click", function (event) {
        let ball = new Ball(1, 10, new Vector(event.clientX, event.clientY), new Vector(0, 0), new Vector(0, 0), "black", canvas.context);
        balls.push(ball);
    });

    window.requestAnimationFrame(draw);
}
