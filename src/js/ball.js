

class Ball {
    mass = 1;
    radius = 1;
    position = new Vector(0, 0);
    velocity = new Vector(0, 0);
    acceleration = new Vector(0, 0);
    force = new Vector(0, 0);
    color = "black";
    ctx = null;
    collisions = [];

    isDragging = false;
    dragStart = { x: 0, y: 0 };
    dragPositions = [];


    constructor(mass, radius, position, velocity, acceleration, color, ctx) {
        this.mass = mass;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.color = color;
        this.ctx = ctx;
    }

    setMass(mass) {
        this.mass = mass;
    }

    setRadius(radius) {
        this.radius = radius;
    }

    setPosition(position) {
        this.position = position;
    }

    setVelocity(velocity) {
        this.velocity = velocity;
    }

    setAcceleration(acceleration) {
        this.acceleration = acceleration;
    }

    setForce(force) {
        this.force = force;
    }

    setColor(color) {
        this.color = color;
    }

    setContext(ctx) {
        this.ctx = ctx;
    }

    applyForce(force) {
        this.force = this.force.add(force);
    }

    update() {
        this.velocity.y += gravity; // Apply gravity to velocity
        this.position.x += this.velocity.x; // Update position
        this.position.y += this.velocity.y;

    }
    display() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
    checkCollision(canvas) {
        let damping = parseFloat(document.getElementById("damping").value); // Damping factor
        if (this.position.x + this.radius > canvas.width) {
            this.position.x = canvas.width - this.radius;
            this.velocity.x *= -1 * damping;
        } else if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -1 * damping;
        }

        if (this.position.y + this.radius > canvas.height) {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -1 * damping;
        } else if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -1 * damping;
        }
    }

    collidesWith(other) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + other.radius;
    }



    resolveCollision(other) {
        let restitution = parseFloat(document.getElementById("elasticity").value); // Higher value for more elastic collision
        let frictionCoefficient = parseFloat(document.getElementById("friction").value); // Lower value for less friction
        let gravity = parseFloat(document.getElementById("gravity").value); // Gravity constant
        let frictionForce = this.mass * gravity * frictionCoefficient;
        // Calculate velocity components along the normal and tangential directions
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let normal = { x: dx / distance, y: dy / distance };
        let tangent = { x: -normal.y, y: normal.x };
        // Project the velocities onto the normal and tangential axes
        let v1n = this.velocity.x * normal.x + this.velocity.y * normal.y;
        let v1t = this.velocity.x * tangent.x + this.velocity.y * tangent.y;
        let v2n = other.velocity.x * normal.x + other.velocity.y * normal.y;
        let v2t = other.velocity.x * tangent.x + other.velocity.y * tangent.y;
        // Subtract the friction force from the tangential velocities only if the balls are in contact with the ground
        if (this.position.y + this.radius >= canvas.height && other.position.y + other.radius >= canvas.height) {
            v1t -= frictionForce / this.mass;
            v2t -= frictionForce / other.mass;
        }
        // Compute the new normal velocities after the collision
        let v1tPrime = (v1t * (this.mass - other.mass) + 2 * other.mass * v2t) / (this.mass + other.mass);
        let v2tPrime = (v2t * (other.mass - this.mass) + 2 * this.mass * v1t) / (this.mass + other.mass);
        // Apply the restitution coefficient to make the collision inelastic
        v1tPrime *= restitution;
        v2tPrime *= restitution;
        // Update the velocities of the balls
        this.velocity.x = v1tPrime * tangent.x + v1n * normal.x;
        this.velocity.y = v1tPrime * tangent.y + v1n * normal.y;
        other.velocity.x = v2tPrime * tangent.x + v2n * normal.x;
        other.velocity.y = v2tPrime * tangent.y + v2n * normal.y;
    }

    clampVelocity(maxVelocity) {
        let speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxVelocity) {
            this.velocity.x = (this.velocity.x / speed) * maxVelocity;
            this.velocity.y = (this.velocity.y / speed) * maxVelocity;
        }
    }

    onMouseDown(event) {
        let dx = event.clientX - this.position.x;
        let dy = event.clientY - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius) {
            this.isDragging = true;
            this.dragStart = { x: dx, y: dy };
        }
        this.dragPositions = [{ x: event.clientX, y: event.clientY, time: Date.now() }]; // Start tracking the mouse positions
    }

    // Add a new method to handle mouse up event
    onMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;

            // Calculate the velocity based on the distance dragged
            let dx = event.clientX - this.position.x;
            let dy = event.clientY - this.position.y;
            this.velocity = { x: (dx - this.dragStart.x) * 0.5, y: (dy - this.dragStart.y) * 0.5 };
        }
    }

    // Add a new method to handle mouse move event
    onMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;

            // Calculate the velocity based on the last two positions
            let lastPos = this.dragPositions[this.dragPositions.length - 1];
            let prevPos = this.dragPositions[this.dragPositions.length - 2] || lastPos;
            let dt = (lastPos.time - prevPos.time) / 1000; // Time difference in seconds
            this.velocity = {
                x: (lastPos.x - prevPos.x) / dt,
                y: (lastPos.y - prevPos.y) / dt
            };
        }
    }
    isPointInside(point) {
        let dx = point.x - this.position.x;
        let dy = point.y - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius;
    }
    checkCollision(canvas) {
        const restitution = 0.9; // Adjust this value as needed

        // Check for collision with right or left edge
        if (this.position.x + this.radius + this.velocity.x > canvas.width) {
            this.position.x = canvas.width - this.radius;
            this.velocity.x *= -restitution; // Reverse and dampen the x velocity
        } else if (this.position.x - this.radius + this.velocity.x < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -restitution; // Reverse and dampen the x velocity
        }

        // Check for collision with bottom or top edge
        if (this.position.y + this.radius + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -restitution; // Reverse and dampen the y velocity
        } else if (this.position.y - this.radius + this.velocity.y < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -restitution; // Reverse and dampen the y velocity
        }
    }



    collidesWith(otherBall) {
        let distance = this.position.distance(otherBall.position);
        return distance < this.radius + otherBall.radius;
    }
}