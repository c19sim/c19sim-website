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
        if (person.dead) dead++;else
        if (person.recovered) recovered++;else
        if (person.sick) sick++;else
        healthy++;
      });
      const total = dead + recovered + healthy + sick;
  
      const recoveredH = recovered / total * this.height;
      const healthyH = healthy / total * this.height;
      const sickH = sick / total * this.height;
      const deadH = dead / total * this.height;
  
      this.$recovered.innerText = recovered;
      this.$healthy.innerText = healthy;
      this.$sick.innerText = sick;
      this.$dead.innerText = dead;
  
      this.context.strokeStyle = COLOR.recovered;
      this.context.beginPath();
      this.context.moveTo(this.x, 0);
      this.context.lineTo(this.x, recoveredH);
      this.context.stroke();
  
      this.context.strokeStyle = COLOR.healthy;
      this.context.beginPath();
      this.context.moveTo(this.x, recoveredH);
      this.context.lineTo(this.x, recoveredH + healthyH);
      this.context.stroke();
  
      this.context.strokeStyle = COLOR.sick;
      this.context.beginPath();
      this.context.moveTo(this.x, recoveredH + healthyH);
      this.context.lineTo(this.x, recoveredH + healthyH + sickH);
      this.context.stroke();
  
      this.context.strokeStyle = COLOR.dead;
      this.context.beginPath();
      this.context.moveTo(this.x, recoveredH + healthyH + sickH);
      this.context.lineTo(this.x, recoveredH + healthyH + sickH + deadH);
      this.context.stroke();
  
      this.x++;
  
      if (this.x >= this.width) this.done = true;
    }
  };