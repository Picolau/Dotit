class BackgroundController {
    constructor(num_particles){
        this.particles = [];
        createCanvas(windowWidth, windowHeight);

        /* Control background particles */
        for(let i = 0;i<num_particles;i++){
            this.particles.push(new Particle());
        }

        this.bg_color = color(0,0,255); 
    }

    update_and_draw() {
        background(this.bg_color);
        this.darken_bg_color();

        for(let i = 0;i<this.particles.length;i++) {
            this.particles[i].createParticle();
            this.particles[i].moveParticle();
            this.particles[i].joinParticles(this.particles.slice(i));
        }
    }

    light_bg_color() {
        //this.bg_color.setGreen(min(100,this.bg_color._getGreen() + 20));
        //this.bg_color.setRed(min(150,this.bg_color._getRed() + 20));
        //this.bg_color.setBlue(max(155,this.bg_color._getBlue() - 20));
    }

    darken_bg_color() {
        //this.bg_color.setGreen(max(0,this.bg_color._getGreen() - 0.5));
        //this.bg_color.setRed(max(0,this.bg_color._getRed() - 0.5));
        //this.bg_color.setBlue(min(255,this.bg_color._getBlue() + 0.5));
    }
}