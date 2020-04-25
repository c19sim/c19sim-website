class Person {
    constructor(id, radius, width, height, sick, quarantined, vulnerable, contaminationFactor, hygienePenalty) {
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
        this.hygienePenalty = hygienePenalty;
        this.swerveProb = 0.1;
        this.updateVelocity();
    }

    updateVelocity() {
        this.velocity = {
            x: Math.sin(RADIANS(this.angle)) * SPEED,
            y: -Math.cos(RADIANS(this.angle)) * SPEED
        };

    }

    swerveParticle() {
        let angle = 10
        let magnitudeBefore =  Math.sqrt(this.velocity.x ** 2 + this.velocity.y **2);
        this.velocity.x = (Math.random() <= this.swerveProb) ? this.velocity.x * Math.cos(RADIANS(angle)) - this.velocity.y * Math.sin(RADIANS(angle)) : this.velocity.x;
        this.velocity.y = (Math.random() <= this.swerveProb) ? this.velocity.x * Math.sin(RADIANS(angle)) + this.velocity.y * Math.cos(RADIANS(angle)) : this.velocity.y;
        let magnitudeAfter =  Math.sqrt(this.velocity.x ** 2 + this.velocity.y **2);
        if (magnitudeBefore !== magnitudeAfter) {
            console.log(magnitudeBefore);
            console.log(magnitudeAfter);
        }

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
        const infectionProb = this.hygienePenalty * (1 - d / this.contaminationRadius);
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
        if (this.edge.bottom <= this.height - 50 && this.edge.top >= 50 && this.edge.right <= this.width - 50 && this.edge.left >= 50) this.swerveParticle();
    }
};