class Person {
    constructor(id, radius, width, height, sick, quarantined, vulnerable) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.position = new Vector(
            Math.random() * (this.width - this.radius * 2) + this.radius,
            Math.random() * (this.height - this.radius * 2) + this.radius);

        this.quarantined = quarantined;
        this.sick = sick;
        this.vulnerable = vulnerable;
        this.sickFrame = 0;
        this.recovered = false;
        this.angle = Math.random() * 360;
        this.updateVelocity();
    }

    updateVelocity() {
        this.velocity = {
            x: Math.sin(RADIANS(this.angle)) * SPEED,
            y: -Math.cos(RADIANS(this.angle)) * SPEED
        };

    }

    get edge() {
        return {
            bottom: this.position.y + this.radius,
            left: this.position.x - this.radius,
            right: this.position.x + this.radius,
            top: this.position.y - this.radius
        };

    }

    reflect({ velocity }) {
        const x = this.velocity.x * velocity.x;
        const y = this.velocity.y * velocity.y;
        const d = 2 * (x + y);
        this.velocity.x -= d * velocity.x;
        this.velocity.y -= d * velocity.y;
    }

    collide({ id, position }) {
        const dx = this.position.x - position.x;
        const dy = this.position.y - position.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return id !== this.id && d < this.radius * 2;
    }

    tick(population) {
        this.handleReflection();
        if (this.sick) {
            population.forEach(person => {
                if (!person.recovered && !person.sick && this.collide(person)) {
                    person.sick = true;
                }
            });
            this.sickFrame++;
        }
        if (!this.quarantined && !this.dead) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
        if (this.sickFrame >= SICK_TIMEFRAME) {
            this.sick = false;
            this.recovered = true;
            if (this.vulnerable) this.dead = true;
        }
    }

    handleReflection() {
        if (this.edge.left <= 0) this.reflect(WALLS.W);
        if (this.edge.right >= this.width) this.reflect(WALLS.E);
        if (this.edge.top <= 0) this.reflect(WALLS.N);
        if (this.edge.bottom >= this.height) this.reflect(WALLS.S);
    }
};