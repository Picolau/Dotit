
import {P5} from '../index'
// this class describes the properties of a single particle.
export default class {
// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
    constructor(){
        this.x = P5.random(0,P5.width);
        this.y = P5.random(0,P5.height);
        this.r = P5.random(2,6);
        this.xSpeed = P5.random(-0.5,0.5);
        this.ySpeed = P5.random(-0.5,0.5);
    }

// creation of a particle.
    createParticle() {
        P5.noStroke();
        P5.fill('rgba(250,250,255,0.5)');
        P5.circle(this.x,this.y,this.r);
    }

// setting the particle in motion.
    moveParticle() {
        if(this.x < 0 || this.x > P5.width)
            this.xSpeed*=-1;
        if(this.y < 0 || this.y > P5.height)
            this.ySpeed*=-1;
        this.x+=this.xSpeed;
        this.y+=this.ySpeed;
    }

// this function creates the connections(lines)
// between particles which are less than a certain distance apart
    joinParticles(particles) {
        particles.forEach(element =>{
            let dis = P5.dist(this.x,this.y,element.x,element.y);
            if (dis < 150) {
                P5.strokeWeight(1);
                P5.stroke(P5.color(255,255,255,150*(1 - dis/150)));
                P5.line(this.x,this.y,element.x,element.y);
            }
        });
    }
}

    