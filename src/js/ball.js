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
        // Compute the new normal velocities after the collision
        let v1nPrime = (v1n * (this.mass - other.mass) + 2 * other.mass * v2n) / (this.mass + other.mass);
        let v2nPrime = (v2n * (other.mass - this.mass) + 2 * this.mass * v1n) / (this.mass + other.mass);
        // Calculate the friction force
        let gravity = parseFloat(document.getElementById("gravity").value); // Gravity constant
        let frictionForce = this.mass * gravity * frictionCoefficient;
        // Subtract the friction force from the tangential velocities only if the balls are in contact with the ground
        if (this.position.y + this.radius >= canvas.height && other.position.y + other.radius >= canvas.height) {
            v1t -= frictionForce / this.mass;
            v2t -= frictionForce / other.mass;
        }
        // Apply the restitution coefficient to make the collision inelastic
        v1nPrime *= restitution;
        v2nPrime *= restitution;
        // Update the velocities
        this.velocity.x = v1nPrime * normal.x + v1t * tangent.x;
        other.velocity.x = v2nPrime * normal.x + v2t * tangent.x;
        // Add a small separation to ensure the balls are no longer overlapping
        let overlap = this.radius + other.radius - distance;
        let separation = overlap * 0.5;
        this.position.x += separation * normal.x;
        other.position.x -= separation * normal.x;
    }

    onMouseDown(event) {
        let dx = event.clientX - this.position.x;
        let dy = event.clientY - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius) {
            this.isDragging = true;
            this.dragStart = { x: dx, y: dy };
        }
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
    onMouseMove(event) {
        if (this.isDragging) {
            // Update the position of the ball to follow the mouse
            this.position = { x: event.clientX - this.dragStart.x, y: event.clientY - this.dragStart.y };
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