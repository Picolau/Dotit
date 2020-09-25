const DOT_STATE = {
    ANIMATING_CONNECTION: {
        BEGIN: 'begin-animating-connection',
        END: 'end-animating-connection'
    },
    ANIMATING_MOUSE_CLOSE: 'animating-mouse-close',
    NOT_ANIMATING: 'still',
    OBEYING_EXTERNAL_COMMANDS: 'obeying-external-commands'
}

class Dot {
    #animating;
    #animationDirection;

    constructor(x, y, size, row=0, col=0, maxConns=0) {
        this.row = row;
        this.col = col;

        this.initX = x;
        this.initY = y;
        this.initAlpha = 150;
        this.initSize = size;

        this.x = x;
        this.y = y;
        this.alpha = 0;
        this.size = size;
        
        this.numConns = 0;
        this.maxConns = maxConns;

        this.#animating = false;
        this.#animationDirection = '';

        this.isLeading = false;
        this.state = DOT_STATE.OBEYING_EXTERNAL_COMMANDS;
    }

    draw() {
        if (this.#animating) {
            this.#updateAnimation();
        }
        
        stroke(255, 150);
        strokeWeight(1);
        fill(255, this.alpha);
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