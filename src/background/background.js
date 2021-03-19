import {P5} from '../index'

const Particle = require('./particle').default;
const NUM_PARTICLES = 100;

export default class {
    constructor(){
        this.particles = [];

        const canvasElt = P5.createCanvas(P5.windowWidth, P5.windowHeight).elt;
        canvasElt.style.width = '100%', canvasElt.style.height = '100%';

        /* Control background particles */
        for(let i = 0;i<NUM_PARTICLES;i++){
            this.particles.push(new Particle());
        }

        let storageColor = localStorage.getItem('bgColor');
        this.bg_color = P5.color(storageColor ? storageColor : 'rgb(20,20,170)');
        
        this.timeElapsed = 0;
        this.framesCounter = 0;
        this.fps = 0;
        this.maxParticles = NUM_PARTICLES;
    }

    #update_fps() {
        this.timeElapsed += P5.deltaTime;
        this.framesCounter += 1;

        if (this.timeElapsed >= 1000) {
            this.fps = this.framesCounter;
            this.timeElapsed = 0;
            this.framesCounter = 0;
            return true;
        }

        return false;
    }

    #update_num_particles() {
        if (this.fps < 50) {
            let newParticlesLength = Math.floor(this.particles.length*0.75);
            this.particles.length = newParticlesLength;
        }
    }

    update_and_draw() {
        P5.background(this.bg_color);

        if (this.#update_fps())
            this.#update_num_particles();

        for(let i = 0;i < this.particles.length;i++) {
            if (this.particles[i]) {
                this.particles[i].createParticle();
                this.particles[i].moveParticle();
                this.particles[i].joinParticles(this.particles.slice(i), this.particles.length);
            }
        }
    }

    changeBackgroundColor(color_value) {
        this.bg_color = P5.color(color_value);
        localStorage.setItem('bgColor', color_value);
    }
}