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
    collisionCounter = 0;
    isColliding = false;

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

    playCollisionSound() {
        let audio = (this.collisionCounter == 0) ? new Audio("assets/sounds/hit_sound_1.mp3") : new Audio("assets/sounds/hit_sound_2.mp3");
        let sound = document.getElementById("sound-toggle").checked;
        if (audio && sound) {
            audio.play();
            this.collisionCounter = (this.collisionCounter + 1) % 2;
        }
    }

    update() {
        const gravity = parseFloat(document.getElementById("gravity").value);
        this.velocity.y += gravity; // Apply gravity to velocity

        this.position = this.position.add(this.velocity); // Update position

        // Calculate air friction
        const frictionCoefficient = parseFloat(document.getElementById("air-friction").value);
        const frictionForce = this.velocity.multiply(-frictionCoefficient);

        // Apply forces
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.add(frictionForce);
        this.position = this.position.add(this.velocity);
        this.acceleration = new Vector(0, 0);
    }

    display() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;

        // Add shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
        this.ctx.fill();
        this.ctx.closePath();

        // Reset shadow properties
        this.ctx.shadowColor = null;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    collidesWith(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + other.radius) {
            this.playCollisionSound();
        }
        return distance < this.radius + other.radius;
    }

    resolveCollision(other, canvas) {
        const restitution = parseFloat(document.getElementById("elasticity").value);
        const frictionCoefficient = parseFloat(document.getElementById("friction").value);
        const gravity = parseFloat(document.getElementById("gravity").value);
        const frictionForce = this.mass * gravity * frictionCoefficient;

        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const normal = { x: dx / distance, y: dy / distance };
        const tangent = { x: -normal.y, y: normal.x };

        const v1n = this.velocity.x * normal.x + this.velocity.y * normal.y;
        let v1t = this.velocity.x * tangent.x + this.velocity.y * tangent.y;
        const v2n = other.velocity.x * normal.x + other.velocity.y * normal.y;
        let v2t = other.velocity.x * tangent.x + other.velocity.y * tangent.y;

        if (this.position.y + this.radius >= canvas.height && other.position.y + other.radius >= canvas.height) {
            const friction1 = Math.min(frictionForce / this.mass, Math.abs(v1t)) * Math.sign(v1t);
            const friction2 = Math.min(frictionForce / other.mass, Math.abs(v2t)) * Math.sign(v2t);
            v1t -= friction1;
            v2t -= friction2;
        }

        const v1nPrime = (v1n * (this.mass - other.mass) + 2 * other.mass * v2n) / (this.mass + other.mass);
        const v2nPrime = (v2n * (other.mass - this.mass) + 2 * this.mass * v1n) / (this.mass + other.mass);

        const v1nPrimeVector = { x: v1nPrime * normal.x, y: v1nPrime * normal.y };
        const v1tPrimeVector = { x: v1t * tangent.x, y: v1t * tangent.y };
        const v2nPrimeVector = { x: v2nPrime * normal.x, y: v2nPrime * normal.y };
        const v2tPrimeVector = { x: v2t * tangent.x, y: v2t * tangent.y };

        this.velocity.x = v1tPrimeVector.x + v1nPrimeVector.x;
        this.velocity.y = v1tPrimeVector.y + v1nPrimeVector.y;
        other.velocity.x = v2tPrimeVector.x + v2nPrimeVector.x;
        other.velocity.y = v2tPrimeVector.y + v2nPrimeVector.y;

        const overlap = this.radius + other.radius - distance;
        const correction = { x: overlap * normal.x / 2, y: overlap * normal.y / 2 };
        this.position.x += correction.x;
        this.position.y += correction.y;
        other.position.x -= correction.x;
        other.position.y -= correction.y;

        this.angularVelocity = v1t / this.radius;
        other.angularVelocity = v2t / other.radius;

        const maxVelocity = 10;
        this.clampVelocity(maxVelocity);
        other.clampVelocity(maxVelocity);

        this.playCollisionSound();
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

    onMouseMove(event) {
        if (this.isDragging) {
            this.dragPositions.push({ x: event.clientX, y: event.clientY, time: Date.now() });
        }
    }

    isPointInside(point) {
        let dx = point.x - this.position.x;
        let dy = point.y - this.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius;
    }

    checkCollision(canvas) {
        const restitution = parseFloat(document.getElementById("elasticity").value);
        const damping = parseFloat(document.getElementById("damping").value);

        // Flags to track collisions
        let collidedWithFloor = false;
        let collidedWithCeiling = false;
        let collidedWithLeftWall = false;
        let collidedWithRightWall = false;

        // Check for collision with right edge
        if (this.position.x + this.radius + this.velocity.x > canvas.width) {
            this.position.x = canvas.width - this.radius;
            this.velocity.x *= -restitution * damping;
            collidedWithRightWall = true;
        }

        // Check for collision with left edge
        if (this.position.x - this.radius + this.velocity.x < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -restitution * damping;
            collidedWithLeftWall = true;
        }

        // Check for collision with bottom edge
        if (this.position.y + this.radius + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -restitution * damping;
            collidedWithFloor = true;
        }

        // Check for collision with top edge
        if (this.position.y - this.radius + this.velocity.y < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -restitution * damping;
            collidedWithCeiling = true;
        }

        // Play collision sound if a collision occurred and it wasn't already colliding
        if ((collidedWithFloor && !this.isCollidingFloor) ||
            (collidedWithCeiling && !this.isCollidingCeiling) ||
            (collidedWithLeftWall && !this.isCollidingLeftWall) ||
            (collidedWithRightWall && !this.isCollidingRightWall)) {
            this.playCollisionSound();
        }

        // Update collision flags
        this.isCollidingFloor = collidedWithFloor;
        this.isCollidingCeiling = collidedWithCeiling;
        this.isCollidingLeftWall = collidedWithLeftWall;
        this.isCollidingRightWall = collidedWithRightWall;
    }
}
