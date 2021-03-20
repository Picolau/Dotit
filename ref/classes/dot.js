const DOT_RADIUS_DEVICE = 16;
const DOT_RADIUS_NOT_DEVICE = 20;

import {P5, backgroundController, globalEnv} from '../index';

class SpringDot {
    constructor(value) {
        this.value = value;
        this.vel = 0.0;
        this.damping = 0.9;
        this.stiffness = 0.8;
        this.animating = true;
    }

    update(target) {
        let force = (target - this.value) * this.stiffness;
        let a = force / 2;
        this.vel = this.damping * (this.vel + a);
        this.value += this.vel;
        
        this.animating = P5.abs(this.value - target) >= 0.04;
    }
}

export default class {
    constructor(idx, x, y, visible=false) {
        this.idx = idx;
        this.x = x;
        this.y = y;
        this.initX = x;
        this.initY = y;
        this.initAlpha = 250;
        this.alpha = this.initAlpha;
        this.clicksConsumed = 0;
        this.alive = false;
        this.visible = visible;

        this.sizeAlive = globalEnv.isDevice ? DOT_RADIUS_DEVICE : DOT_RADIUS_NOT_DEVICE;
        this.sizeNotAlive = this.sizeAlive * 0.75;
        this.mouseSensitivyRadius = this.sizeAlive * 1.5;
        this.springLength = new SpringDot(this.sizeNotAlive);
    }

    isMouseClose() {
        return P5.dist(P5.mouseX, P5.mouseY, this.x, this.y) < this.mouseSensitivyRadius;
    }

    vibrate() {
        this.springLength.value = this.sizeAlive + 5;
    }

    updateAndDraw() {
        if (this.visible) {
            this.#updateSpringLength();
            this.#drawCircle();
            this.#drawClicksConsumedText();
        }
    }

    #updateSpringLength() {
        this.springLength.update(this.alive ? this.sizeAlive : this.sizeNotAlive);
    }

    #drawCircle() { //Yes, we draw 2 circles because its prettier, id care
        let size = this.springLength.value;

        if (this.alive) {
            P5.noStroke();
            P5.fill(255,30)
            P5.circle(this.x, this.y, 2*this.mouseSensitivyRadius);

            P5.strokeWeight(1);
            P5.stroke(255, this.alpha-65/*190*/);
            P5.fill(backgroundController.bgColor);
            P5.circle(this.x, this.y, size);

            P5.stroke(255, this.alpha-105/*150*/);
            P5.noFill()
            P5.circle(this.x, this.y, size);
        } else {
            P5.strokeWeight(1);
            P5.stroke(255, this.alpha-65/*190*/);
            P5.fill(255,255,255,this.alpha);
            P5.circle(this.x, this.y, size);

            P5.stroke(255, this.alpha-105/*150*/);
            P5.noFill()
            P5.circle(this.x, this.y, size);
        }
    }

    #drawClicksConsumedText() {
        if (this.alive) {
            let textC = this.clicksConsumed == 0 ? "" : this.clicksConsumed + "";

            P5.strokeWeight(0.5);
            P5.fill(255,200);
            P5.textAlign(P5.CENTER, P5.CENTER);
            P5.textSize(15);
            P5.text(textC, this.x, this.y+0.8);
            P5.strokeWeight(1);
        }
    }

    

}