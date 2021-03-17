const DOT_SIZE = 20;
const DEAD_DOT_SIZE = 15;
const DOT_PADDING = 150;
const DOT_MOUSE_SENSITIVITY_RADIUS = (DOT_PADDING / 4);

import {P5, my_scale, bg_controller} from '../index';

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
        this.clicks_consumed = 0;
        this.alive = false;
        this.visible = visible;
        this.spring_size = new SpringDot(DEAD_DOT_SIZE);
    }

    static size() {
        return DOT_SIZE;
    }

    static mouseSensitivityRadius() {
        return DOT_MOUSE_SENSITIVITY_RADIUS;
    }
    
    static padding() {
        return DOT_PADDING;
    }

    #drawCircle() { //Yes, we draw 2 circles because its prettier, id care
        let size = this.spring_size.value;
        size = size*my_scale;

        if (this.alive) {
            P5.noStroke();
            P5.fill(255,30)
            P5.circle(this.x, this.y, 2*DOT_MOUSE_SENSITIVITY_RADIUS);

            P5.strokeWeight(1);
            P5.stroke(255, this.alpha-65/*190*/);
            P5.fill(bg_controller.bg_color);
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

    #drawConnsText() {
        if (this.alive) {
            let textC = this.clicks_consumed == 0 ? "" : this.clicks_consumed + "";

            P5.strokeWeight(0.5);
            P5.fill(255,200);
            P5.textAlign(P5.CENTER, P5.CENTER);
            P5.textSize(15);
            P5.text(textC, this.x, this.y+0.8);
            P5.strokeWeight(1);
        }
    }

    #update_stuff() {
        this.spring_size.update(this.alive ? DOT_SIZE : DEAD_DOT_SIZE);
    }

    vibrate() {
        this.spring_size.value = DOT_SIZE + 5;
    }

    update_and_draw() {
        if (this.visible) {
            this.#update_stuff();
            this.#drawCircle();
            this.#drawConnsText();
        }
    }
}