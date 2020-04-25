class Person {
    constructor(id, radius, width, height, sick, quarantined, vulnerable, contaminationFactor) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.position = new Vector(
            Math.random() * (this.width - this.radius * 2) + this.radius,
            Math.random() * (this.height - this.radius * 2) + this.radius);

        this.quarantined = quarantined;
        this.vulnerable = vulnerable;
        this.contaminationRadius = radius * contaminationFactor;
        this.sickFrame = 0;
        this.angle = Math.random() * 360;
        this.status = sick ? STATUSES.sick : STATUSES.healthy;
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

    infected({ id, position }) {
        const dx = this.position.x - position.x;
        const dy = this.position.y - position.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const infectionProb = 1 - d / this.contaminationRadius;
        return id !== this.id && d < this.contaminationRadius && Math.random() < infectionProb;
    }

    tick(population) {
        this.handleReflection();
        if (this.status === STATUSES.sick) {
            population.forEach(person => {
                if (person.status === STATUSES.healthy && this.infected(person)) {
                    person.status = STATUSES.sick;
                }
            });
            this.sickFrame++;
        }
        if (!this.quarantined && this.status !== STATUSES.dead) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
        if (this.sickFrame >= SICK_TIMEFRAME) {
            this.status = STATUSES.recovered;
            if (this.vulnerable) this.status = STATUSES.dead;
        }
    }

    handleReflection() {
        if (this.edge.left <= 0) this.reflect(WALLS.W);
        if (this.edge.right >= this.width) this.reflect(WALLS.E);
        if (this.edge.top <= 0) this.reflect(WALLS.N);
        if (this.edge.bottom >= this.height) this.reflect(WALLS.S);
    }
};