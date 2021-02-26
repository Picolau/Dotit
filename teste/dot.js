const DOT_SIZE = 20;

class SpringDot {
    constructor(value) {
        this.value = value;
        this.vel = 0.0;
        this.damping = 0.9;
        this.animating = true;
    }

    update(target) {
        let force = (target - this.value);
        let a = force / 2;
        this.vel = this.damping * (this.vel + a);
        this.value += this.vel;
        
        this.animating = abs(this.value - target) >= 0.04;
    }
}

class Dot {
    constructor(idx, x, y) {
        this.idx = idx;
        this.x = x;
        this.y = y;
        this.will_consume = 0;

        this.spring_size = new SpringDot(DOT_SIZE);
    }

    #drawCircle() { //Yes, we draw 2 circles because its prettier, id care;
        strokeWeight(1);
        stroke(255, 190);
        fill(BACKGROUND_COLOR);
        circle(this.x, this.y, this.spring_size.value);

        stroke(255, 150);
        noFill()
        circle(this.x, this.y, this.spring_size.value);

        noStroke();
        fill(255,30)
        circle(this.x, this.y, 2*DOT_MOUSE_SENSITIVITY_RADIUS);
    }

    #drawConnsText() {
        let textC = this.will_consume == 0 ? "" : this.will_consume + "";

        strokeWeight(0.5);
        fill(255,200);
        textAlign(CENTER, CENTER);
        textSize(15);
        text(textC, this.x, this.y+0.8);
        strokeWeight(1);
    }

    #update_stuff() {
        this.spring_size.update(DOT_SIZE);
    }

    #vibrate() {
        this.spring_size.vel = 7;
    }

    update_and_draw() {
        this.#update_stuff();
        this.#drawCircle();
        this.#drawConnsText();
    }

    handleConnection(isDirectConnection) {
        if (!isDirectConnection) {
            this.will_consume += 1;
        } else if (this.will_consume == 0) {
            this.will_consume = 1;
        }

        this.#vibrate();
    }

    consume() {
        let w_consume = this.will_consume;
        this.will_consume = 1;
        return w_consume;
    }
}