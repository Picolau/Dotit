const DOT_STATE = {
    REACTING_MOUSE_CLOSE: 'reacting-mouse-close',
    STILL: 'still'
}

class Dot {
    #animating;
    #animationDirection;

    constructor(x, y, size, row=0, col=0, maxConns=0) {
        this.row = row;
        this.col = col;

        this.initX = x;
        this.initY = y;
        this.initAlpha = 50;
        this.initSize = size;

        this.x = x;
        this.y = y;
        this.alpha = 0;
        this.size = 20;
        
        this.numConns = 0;
        this.maxConns = maxConns;

        this.#animating = false;
        this.#animationDirection = '';

        this.isLeading = false;
        this.state = DOT_STATE.STILL;
    }

    resetPosAndSize() {
        this.x = this.initX;
        this.y = this.initY;
        this.size = this.initSize;
        this.alpha = this.initAlpha;
        this.state = DOT_STATE.STILL;
    }

    draw() {
        if (this.#animating) {
            this.#updateAnimation();
        }
        
        stroke(255, 190);
        strokeWeight(1);

        if (this.isFullyConnected())
            this.alpha = 255;

        fill(255, this.alpha);
        circle(this.x, this.y, this.size);
        noFill();
        stroke(255, 150);
        circle(this.x, this.y, this.size);

        noFill();
        let leftConns = this.maxConns - this.numConns - 1;
        for (let i = 0; i < leftConns; i++) {
            circle(this.x, this.y, this.size + 5*(i+1));
        }
    }

    animateExpand() {
        this.#animating = true;
        this.#animationDirection = 'expanding';
    }

    #updateAnimation() {
        let toSize = this.#animationDirection == 'expanding' ? 23 : this.initSize;
        
        this.size = lerp(this.size, toSize, 0.35);

        if (Math.abs(this.size - toSize) < 0.2) {
            if (this.#animationDirection == 'expanding') { // has to shrink yet in animation
                this.#animating = true;
                this.#animationDirection = 'shrinking';
            } else if (this.#animationDirection == 'shrinking') { // animation is over
                this.#animating = false;
                this.#animationDirection = '';
            }
        }
    }

    isFullyConnected() {
        return this.numConns == this.maxConns;
    }
}