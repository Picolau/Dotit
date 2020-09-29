class BackgroundController {
    constructor(num_particles){
        this.particles = [];

        createCanvas(windowWidth, windowHeight, WEBGL);

        /* Control background particles */
        for(let i = 0;i<num_particles;i++){
            this.particles.push(new Particle());
        }
    }

    draw() {
        background('rgba(0,100,255,0.7)');

        /*for(let i = 0;i<this.particles.length;i++) {
            this.particles[i].createParticle();
            this.particles[i].moveParticle();
            this.particles[i].joinParticles(this.particles.slice(i));
        }*/
    }
}