class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag);
    }

    limit(max) {
        let mag = this.magnitude();
        if (mag > max) {
            return this.normalize().multiply(max);
        } else {
            return this;
        }
    }

    distance(vector) {
        return Math.sqrt((this.x - vector.x) * (this.x - vector.x) + (this.y - vector.y) * (this.y - vector.y));
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    static random() {
        return new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

}