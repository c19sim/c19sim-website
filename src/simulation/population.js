class Population {
    constructor(size, quarantineRate, patientZeroes, hygieneLevel, contaminationFactor = 2) {
        this.people = new Array(size);
        this.canvas = document.getElementById("population");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.hygienePenalty = 1 - hygieneLevel * 0.8;
        this.radius = size < 250 ? 12 : size < 500 ? 8 : 5;
        this.quarantineRadius = this.radius;
        this.timestep = 0;
        this.contaminationFactor = contaminationFactor;
        for (let i = 0; i < size; i++) {
            const sick = i > size - patientZeroes - 1;
            const quarantined = i / size <= quarantineRate;
            const vulnerable = Math.random() < 0.01;
            this.people[i] = new Person(
                i,
                this.radius,
                this.width,
                this.height,
                sick,
                quarantined,
                vulnerable,
                this.contaminationFactor,
                this.hygienePenalty);
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
            this.context.arc(position.x, position.y, this.quarantineRadius*1.5, 0, PI2);
            this.context.stroke();
        }
    }
};