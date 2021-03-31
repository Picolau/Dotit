import { P5, globalEnv } from '../index';
const CONN_LOOSE_ALPHA = 255;
export default class {
    constructor(isPlayerConnection, dotBegin = null, dotEnd = null) {
        this.isPlayerConnection = isPlayerConnection;
        this.initAlpha = isPlayerConnection ? 255 : 102;
        this.alpha = this.initAlpha;
        this.connLooseAlpha = CONN_LOOSE_ALPHA;
        this.connectionString;

        if (dotBegin)
            this.begin(dotBegin);
        if (dotEnd)
            this.end(dotEnd);

        this.minX = 0; // because of menu
        this.minY = 50;
        this.maxX = 9999;
        this.maxY = P5.windowHeight - 50;

        this.fulfilled = false;
    }

    updateAndDraw() {
        if (/*!globalEnv.isDevice || this.dotEnd*/true) {
            if (P5.mouseX < this.maxX && P5.mouseX > this.minX && P5.mouseY < this.maxY && P5.mouseY > this.minY)
                this.connLooseAlpha = P5.min(CONN_LOOSE_ALPHA, this.connLooseAlpha + 10);
            else
                this.connLooseAlpha = P5.max(0, this.connLooseAlpha - 10);

            this.connectionString.color = this.isPlayerConnection ? (this.dotEnd ? P5.color(255, 255, 255, this.alpha) : P5.color(255, 255, 255, this.connLooseAlpha)) : P5.color(255, 255, 255, this.alpha);
            this.connectionString?.updateAndDraw();
        }
    }

    setBoundaries(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    begin(dotBegin) {
        this.dotBegin = dotBegin;
        this.connectionString = new ConnString(dotBegin);
    }

    end(dotEnd) {
        this.dotEnd = dotEnd;
        this.connectionString.tighten(dotEnd);
    }

    isEqual(other) {
        return (this.dotBegin.idx == other.dotBegin.idx && this.dotEnd.idx == other.dotEnd.idx) ||
            (this.dotBegin.idx == other.dotEnd.idx && this.dotEnd.idx == other.dotBegin.idx)
    }
}

/* CONN STRING */

const SPRING_MASS = 3.0;
const CONN_PARAMS = { GRAVITY: 9.0, DAMPING: 0.7, STIFFNESS: 0.21 };
const MAX_SPRINGS = 5;
const GRAVITY_MULTIPLIER = 6;

class ConnString {
    constructor(fixedPoint) {
        this.fixedPoint = fixedPoint;
        this.endPoint = null;

        this.gravityX = 0.0;
        this.gravityY = 0.0;
        this.gravity = CONN_PARAMS.GRAVITY;
        this.stiffness = CONN_PARAMS.STIFFNESS;
        this.damping = CONN_PARAMS.DAMPING;
        this.springs = []; // 0 loose spring;

        this.isLoose = true;
        this.color;

        this.#initSprings();
    }

    #initSprings() {
        for (let i = 0; i < MAX_SPRINGS; i++) {
            this.springs.push(new SpringString(this.fixedPoint.x, this.fixedPoint.y));
        }
    }

    #updateGravity() {
        let lastSpring = this.springs[this.springs.length - 1]; // acording to the last spring
        let dy = lastSpring.y - this.fixedPoint.y;
        let dx = lastSpring.x - this.fixedPoint.x;
        let mouseAngle = P5.atan2(dy, dx);

        this.gravity = this.isLoose ? P5.dist(lastSpring.x, lastSpring.y, this.fixedPoint.x, this.fixedPoint.y) / GRAVITY_MULTIPLIER : 0.0;
        this.gravityY = -this.gravity * P5.sin(mouseAngle);
        this.gravityX = -this.gravity * P5.cos(mouseAngle);
    }

    tighten(endPoint) {
        this.isLoose = false;
        this.endPoint = endPoint;
    }

    loose() {
        this.isLoose = true;
    }

    updateAndDraw() {
        P5.stroke(this.color);
        P5.strokeWeight(4);

        if (this.isLoose) {
            this.#updateGravity();

            for (let i = 0; i < this.springs.length; i++) {
                let spring = this.springs[i];
                let prev_spring = this.springs[i - 1];
                let target;
                let lineTo;

                if (i > 0) {
                    target = prev_spring;
                } else {
                    target = {
                        x: P5.mouseX,
                        y: P5.mouseY,
                    };
                }

                lineTo = target;
                spring.update(this, target.x, target.y);
                P5.line(spring.x, spring.y, lineTo.x, lineTo.y);
            }

            // draw last line (between fixed point and last spring)
            let lastSpring = this.springs[this.springs.length - 1];
            P5.line(this.fixedPoint.x, this.fixedPoint.y, lastSpring.x, lastSpring.y);
        } else {
            let lineTo = this.endPoint;

            if (!lineTo) {
                lineTo = { x: P5.mouseX, y: P5.mouseY };
            }

            P5.line(this.fixedPoint.x, this.fixedPoint.y, lineTo.x, lineTo.y);
        }
    }
}

class SpringString {
    constructor(initX, initY) {
        this.x = initX;
        this.y = initY;
        this.vx = 0.0;
        this.vy = 0.0;
    }

    update(cs, targetX, targetY) {
        let forceX = (targetX - this.x) * cs.stiffness;
        forceX += cs.gravityX;
        let forceY = (targetY - this.y) * cs.stiffness;
        forceY += cs.gravityY;
        let ax = forceX / SPRING_MASS;
        let ay = forceY / SPRING_MASS;
        this.vx = cs.damping * (this.vx + ax);
        this.vy = cs.damping * (this.vy + ay);
        this.x += this.vx;
        this.y += this.vy;
    }
}