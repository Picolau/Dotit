const DRAW_STATE = {
    ANIMATING_CONNECTION: {
        BEGIN: 'begin-animating-connection',
        END: 'end-animating-connection'
    },
    ANIMATING_MOUSE_CLOSE: 'normal-interacion',
    NOT_ANIMATING: 'still'
}

class Dot {
    constructor(row, col, x, y, maxConns) {
        this.row = row;
        this.col = col;

        this.initX = x;
        this.initY = y;
        this.initAlpha = 150;
        this.initSize = 10;

        this.x = this.initX;
        this.y = this.initY;
        this.alpha = this.initAlpha;
        this.size = this.initSize;
        
        this.numConns = 0;
        this.maxConns = maxConns;

        this.isLeading = false;
        this.drawState = DRAW_STATE.ANIMATING_MOUSE_CLOSE;
    }

    draw() {
        /* There are still connections to be made with this particular dot, it moves freely */
        if (this.drawState == DRAW_STATE.ANIMATING_MOUSE_CLOSE) { 
            let dis = dist(mouseX, mouseY, this.x, this.y);

            /* in radians */
            let mouseAngle = Math.atan2(mouseY - this.y, mouseX - this.x);

            let toX = this.initX;
            let toY = this.initY;

            let toSize = this.initSize;
            let toAlpha = this.numConns > 0 ? 255 : this.initAlpha;

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
        } else if (this.drawState == DRAW_STATE.ANIMATING_CONNECTION.BEGIN) {
            this.x = lerp(this.x, this.initX, 0.2);
            this.y = lerp(this.y, this.initY, 0.2);
            
            this.alpha = 255;
            let toSize = 23;
            this.size = lerp(this.size, toSize, 0.35);

            if (this.size >= toSize-1) {
                this.drawState = DRAW_STATE.ANIMATING_CONNECTION.END;
            }
        } else if (this.drawState == DRAW_STATE.ANIMATING_CONNECTION.END) {
            this.x = lerp(this.x, this.initX, 0.2);
            this.y = lerp(this.y, this.initY, 0.2);
            
            this.alpha = 255;
            let toSize = this.initSize;
            this.size = lerp(this.size, toSize, 0.35);

            if (this.size == toSize) {
                if (this.isFullyConnected() || this.isLeading) {
                    this.drawState = DRAW_STATE.NOT_ANIMATING;
                } else {
                    this.drawState = DRAW_STATE.ANIMATING_MOUSE_CLOSE;
                }
            }
        } else if (this.drawState == DRAW_STATE.NOT_ANIMATING) {
            this.x = this.initX;
            this.y = this.initY;
            this.size = this.initSize;
            this.alpha = 255;
        }
        
        stroke(255, 150);
        strokeWeight(1);
        fill(255, this.alpha);
        circle(this.x, this.y, this.size);
    }

    handleConnection() {
        if (!this.isFullyConnected()) {
            this.numConns += 1;
            this.drawState = DRAW_STATE.ANIMATING_CONNECTION.BEGIN;
        }
            
    }

    setLeading(leading) {
        if (!leading) { // not leading anymore;
            if (!this.isFullyConnected())
                this.drawState = DRAW_STATE.ANIMATING_MOUSE_CLOSE;
            else
                this.drawState = DRAW_STATE.NOT_ANIMATING;
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