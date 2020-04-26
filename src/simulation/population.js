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
        this.icuQuantity = Math.floor(icuPercentage * size);
        this.tests = tests;
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
                contaminationFactor,
                this.hygienePenalty,
                this.icuQuantity,
                this.filledICUs,
                this.headerContext,
                this.tests);
        }
    }

    tick() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.people.forEach(p => {
            this.draw(p);
            p.tick(this.people);
        });
        for (let i = 0; i < this.people.length; i++) {
            for (let n = i + 1; n < this.people.length; n++) {
                if(this.people[i] !== null && this.people[n] !== null){
                    this.people[i].handleContact(this.people[n]);
                }
            }
        }
    }

    draw({ status, position }) {
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
    }
};