class ball {
    mass = 1;
    radius = 1;
    position = new Vector(0, 0);
    velocity = new Vector(0, 0);
    acceleration = new Vector(0, 0);
    force = new Vector(0, 0);
    color = "black";
    ctx = null;
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
        this.acceleration = this.force.divide(this.mass);
        this.velocity = this.velocity.add(this.acceleration);
        this.position = this.position.add(this.velocity);
        this.force = new Vector(0, 0);
    }

}