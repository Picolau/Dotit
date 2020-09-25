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
    constructor(row, col, x, y) {
        this.row = row;
        this.col = col;

        this.initX = x;
        this.initY = y;
        this.initAlpha = 150;
        this.initSize = 12;

        this.x = width / 2;
        this.y = height / 2;
        this.alpha = 0;
        this.size = 0;
        
        this.numConns = 0;
        this.maxConns = 0;

        this.isLeading = false;
        this.state = DOT_STATE.OBEYING_EXTERNAL_COMMANDS;
    }

    draw() {
        /* There are still connections to be made with this particular dot, it moves freely */
        if (this.state == DOT_STATE.ANIMATING_MOUSE_CLOSE) { 
            let dis = dist(mouseX, mouseY, this.x, this.y);

            /* in radians */
            let mouseAngle = Math.atan2(mouseY - this.y, mouseX - this.x);

            let toX = this.initX;
            let toY = this.initY;

            let toSize = this.initSize;
            let toAlpha = this.isFullyConnected() ? 255 : this.initAlpha;

            if (dis < 45) {
                toX = this.initX + Math.cos(mouseAngle) * 5;
                toY = this.initY + Math.sin(mouseAngle) * 5;

                toSize = 13;
                toAlpha = 255;
            }

            this.x = lerp(this.x, toX, 0.25);
            this.y = lerp(this.y, toY, 0.25);
            this.size = lerp(this.size, toSize, 0.25);
            this.alpha = lerp(this.alpha, toAlpha, 0.25);
        } else if (this.state == DOT_STATE.ANIMATING_CONNECTION.BEGIN) {
            this.x = lerp(this.x, this.initX, 0.2);
            this.y = lerp(this.y, this.initY, 0.2);
            
            this.alpha = 255;
            let toSize = 23;
            this.size = lerp(this.size, toSize, 0.35);

            if (Math.abs(this.size - toSize) < 0.2) {
                this.state = DOT_STATE.ANIMATING_CONNECTION.END;
            }
        } else if (this.state == DOT_STATE.ANIMATING_CONNECTION.END) {
            this.x = lerp(this.x, this.initX, 0.2);
            this.y = lerp(this.y, this.initY, 0.2);
            
            this.alpha = 255;
            let toSize = this.initSize;
            this.size = lerp(this.size, toSize, 0.35);

            if (Math.abs(this.size - toSize) < 0.2) {
                if (this.isFullyConnected() || this.isLeading) {
                    this.state = DOT_STATE.NOT_ANIMATING;
                } else {
                    this.state = DOT_STATE.ANIMATING_MOUSE_CLOSE;
                }
            }
        } else if (this.state == DOT_STATE.NOT_ANIMATING) {
            this.x = this.initX;
            this.y = this.initY;
            this.size = this.initSize;
            this.alpha = this.isFullyConnected() ? 255: this.initAlpha;
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

    handleConnection() {
        if (!this.isFullyConnected() && !this.isLeading) {
            this.numConns += 1;
            this.state = DOT_STATE.ANIMATING_CONNECTION.BEGIN;
        }
    }

    setLeading(leading) {
        if (!leading) { // not leading anymore;
            if (!this.isFullyConnected())
                this.state = DOT_STATE.ANIMATING_MOUSE_CLOSE;
            else
                this.state = DOT_STATE.NOT_ANIMATING;
        }

        this.isLeading = leading;
    }

    isFullyConnected() {
        return this.numConns == this.maxConns;
    }

    static get MIN_CONNECTION_DIST() {
        return 17;
    }
}