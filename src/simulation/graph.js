class Graph {
    constructor(population) {
        this.population = population;
        this.canvas = document.getElementById("graph");
        this.context = this.canvas.getContext("2d");
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.$recovered = document.getElementById("recovered");
        this.$healthy = document.getElementById("healthy");
        this.$sick = document.getElementById("sick");
        this.$dead = document.getElementById("dead");
        this.$recovered.style.color = COLOR.recovered;
        this.$healthy.style.color = COLOR.healthy;
        this.$sick.style.color = COLOR.sick;
        this.reset();
    }

    reset() {
        this.x = 0;
        this.done = false;
    }

    tick() {
        let recovered = 0;
        let healthy = 0;
        let sick = 0;
        let dead = 0;
        this.population.people.forEach(person => {
            if (statuses.DEAD === person.status) dead++; else
                if (person.status === statuses.RECOVERED) recovered++; else
                    if (person.status === statuses.SICK) sick++; else
                        healthy++;
        });

        // let recovered = this.population.people.filter((x) => { return x.recovered; }).length;
        // let healthy = this.population.people.filter((x) => { return x.healthy; }).length;
        // let sick = this.population.people.filter((x) => { return x.sick; }).length;
        // let dead = this.population.people.filter((x) => { return x.dead; }).length;

        const total = dead + recovered + healthy + sick;

        const recoveredH = recovered / total * this.height;
        const healthyH = healthy / total * this.height;
        const sickH = sick / total * this.height;
        const deadH = dead / total * this.height;

        this.$recovered.innerText = recovered;
        this.$healthy.innerText = healthy;
        this.$sick.innerText = sick;
        this.$dead.innerText = dead;

        const drawData = [
            { color: COLOR.recovered, count: recoveredH },
            { color: COLOR.healthy, count: healthyH },
            { color: COLOR.sick, count: sickH },
            { color: COLOR.dead, count: deadH },
        ];

        this.drawTimestep(drawData);

        this.x++;

        if (this.x >= this.width) this.done = true;
    }

    drawTimestep(drawData) {
        let y0 = 0;
        let y1 = 0;
        drawData.forEach(timestep => {
            this.context.strokeStyle = timestep.color;
            y1 = y0 + timestep.count;
            this.context.beginPath();
            this.context.moveTo(this.x, y0);
            this.context.lineTo(this.x, y1);
            this.context.stroke();
            y0 = y1;
        });
    }
};