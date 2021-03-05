const DOT_SIZE = 20;
const DEAD_DOT_SIZE = 15;

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
        
        this.animating = abs(this.value - target) >= 0.04;
    }
}

class Dot {
    constructor(idx, x, y, visible=false) {
        this.idx = idx;
        this.x = x;
        this.y = y;
        this.initX = x;
        this.initY = y;
        this.initAlpha = 230;
        this.alpha = this.initAlpha;
        this.clicks_consumed = 0;
        this.alive = false;
        this.visible = visible;
        this.spring_size = new SpringDot(DEAD_DOT_SIZE);
    }

    #drawCircle() { //Yes, we draw 2 circles because its prettier, id care
        let size = this.spring_size.value;

        if (this.alive) {
            noStroke();
            fill(255,30)
            circle(this.x, this.y, 2*DOT_MOUSE_SENSITIVITY_RADIUS);

            strokeWeight(1);
            stroke(255, 190);
            fill(BACKGROUND_COLOR);
            circle(this.x, this.y, size);

            stroke(255, 150);
            noFill()
            circle(this.x, this.y, size);
        } else {
            strokeWeight(1);
            stroke(255, 190);
            fill(255,255,255,this.alpha);
            circle(this.x, this.y, size);

            stroke(255, 150);
            noFill()
            circle(this.x, this.y, size);
        }
    }

    #drawConnsText() {
        if (this.alive) {
            let textC = this.clicks_consumed == 0 ? "" : this.clicks_consumed + "";

            strokeWeight(0.5);
            fill(255,200);
            textAlign(CENTER, CENTER);
            textSize(15);
            text(textC, this.x, this.y+0.8);
            strokeWeight(1);
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