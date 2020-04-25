class Person {
    constructor(id, radius, width, height, sick, quarantined, vulnerable, contaminationFactor, hygienePenalty, icuQuantity, filledICUs) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.quarantined = quarantined;
        this.vulnerable = vulnerable;
        this.contaminationRadius = radius * contaminationFactor;
        this.sickFrame = 0;
        this.criticalFrame = 0;
        this.status = sick ? STATUSES.sick : STATUSES.healthy;
        this.hygienePenalty = hygienePenalty;
        this.initialiseMotion();
        this.icuQuantity = icuQuantity;
        this.filledICUs = filledICUs;
    }

    initialiseMotion() {
        this.angle = Math.random() * 360;
        this.position = new Vector(
            Math.random() * (this.width - this.radius * 2) + this.radius,
            Math.random() * (this.height - this.radius * 2) + this.radius);
        this.velocity = {
            x: Math.sin(RADIANS(this.angle)) * SPEED,
            y: -Math.cos(RADIANS(this.angle)) * SPEED
        };
    }

    tick(population) {
        this.handleReflection();
        if (this.status === STATUSES.sick) {
            this.sickFrame++;
        }
        
        if (this.status === STATUSES.critical) {
            
            console.log(this.criticalFrame);
            this.criticalFrame++;
        }

        if (!this.quarantined && this.status !== STATUSES.dead) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }

        // If person is sick, it gets critical if vulnerable. If vunerable, the person will die if there are no available ICU beds
        if (this.sickFrame >= SICK_TIMEFRAME && this.status !== STATUSES.recovered) {
            this.status = STATUSES.recovered;
            if (this.vulnerable) {
                if (this.filledICUs.get() >= this.icuQuantity) {
                    this.status = STATUSES.dead;
                    console.log(this.filledICUs.get())
                } else {
                    this.status = STATUSES.critical;
                    this.filledICUs.add();
                }
            
            }
        }

        // A person in the critical state can either die or get recovered. In both cases, the bed is removed.
        if (this.criticalFrame >= CRITICAL_TIMEFRAME && this.status !== STATUSES.recovered) {
            this.status = (Math.random() <= CRITICAL_FATALITY_RATE) ? STATUSES.dead : STATUSES.recovered;
            this.filledICUs.remove();
        }
    }

    handleReflection() {
        if (this.edge.left <= 0) this.reflect(WALLS.W);
        if (this.edge.right >= this.width) this.reflect(WALLS.E);
        if (this.edge.top <= 0) this.reflect(WALLS.N);
        if (this.edge.bottom >= this.height) this.reflect(WALLS.S);
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

    handleContact(person){
        if(person.id === this.id){
            return;
        }

        const d = this.distanceBetween(person);
        if(d < this.contaminationRadius){
            // handle any infectious consequences
            this.attemptsToInfect(person, d);
            person.attemptsToInfect(this, d);
        }

        // handle any other consequences
        //   e.g. exchange tracing info
    }

    attemptsToInfect(person, distance) {
        if(this.status !== STATUSES.sick && this.status !== STATUSES.critical) { 
            return;
        }

        const infectionProb = this.hygienePenalty * (1 - distance / this.contaminationRadius);
        if(Math.random() < infectionProb) {
            person.getsInfected();
        }
    }

    getsInfected(){
        if (this.status === STATUSES.healthy) {
            this.status = STATUSES.sick;
        }
    }

    distanceBetween(person){
        const dx = this.position.x - person.position.x;
        const dy = this.position.y - person.position.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d;
    }
};