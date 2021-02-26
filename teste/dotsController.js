const LEVEL_STATE = {
    PLAYING: 'playing',
    LOADING: 'loading',
    SHOWING_ERROR: 'showing_error',
    SHOWING_SUCCESS: 'showing_success'
}

const DOTS_PADDING = 150;
const DOT_MOUSE_SENSITIVITY_RADIUS = (DOTS_PADDING / 4);

class DotsController {

    /* PRIVATE METHODS */
    #toIdx(pos) {
        return pos.row * this.cols + pos.col;
    }

    #toPos(idx) {
        let pos = {
            row: floor(idx / this.cols),
            col: idx % this.cols
        }

        return pos;
    }

    #init_dots() {
        let dots = [];

        let dotsContainerSize = {
            width: (this.cols - 1)*(DOTS_PADDING),
            height: (this.rows - 1)*(DOTS_PADDING),
        };

        let horizontalMargin = (windowWidth - dotsContainerSize.width) / 2;
        let verticalMargin = (windowHeight - dotsContainerSize.height) / 2;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let dotX = horizontalMargin + col*DOTS_PADDING;
                let dotY = verticalMargin + row*DOTS_PADDING;

                dots.push(new Dot(row * this.cols + col, dotX, dotY));
            }
        }

        return dots;
    }

    #isMouseCloseTo(dot) {
        return dist(dot.x, dot.y, mouseX, mouseY) <= DOT_MOUSE_SENSITIVITY_RADIUS;
    }

    #canConnect(dot) {
        return this.leadingDot != dot;
    }

    // return all dots indexes between dot_begin and dot_end not including them;
    #getDotsIdxBetween(dot_begin, dot_end) {
        let dots_between = [];

        let begin = this.#toPos(dot_begin.idx);
        let end = this.#toPos(dot_end.idx);

        let delta = {
            row: end.row - begin.row,
            col: end.col - begin.col
        }
        
        let step = { 
            row: delta.row, 
            col: delta.col 
        };
        
        if (delta.row == 0) {
            step.col = delta.col > 0 ? 1 : -1;
        } else if (delta.col == 0) {
            step.row = delta.row > 0 ? 1 : -1;
        } else if (Math.abs(delta.row) < Math.abs(delta.col) && Math.abs(delta.col) % Math.abs(delta.row) == 0) {
            step.row = delta.row > 0 ? 1 : -1;
            let m = Math.abs(delta.col / delta.row); 
            step.col = delta.col > 0 ? m : -m;
        } else if (Math.abs(delta.col) <= Math.abs(delta.row) && delta.row % delta.col == 0) {
            step.col = delta.col > 0 ? 1 : -1;
            let m = Math.abs(delta.row / delta.col); 
            step.row = delta.row > 0 ? m : -m;
        }

        let stepIdx = this.#toIdx(step);
        let posIdx = dot_begin.idx;
        let endIdx = dot_end.idx;

        while (posIdx != endIdx) {
            let nextIdx = posIdx + stepIdx;

            dots_between.push(nextIdx);

            posIdx = nextIdx;
        }

        return dots_between;
    }

    #makeConnection(dot) {
        this.current_connection?.end(dot);
        this.current_connection = new Connection(true);
        this.current_connection.begin(dot);
        this.player_connections.push(this.current_connection);

        if (this.leadingDot) {
            let dotsIdxBetween = this.#getDotsIdxBetween(this.leadingDot, dot);

            for (let i = 0;i < dotsIdxBetween.length;i++) {
                let dotIdx = dotsIdxBetween[i];
                let dotBetween = this.dots[dotIdx];
                dotBetween.alive = true;
                dotBetween.vibrate();
            }
        }

        this.leadingDot = dot;
    }

    #update_and_draw_dots() {
        for (let i = 0;i < this.rows*this.cols; i++) {
            let dot = this.dots[i];

            if (this.#isMouseCloseTo(dot) && this.#canConnect(dot)) {
                let force_connection = mouseIsPressed;
                if (force_connection && dot.alive) {
                    dot.will_consume += 1;
                    dot.vibrate();
                    this.#makeConnection(dot);
                } else {
                    if (!dot.alive) {
                        this.#makeConnection(dot);
                        dot.alive = true;
                    }
                }
            }

            dot.update_and_draw();
        }
    }

    #update_and_draw_connections() {
        // player conn strings
        for(let i = 0;i < this.player_connections.length;i++) {
            this.player_connections[i].update_and_draw();
        }
    }

    /** PUBLIC METHODS */

    constructor(levelObj) {
        if (levelObj)
            this.load(levelObj);
    }

    load(levelObj) {
        this.rows = levelObj.rows;
        this.cols = levelObj.cols;

        this.dots = this.#init_dots();
        this.player_connections = [];
        this.current_connection = null;

        this.leadingDot = null;
    }

    update_and_draw() {
        this.#update_and_draw_connections();
        this.#update_and_draw_dots();
    }
}