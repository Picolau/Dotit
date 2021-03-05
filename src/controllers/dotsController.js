
const DOTS_MAX_ROWS = 5;
const DOTS_MAX_COLS = 8;
const DOTS_PADDING = 150;
const DOT_MOUSE_SENSITIVITY_RADIUS = (DOTS_PADDING / 4);

const STATE = {
    CREATING: 'creating',
    PLAYING: 'playing'
}

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

    #init_dots(visible=false) {
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

                dots.push(new Dot(row * this.cols + col, dotX, dotY, visible));
            }
        }

        return dots;
    }

    #isMouseCloseTo(dot) {
        return dist(dot.x, dot.y, mouseX, mouseY) <= DOT_MOUSE_SENSITIVITY_RADIUS;
    }

    #canConnect(dot) {
        return this.leading_dot != dot && dot.visible && !this.connections_ended_success;
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
        let posIdx = dot_begin.idx + stepIdx;
        let endIdx = dot_end.idx;

        while (posIdx != endIdx) {
            dots_between.push(posIdx);
            posIdx += stepIdx;
        }

        return dots_between;
    }

    #handle_success() {
        this.connections_ended_success = true;
        //this.animations_controller.clear_animations();
        setTimeout(this.animate_end.bind(this), 1000);
    }

    #updateExpectedConnections() {
        let i = 0;
        while (i < this.expected_connections.length) {
            let expected_connection = this.expected_connections[i];

            if (this.leading_connection.is_equal(expected_connection)) {
                this.expected_connections.splice(i, 1);
            } else {
                i++;
            }
        }

        if (this.expected_connections.length == 0 && this.state == STATE.PLAYING) {
            this.#handle_success();
        }
    }

    /* close the connection between the leading dot and the new_dot, then opens a connections
    with new_dot */
    #updateLeadingConnection(new_dot) {
        if (this.leading_connection) {
            this.leading_connection.end(new_dot);
            this.#updateExpectedConnections()
        }

        if (!this.connections_ended_success) {
            this.leading_connection = new Connection(true);
            this.leading_connection.begin(new_dot);
            this.player_connections.push(this.leading_connection);
        }
    }

    #updateLeadingDot(dot) {
        if (this.leading_dot) {
            let dotsIdxBetween = this.#getDotsIdxBetween(this.leading_dot, dot);
            this.leading_dot.vibrate();

            for (let i = 0;i < dotsIdxBetween.length;i++) {
                let dotIdx = dotsIdxBetween[i];
                let dotBetween = this.dots[dotIdx];
                dotBetween.alive = true;
                dotBetween.vibrate();

                this.#updateLeadingConnection(dotBetween);
            }
        }
        
        this.#updateLeadingConnection(dot);
        this.leading_dot = dot;
    }

    #update_and_draw_dots() {
        for (let i = 0;i < this.dots.length; i++) {
            let dot = this.dots[i];

            if (this.#isMouseCloseTo(dot) && this.#canConnect(dot)) {
                let consume_click = mouseIsPressed;
                if (consume_click && dot.alive) {
                    if ((this.state == STATE.PLAYING && this.clicks_consumed < this.max_clicks)
                      || this.state == STATE.CREATING) {
                        dot.clicks_consumed += 1;
                        dot.vibrate();
                        this.clicks_consumed += 1;
                        this.#updateLeadingDot(dot);
                    }
                } else {
                    if (!dot.alive) {
                        dot.alive = true;
                        this.#updateLeadingDot(dot);
                    }
                }
            }

            dot.update_and_draw();
        }
    }

    #update_and_draw_connections() {
        //expected connections
        for(let i = 0;i < this.expected_connections.length;i++) {
            this.expected_connections[i].update_and_draw();
        }

        // player connections
        for(let i = 0;i < this.player_connections.length;i++) {
            this.player_connections[i].update_and_draw();
        }
    }

    #update_and_draw_clicks_available() {
        let containerHeight = (this.rows - 1)*(DOTS_PADDING);

        let posRef = {
            x: windowWidth/2,
            y: windowHeight*0.96
        }

        let clicks_available = this.max_clicks - this.clicks_consumed;
        const PADDING = 30;
        const HALF = (clicks_available-1)/2;
        for (let i = 0; i < clicks_available;i++) {
            let posDraw = {
                x: posRef.x + (i - HALF) * PADDING,
                y : posRef.y
            }

            let size_dot_available = min(DOT_SIZE, DOT_SIZE*((windowWidth + windowHeight) / (width + height)));

            strokeWeight(1);
            stroke(255, 190);
            fill(BACKGROUND_COLOR);
            circle(posDraw.x, posDraw.y, size_dot_available);

            stroke(255, 150);
            noFill()
            circle(posDraw.x, posDraw.y, size_dot_available);
        }

        if (clicks_available > 0) {
            fill(255);
            stroke(150);
            textAlign(RIGHT, CENTER);
            textSize(15);
            text("Available Extra:", posRef.x-(1+HALF)*PADDING, posRef.y);
        } else if (this.state == STATE.PLAYING){
            fill(255);
            stroke(150);
            textAlign(CENTER, CENTER);
            textSize(15);
            text("Click the mouse right-button to retry", posRef.x, posRef.y);
        } else {
            fill(255);
            stroke(150);
            textAlign(CENTER, CENTER);
            textSize(15);
            text("Free to create whatever u want! :)", posRef.x, posRef.y);
        }
    }

    /** PUBLIC METHODS */

    constructor(code) {
        this.load(code);
    }

    handleFinish() {
        this.#encodeConnections();
    }

    load(code) {
        this.code = code;
        this.connections_ended_success = false;

        if (code) { // PLAYING
            let values = this.#getInfoFrom(code);
            this.max_clicks = values[0];
            this.rows = values[1];
            this.cols = values[2];
            
            this.dots = this.#init_dots();
            this.player_connections = [];
            this.expected_connections = [];
            this.leading_connection = null;

            this.#decodeConnections(code);

            this.leading_dot = null;
            this.clicks_consumed = 0;
            this.state = STATE.PLAYING;
        } else { // CREATING
            this.rows = DOTS_MAX_ROWS;
            this.cols = DOTS_MAX_COLS;

            this.dots = this.#init_dots(true);
            this.player_connections = [];
            this.expected_connections = [];
            this.leading_connection = null;
            this.leading_dot = null;
            this.clicks_consumed = 0;
            this.max_clicks = 0;
            this.state = STATE.CREATING;
        }
    }

    reload() {
        if (!this.connections_ended_success) {
            this.connections_ended_success = false;
            this.player_connections.length = 0;
            this.leading_connection = null;
            this.leading_dot = null;

            for (let i = 0;i < this.dots.length;i++) {
                this.dots[i].alive = false;
                this.dots[i].clicks_consumed = 0;
            }

            this.clicks_consumed = 0;
            this.expected_connections.length = 0;
            this.#decodeConnections(this.code);
        }
    }

    update_and_draw() {
        this.#update_and_draw_connections();
        this.#update_and_draw_dots();
        this.#update_and_draw_clicks_available();
    }

    /*transform player_connections to the level code (used in case we are creating a level)*/
    #encodeConnections() {
        /* FIRST: WE TRIM THE DOTS AND CALCULATE THE REAL ROWS AND COLS USED */
        let min_row = 99;
        let max_row = -1;

        let min_col = 99;
        let max_col = -1;

        let connections_history = [];

        for (let i = 0; i < this.player_connections.length-1;i++) {
            let connection = this.player_connections[i];
            let begin = this.#toPos(connection.dot_begin.idx);
            let end = this.#toPos(connection.dot_end.idx);
            
            min_row = min(min_row, begin.row, end.row);
            min_col = min(min_col, begin.col, end.col);

            max_row = max(max_row, begin.row, end.row);
            max_col = max(max_col, begin.col, end.col);

            connections_history.push(begin);
        }

        let last = this.#toPos(this.leading_connection.dot_begin.idx);
        connections_history.push(last)

        let real_rows = max_row - min_row + 1;
        let real_cols = max_col - min_col + 1;

        let code = this.clicks_consumed + '' + real_rows + '' + real_cols + '';

        for (let i = 0; i < connections_history.length;i++) {
            let conn_pos = connections_history[i];
            
            code += (conn_pos.row - min_row) + '' + 
                    (conn_pos.col - min_col) + '';
        }

        navigator.clipboard.writeText('["' + code + '"],\n\t').then(function() {
            console.log("deu bom");
        });
        return code;
    }

    /* transform code to the expected connections (used in case we are playing the level) */
    #decodeConnections(code) {
        for (let i = 3; i < code.length; i+=2) {
            let idxFrom = parseInt(code[i])*this.cols + parseInt(code[i+1]);
            let idxTo   = parseInt(code[i+2])*this.cols + parseInt(code[i+3]);
            
            let dotFrom = this.dots[idxFrom];
            let dotTo   = this.dots[idxTo];

            if (dotFrom && dotTo) {
                dotFrom.visible = true;
                dotTo.visible = true;
                let connection = new Connection(false, dotFrom, dotTo);
                let already_there = false;

                for (let i = 0;i < this.expected_connections.length;i++) {
                    let other_conn = this.expected_connections[i];
                    if (connection.is_equal(other_conn)) {
                        already_there = true;
                        break;
                    }
                }
                if (!already_there)
                    this.expected_connections.push(connection);
            }
        }
    }

    #getInfoFrom(code) {
        return [parseInt(code[0]), parseInt(code[1]), parseInt(code[2])];
    }

    animate_start() {
        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];

            dot.x = width / 2;
            dot.y = height / 2;
            dot.alpha = 0;

            animations_controller.new_animation(new ObjAnimator(dot, 'alpha', dot.initAlpha, 0.05));
            animations_controller.new_animation(new ObjAnimator(dot, 'x', dot.initX, 0.05));
            animations_controller.new_animation(new ObjAnimator(dot, 'y', dot.initY, 0.05));
        }

        for (let i = 0;i < this.expected_connections.length;i++) {
            let conn = this.expected_connections[i];
            conn.alpha = 0;
            animations_controller.new_animation(new ObjAnimator(conn, 'alpha', conn.initAlpha, 0.05));
        }
    }

    animate_end() {
        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];
            dot.alive = false;
            dot.vibrate();
        }
    }
}