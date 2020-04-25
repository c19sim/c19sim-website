class Population {
    constructor(size, quarantineRate, patientZeroes, contaminationFactor = 2) {
        this.people = new Array(size);
        this.canvas = document.getElementById("population");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.radius = size < 250 ? 12 : size < 500 ? 8 : 5;
        for (let i = 0; i < size; i++) {
            const sick = i > size - patientZeroes - 1;
            const quarantined = i / size <= quarantineRate;
            const vulnerable = Math.random() < 0.01;
            this.people.push(
                new Person(
                    i,
                    this.radius,
                    this.width,
                    this.height,
                    sick,
                    quarantined,
                    vulnerable,
                    contaminationFactor));
        }
    }

    tick() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.people.forEach(p => {
            this.draw(p);
            p.tick(this.people);
        });
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