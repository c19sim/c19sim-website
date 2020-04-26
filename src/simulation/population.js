class Population {
    constructor(size, quarantineRate, patientZeroes, hygieneLevel, icuPercentage, tests, contaminationFactor = 2) {
        this.filledICUs = new IntensiveCare();
        Object.freeze(this.filledICUs);
        this.people = new Array(size);
        this.header = document.getElementById("header");
        this.headerContext = this.header.getContext("2d");
        this.headerContext.font = "36px Roboto, sans-serif";
        this.headerContext.fillStyle = "red"; // set stroke color to red
        this.headerContext.lineWidth = "3.5";  //  set stroke width to 1.5
        this.canvas = document.getElementById("population");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.hygienePenalty = 1 - hygieneLevel * 0.8;
        this.radius = size < 250 ? 12 : size < 500 ? 8 : 5;
        this.timestep = 0;
        this.contaminationFactor = contaminationFactor;
        this.icuQuantity = Math.floor(icuPercentage * size);
        this.tests = tests;
        this.quarantineEffectiveness = 0.95;
        for (let i = 0; i < size; i++) {
            const sick = i > size - patientZeroes - 1;
            const quarantined = i / size <= quarantineRate;
            const vulnerable = Math.random() < 0.1;
            this.people[i] = new Person(
                i,
                this.radius,
                this.width,
                this.height,
                sick,
                quarantined,
                vulnerable,
                this.contaminationFactor,
                this.hygienePenalty,
                this.icuQuantity,
                this.filledICUs,
                this.headerContext,
                this.tests,
                this.quarantineEffectiveness);
        }
    }

    tick() {
        this.context.clearRect(0, 0, this.width, this.height);
        if (this.timestep == 0) {
            this.handleQuarantineOverlap();
        }

        this.people.forEach(p => {
            this.draw(p);
            p.tick(this.people);
        });
        for (let i = 0; i < this.people.length; i++) {
            for (let n = i + 1; n < this.people.length; n++) {
                if(this.people[i] !== null && this.people[n] !== null){
                    this.people[i].handleContact(this.people[n], this.timestep);
                }
            }
        }
        this.timestep += 1;
    }

    handleQuarantineOverlap() {
        let Q = this.people.filter(p => p.quarantined);

        // For every person...
        for (let i = 0 ; i < this.people.length; i++) {
            // If they are not quarantined...
            if (!this.people[i].quarantined) {
                // Get the distance between them and each of the quarantined people...
                let k = 0;
                while (k < Q.length) {
                    // If the distance is less than the quarantine radius then break early,
                    // and find them a new position;
                    let d = this.people[i].distanceBetween(Q[k]);
                    if (d < this.radius*this.contaminationFactor*3) {
                        k = 0;
                        this.people[i].initialiseMotion();
                    } else {
                        k++;
                    }
                }
            }
        }
    }

    draw({ status, position, quarantined }) {
        this.context.fillStyle =  status === STATUSES.sick ?
            COLOR.sick :
            status === STATUSES.dead  ?
                COLOR.dead :
                status === STATUSES.recovered ?
                    COLOR.recovered :
                    COLOR.healthy;
        this.context.beginPath();
        this.context.arc(position.x, position.y, this.radius, 0, PI2);
        this.context.fill();
        if (quarantined) {
            this.context.strokeStyle = "#FFFFFF";
            this.context.arc(position.x, position.y, this.radius*1.5, 0, PI2);
            this.context.stroke();
        }
    }
};