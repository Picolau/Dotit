import {P5} from '../index'

const Particle = require('./particle').default;


export default class {
    constructor(num_particles){
        this.particles = [];
        P5.createCanvas(P5.windowWidth, P5.windowHeight);

        /* Control background particles */
        for(let i = 0;i<num_particles;i++){
            this.particles.push(new Particle());
        }

        let storageColor = localStorage.getItem('bgColor');
        this.bg_color = P5.color(storageColor ? storageColor : 'rgb(20,20,170)');
    }

    update_and_draw() {
        P5.background(this.bg_color);

        for(let i = 0;i<this.particles.length;i++) {
            this.particles[i].createParticle();
            this.particles[i].moveParticle();
            this.particles[i].joinParticles(this.particles.slice(i));
        }
    }

    changeBackgroundColor(color_value) {
        this.bg_color = P5.color(color_value);
        localStorage.setItem('bgColor', color_value);
    }
}