import {P5} from '../index'

const Particle = require('./particle').default;

const NUM_PARTICLES = 100;
const DEFAULT_BACKGROUND_COLOR = '#2052c5';

export default class {
    constructor(){
        const canvasElt = P5.createCanvas(P5.windowWidth, P5.windowHeight).elt;
        canvasElt.style.width = '100%', canvasElt.style.height = '100%';

        /* Control background particles */
        this.particles = [];

        for(let i = 0;i<NUM_PARTICLES;i++){
            this.particles.push(new Particle());
        }

        let storageColor = localStorage.getItem('bgColor');
        this.bgColor = storageColor ? storageColor : DEFAULT_BACKGROUND_COLOR;
        
        this.timeElapsed = 0;
        this.framesCounter = 0;
        this.fps = 0;
        this.maxParticles = NUM_PARTICLES;
    }

    #updateFPS() {
        this.timeElapsed += P5.deltaTime;
        this.framesCounter += 1;

        if (this.timeElapsed >= 2000) {
            this.fps = this.framesCounter / 2;
            this.timeElapsed = 0;
            this.framesCounter = 0;
            return true;
        }

        return false;
    }

    #updateNumParticles() {
        if (this.fps < 50) {
            let newParticlesLength = Math.floor(this.particles.length*0.75);
            this.particles.length = newParticlesLength;
        }
    }

    updateAndDraw() {
        P5.background(this.bgColor);

        if (this.#updateFPS())
            this.#updateNumParticles();

        for(let i = 0;i < this.particles.length;i++) {
            if (this.particles[i]) {
                this.particles[i].createParticle();
                this.particles[i].moveParticle();
                this.particles[i].joinParticles(this.particles.slice(i), this.particles.length);
            }
        }
    }

    changeBackgroundColor(colorValue) {
        this.bgColor = P5.color(colorValue);
        localStorage.setItem('bgColor', colorValue);
    }

    handleResize() {
        this.timeElapsed = 0;
    }
}