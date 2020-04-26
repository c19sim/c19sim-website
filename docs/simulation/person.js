class Person {
    constructor(id, radius, width, height, sick, quarantined, vulnerable, contaminationFactor, hygienePenalty, icuQuantity, filledICUs, headerContext, tests, quarantineEffectiveness) {
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
        this.quarantineRadius = this.contaminationRadius*1.1;
        this.quarantineEffectiveness = quarantineEffectiveness;
        this.swerveProb = 0.1;
        this.initialiseMotion();
        this.icuQuantity = icuQuantity;
        this.filledICUs = filledICUs;
        this.headerContext = headerContext;
        this.tests = tests;
        this.testSubject = this.tests.isTested(this.id);
        this.alreadyTested = false;
    }

    initialiseMotion() {
        this.angle = Math.random() * 360;
        this.position = new Vector(
            Math.random() * (this.width - this.radius * 2) + this.radius,
            Math.random() * (this.height - this.radius * 2) + this.radius);
        this.velocity = {
            x: Math.cos(RADIANS(this.angle)) * SPEED,
            y: -Math.sin(RADIANS(this.angle)) * SPEED
        };
    }

    rotateVelocity(angleRadians) {
        let cos = Math.cos(angleRadians);
        let sin = Math.sin(angleRadians);
        let newVelocityX = (this.velocity.x * cos) - (this.velocity.y * sin);
        let newVelocityY = (this.velocity.x * sin) + (this.velocity.y * cos);
        this.velocity.x = newVelocityX;
        this.velocity.y = newVelocityY;
    }

    /**
     * Swerves particles randomly through a number of degrees.
     */
    swerveParticle() {
        if(Math.random() < this.swerveProb)
        {
          let angleRad = (2*Math.random() - 1)*RADIANS(15);
          this.rotateVelocity(angleRad );
        }
    }

    tick() {
        this.handleReflection();
        this.handleTests();
        this.handleSickness();

        if (!this.quarantined && this.status !== STATUSES.dead) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    handleReflection() {
        if (this.edge.left <= 0) this.reflect(WALLS.W);
        if (this.edge.right >= this.width) this.reflect(WALLS.E);
        if (this.edge.top <= 0) this.reflect(WALLS.N);
        if (this.edge.bottom >= this.height) this.reflect(WALLS.S);
        if (this.edge.bottom <= this.height - 50 && this.edge.top >= 50 && this.edge.right <= this.width - 50 && this.edge.left >= 50) this.swerveParticle();
    }

    handleTests() {
        // If person is an alive and untested subject, it will be tested on test time. If the test is positive , it will be quarantined.
        if (!this.alreadyTested && this.testSubject && this.status !== STATUSES.dead){
            if (this.tests.isTime()){
                this.alreadyTested = true;
                if (this.status === STATUSES.sick || this.status === STATUSES.critical) this.quarantined = true;
            }
        }
    }

    handleSickness() {

        if (this.status === STATUSES.sick) {
            this.sickFrame++;
        }
        
        if (this.status === STATUSES.critical) {
            this.criticalFrame++;
        }

        // If person is sick, it gets critical if vulnerable. If vunerable, the person will die if there are no available ICU beds
        if (this.sickFrame >= SICK_TIMEFRAME && this.status === STATUSES.sick) {
            this.status = STATUSES.recovered;
            if (this.vulnerable) {
                if (this.filledICUs.getBedNumbers() >= this.icuQuantity) {
                    this.status = STATUSES.dead;
                    if(this.icuQuantity > 0) this.headerContext.fillText("Maximum ICU capacity has been reached", 270, 40, 1200);
                } else {
                    this.status = STATUSES.critical;
                    this.filledICUs.addBed();
                }
            
            }
        }

        // A person in the critical state can either die or get recovered. In both cases, the bed is removed.
        if (this.criticalFrame >= CRITICAL_TIMEFRAME && this.status === STATUSES.critical) {
            this.status = (Math.random() <= CRITICAL_FATALITY_RATE) ? STATUSES.dead : STATUSES.recovered;
            this.filledICUs.releaseBed();
            this.headerContext.clearRect(0, 0, 1200,50);
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

    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    collideMovingParticleWithQuarantinedPerson(quarantinedPerson, timestep) {
        let angle = this.getRandomInRange(180, 180);
        this.rotateVelocity(RADIANS(angle));
    }

    handleContact(person, timestep){
        if(person.id === this.id){
            return;
        }

        const d = this.distanceBetween(person);

        // If the person comes into contact with a person in quarantine, then there is a much reduced
        // chance that they will infect them.
        if (this.quarantined || person.quarantined) {
            if (d < this.quarantineRadius) {
                if (this.quarantined) {
                    person.collideMovingParticleWithQuarantinedPerson(this, timestep);
                } else {
                    this.collideMovingParticleWithQuarantinedPerson(person, timestep);
                }
                
                this.attemptsToInfect(person, d, true);
                person.attemptsToInfect(this, d, true);

            }
        } else if (d < this.contaminationRadius){
            // Otherwise, the person is coming into contact with a person that is not
            // in quarantine.
            this.attemptsToInfect(person, d);
            person.attemptsToInfect(this, d);
        }
        
        // handle any other consequences
        //   e.g. exchange tracing info
    }

    attemptsToInfect(person, distance, quarantine=false) {
        if(this.status !== STATUSES.sick && this.status !== STATUSES.critical) { 
            return;
        }

        let infectionProb = this.hygienePenalty * (1 - distance / this.contaminationRadius);
        infectionProb = quarantine ? (1-this.quarantineEffectiveness)*infectionProb : infectionProb;
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