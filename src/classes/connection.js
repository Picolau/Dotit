import {P5} from '../index';

export default class {
    constructor(is_player_conn, dot_begin=null, dot_end=null) {
        this.is_player_conn = is_player_conn;
        this.initAlpha = is_player_conn ? 255 : 102;
        this.alpha = this.initAlpha;
        this.conn_loose_alpha = 153;
        this.conn_string;

        if (dot_begin)
            this.begin(dot_begin);
        if (dot_end)
            this.end(dot_end);
        
        this.minX=70; // because of menu
        this.minY=0;
        this.maxX=9999;
        this.maxY=9999;

        this.fulfilled = false;
    }

    update_and_draw() {
        if (P5.mouseX < this.maxX && P5.mouseX > this.minX && P5.mouseY < this.maxY && P5.mouseY > this.minY)
            this.conn_loose_alpha = P5.min(153, this.conn_loose_alpha + 10);  
        else
            this.conn_loose_alpha = P5.max(0, this.conn_loose_alpha - 10);  

        this.conn_string.color = this.is_player_conn ? (this.dot_end ? P5.color(255,255,255,this.alpha) : P5.color(255,255,255,this.conn_loose_alpha)) : P5.color(255,255,255,this.alpha);
        this.conn_string?.update_and_draw();
    }

    set_boundaries(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    begin(dot_begin) {
        this.dot_begin = dot_begin;
        this.conn_string = new ConnString(dot_begin);
    }

    end(dot_end) {
        this.dot_end = dot_end;
        this.conn_string.tighten(dot_end);
    }

    is_equal(other) {
        return (this.dot_begin.idx == other.dot_begin.idx && this.dot_end.idx == other.dot_end.idx) ||
        (this.dot_begin.idx == other.dot_end.idx && this.dot_end.idx == other.dot_begin.idx)
    }
}

/* CONN STRING */

const SPRING_MASS = 3.0;
const CONN_PARAMS = {GRAVITY: 9.0, DAMPING: 0.7, STIFFNESS: 0.21, 
    TIGHT_DAMPING: 0.8, TIGHT_STIFFNESS: 0.3};
const MAX_SPRINGS = 5;
const GRAVITY_MULTIPLIER = 6;

class ConnString {
    constructor(fixed_point) {
        this.begin_dot = fixed_point;
        this.end_dot = null;

        this.gravityX = 0.0;
        this.gravityY = 0.0;
        this.gravity = CONN_PARAMS.GRAVITY;
        this.stiffness = CONN_PARAMS.STIFFNESS;
        this.damping = CONN_PARAMS.DAMPING;
        this.springs = []; // 0 loose spring;

        this.is_loose = true;
        this.animating_springs = true;
        this.color;

        this.#init_springs();
    }

    #init_springs() {
        for (let i = 0;i < MAX_SPRINGS;i++) {
            this.springs.push(new SpringString(this.begin_dot.x, this.begin_dot.y));
        }
    }

    #update_gravity() {
        let last_spring  = this.springs[this.springs.length-1]; // acording to the last spring
        let dy = last_spring.y - this.begin_dot.y;
        let dx = last_spring.x - this.begin_dot.x;
        let mouseAngle = P5.atan2(dy, dx);

        this.gravity = this.is_loose ? P5.dist(last_spring.x, last_spring.y, this.begin_dot.x, this.begin_dot.y)/GRAVITY_MULTIPLIER : 0.0;
        this.gravityY = -this.gravity*P5.sin(mouseAngle);
        this.gravityX = -this.gravity*P5.cos(mouseAngle);
    }

    #update_damping_stiffness() {
        this.damping = this.is_loose ? CONN_PARAMS.DAMPING : CONN_PARAMS.TIGHT_DAMPING;
        this.stiffness = this.is_loose ? CONN_PARAMS.STIFFNESS : CONN_PARAMS.TIGHT_STIFFNESS;
    }

    tighten(tight_point) {
        this.animating_springs = false;
        this.is_loose = false;
        this.end_dot = tight_point;

        this.#update_damping_stiffness();
    }

    loose() {
        this.is_loose = true;

        this.#update_damping_stiffness();
    }

    vibrate() {
        this.animating_springs = true;

        let dy = this.end_dot.y - this.begin_dot.y;
        let dx = this.end_dot.x - this.begin_dot.x;
        let cos_p = dy / 30;
        let sin_p = -dx / 30;

        let h = floor(MAX_SPRINGS/2);
        for (let i = 0;i < MAX_SPRINGS;i++) {
            let spring = this.springs[i];
            spring.vx = ((h-P5.abs(h-i))*cos_p)/5 + cos_p;
            spring.vy = ((h-P5.abs(h-i))*sin_p)/5 + sin_p;
        }
    }

    update_and_draw() {
        P5.stroke(this.color); 
        P5.strokeWeight(4);
        
        if (this.animating_springs) {
            this.animating_springs = false;
            this.#update_gravity();

            for (let i = 0;i < this.springs.length;i++) {
                let spring = this.springs[i];
                let prev_spring = this.springs[i-1];
                let target;
                let line_to;
                
                if (this.is_loose) {
                    if (i > 0) {
                        target = prev_spring;
                        line_to = prev_spring;
                    } else {
                        target = {
                            x: P5.mouseX, 
                            y: P5.mouseY, 
                        };
                        line_to = target;
                    }
                } else {
                    target = this.#linePointTarget(i,this.end_dot.x,this.end_dot.y,this.begin_dot.x,this.begin_dot.y);
                    line_to = i > 0 ? prev_spring : this.end_dot;
                }

                spring.update(this, target.x, target.y);
                P5.line(spring.x, spring.y, line_to.x, line_to.y);

                if (spring.animating || this.is_loose) {
                    this.animating_springs = true;
                }
            }
            
            // draw last line (between fixed point and last spring)
            let last_spring  = this.springs[this.springs.length-1];
            P5.line(this.begin_dot.x, this.begin_dot.y, last_spring.x, last_spring.y);
        } else {
            let line_to = this.end_dot;

            if (!line_to) {
                line_to = {x: P5.mouseX, y: P5.mouseY};
            }

            P5.line(this.begin_dot.x, this.begin_dot.y, line_to.x, line_to.y);
        }
    }

    #linePointTarget(idx, x1, y1, x2, y2) {
        let dx = (x2-x1) / (MAX_SPRINGS + 1);
        let dy = (y2-y1) / (MAX_SPRINGS + 1);
        
        let xx = x1 + dx*(idx+1);
        let yy = y1 + dy*(idx+1);
        
        return {x: xx, y: yy};
    }
}

class SpringString {
    constructor(initX, initY) {
        this.x = initX;
        this.y = initY;
        this.vx = 0.0;
        this.vy = 0.0;
        this.animating = true;
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

        this.animating = P5.dist(this.x, this.y, targetX, targetY) >= 0.04;
    }
}