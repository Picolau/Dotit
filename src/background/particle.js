
import { P5 } from '../index'

const MAX_ALPHA = 160;
// this class describes the properties of a single particle.
export default class {
    // setting the co-ordinates, radius and the
    // speed of a particle in both the co-ordinates axes.
    constructor() {
        this.x = P5.random(0, P5.width);
        this.y = P5.random(0, P5.height);
        this.r = P5.random(2, 4);
        this.xSpeed = P5.random(-0.5, 0.5);
        this.ySpeed = P5.random(-0.5, 0.5);
    }

    // creation of a particle.
    createParticle() {
        P5.noStroke();
        P5.fill('rgba(250,250,255,0.5)');
        P5.circle(this.x, this.y, this.r);
    }

    // setting the particle in motion.
    moveParticle() {
        if (this.x < 0 || this.x > P5.windowWidth)
            this.xSpeed *= -1;
        if (this.y < 0 || this.y > P5.windowHeight)
            this.ySpeed *= -1;
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    // this function creates the connections(lines)
    // between particles which are less than a certain distance apart
    joinParticles(particles, totalParticles) {
        for (let i = 0; i < particles.length; i++) {
            let element = particles[i];
            if (element) {
                let dis = P5.dist(this.x, this.y, element.x, element.y);
                let maxDis = 150;
                if (dis < maxDis) {
                    P5.strokeWeight(1);
                    P5.stroke(P5.color(255, 255, 255, MAX_ALPHA * (1 - dis / maxDis)));
                    P5.line(this.x, this.y, element.x, element.y);
                }
            }
        }
        // for mouse interaction also
        /*
        let dis = P5.dist(this.x, this.y, P5.mouseX, P5.mouseY);
        let maxDis = 150;
        if (dis < maxDis) {
            P5.strokeWeight(1);
            P5.stroke(P5.color(255, 255, 255, MAX_ALPHA * (1 - dis / maxDis)));
            P5.line(this.x, this.y, P5.mouseX, P5.mouseY);
        }*/
    }
}

