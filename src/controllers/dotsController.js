
const DOTS_MAX_ROWS = 5; // 5
const DOTS_MAX_COLS = 8; // 8

const STATE = {
    CREATING: 'creating',
    PLAYING: 'playing'
}

import {P5, my_scale, menu_state, MENU_STATE, animations_controller, bg_controller, level_controller} from '../index';

const Dot = require('../classes/dot').default;
const Connection = require('../classes/connection').default;
const ObjAnimator = require('../classes/objAnimator').default;

export default class {

    /* PRIVATE METHODS */
    #toIdx(pos) {
        return pos.row * this.cols + pos.col;
    }

    #toPos(idx) {
        let pos = {
            row: P5.floor(idx / this.cols),
            col: idx % this.cols
        }

        return pos;
    }

    #getDotsContainerMeasures() {
        let dotsPadding = Dot.padding()*my_scale;

        let dotsContainerSize = {
            width: (this.cols - 1)*(dotsPadding),
            height: (this.rows - 1)*(dotsPadding),
        };

        let horizontalMargin = (P5.windowWidth - dotsContainerSize.width) / 2;
        let verticalMargin = (P5.windowHeight - dotsContainerSize.height) / 2;

        if (verticalMargin < 0.1*P5.windowHeight || horizontalMargin < 0.1*P5.windowWidth) {
            if (verticalMargin / P5.windowHeight < horizontalMargin/P5.windowWidth) {
                verticalMargin = 0.1*P5.windowHeight;
                dotsContainerSize.height = P5.windowHeight - verticalMargin*2;
                dotsPadding = dotsContainerSize.height / (this.rows - 1);
                dotsContainerSize.width = (this.cols-1)*dotsPadding;
                horizontalMargin = (P5.windowWidth - dotsContainerSize.width) / 2;
            } else {
                horizontalMargin = 0.1*P5.windowWidth;
                dotsContainerSize.width = P5.windowWidth - horizontalMargin*2;
                dotsPadding = dotsContainerSize.width / (this.cols - 1);
                dotsContainerSize.height = (this.rows-1)*dotsPadding;
                verticalMargin = (P5.windowHeight - dotsContainerSize.height) / 2;
            }
        }

        let containerMeasures = {
            marginTop: verticalMargin,
            marginLeft: horizontalMargin,
            dotsPadding: dotsPadding
        }

        return containerMeasures;
    }

    #init_dots(visible=false) {
        let dots = [];
        
        let dotsContainerMeasures = this.#getDotsContainerMeasures();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let padding = dotsContainerMeasures.dotsPadding;
                let dotX = dotsContainerMeasures.marginLeft + col*padding;
                let dotY = dotsContainerMeasures.marginTop + row*padding;

                dots.push(new Dot(row * this.cols + col, dotX, dotY, visible));
            }
        }

        return dots;
    }

    #isMouseCloseTo(dot) {
        return P5.dist(dot.x, dot.y, P5.mouseX, P5.mouseY) <= Dot.mouseSensitivityRadius();
    }

    #canConnect(dot) {
        if (!this.leading_dot)
            return P5.mouseIsPressed && this.leading_dot != dot && dot.visible && !this.connections_ended_success && !this.animating_shrink;

        return this.leading_dot != dot && dot.visible && !this.connections_ended_success && !this.animating_shrink;
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
        setTimeout(this.animate_end.bind(this), 1000);
    }

    #checkConnectionSuccess() {
        if (this.num_fulfilled_connections == this.expected_connections.length 
            && this.state == STATE.PLAYING
            && this.all_player_connections_are_expected_connections) {
            this.#handle_success();
        }
    }

    #updateExpectedConnections() {
        let found_expected_connection = false;

        for (let i=0;i < this.expected_connections.length;i++) {
            let expected_connection = this.expected_connections[i];

            if (this.leading_connection.is_equal(expected_connection)) {
                found_expected_connection = true;

                if (!expected_connection.fulfilled) {
                    expected_connection.fulfilled = true;
                    this.num_fulfilled_connections += 1
                }
            }
        }

        this.all_player_connections_are_expected_connections &= found_expected_connection;
    }

    /* close the connection between the leading dot and the new_dot, then opens a connections
    with new_dot */
    #closeLeadingConnection(new_dot) {
        this.leading_connection.end(new_dot);
        this.#updateExpectedConnections();
    }

    #openLeadingConnection(new_dot) {
        this.leading_connection = new Connection(true);
        this.leading_connection.begin(new_dot);
        this.player_connections.push(this.leading_connection);

        if (menu_state === MENU_STATE.CREATING || menu_state === MENU_STATE.LOADING) {
            let minX = 70;
            let minY = this.dots[0].initY - 40;
            let maxX = 9999;
            let maxY = 9999;
            this.leading_connection.set_boundaries(minX, minY, maxX, maxY);
        }
    }

    #connect(dot) {
        if (this.leading_dot) {
            let dotsIdxBetween = this.#getDotsIdxBetween(this.leading_dot, dot);
            this.leading_dot.vibrate();

            for (let i = 0;i < dotsIdxBetween.length;i++) {
                let dotIdx = dotsIdxBetween[i];
                let dotBetween = this.dots[dotIdx];
                dotBetween.alive = true;
                dotBetween.vibrate();

                this.#closeLeadingConnection(dotBetween);
                
                this.#openLeadingConnection(dotBetween);
            }

            this.#closeLeadingConnection(dot);

            this.#checkConnectionSuccess();
        }

        if (!this.connections_ended_success) {
            this.#openLeadingConnection(dot);
            this.leading_dot = dot;
        }

        if (menu_state == MENU_STATE.CREATING && this.player_connections.length > 1) {
            document.getElementById("code-input").value = this.#encodeConnections();
        }
    }

    #update_and_draw_dots() {
        for (let i = 0;i < this.dots.length; i++) {
            let dot = this.dots[i];

            if (this.#isMouseCloseTo(dot) && this.#canConnect(dot)) {
                let consume_click = P5.mouseIsPressed;
                if (consume_click && dot.alive) {
                    if ((this.state == STATE.PLAYING && this.clicks_consumed < this.max_clicks)
                      || this.state == STATE.CREATING) {
                        dot.clicks_consumed += 1;
                        dot.vibrate();
                        this.clicks_consumed += 1;
                        this.#connect(dot);
                    }
                } else {
                    if (!dot.alive) {
                        dot.alive = true;
                        this.#connect(dot);
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
        let posRef = {
            x: P5.windowWidth/2,
            y: P5.windowHeight*0.96
        }

        let clicks_available = this.max_clicks - this.clicks_consumed;
        const PADDING = 30;
        const HALF = (clicks_available-1)/2;
        for (let i = 0; i < clicks_available;i++) {
            let posDraw = {
                x: posRef.x + (i - HALF) * PADDING,
                y : posRef.y
            }

            let size_dot_available = Dot.size() * my_scale;

            P5.strokeWeight(1);
            P5.stroke(255, 190);
            P5.fill(bg_controller.bg_color);
            P5.circle(posDraw.x, posDraw.y, size_dot_available);

            P5.stroke(255, 150);
            P5.noFill()
            P5.circle(posDraw.x, posDraw.y, size_dot_available);
        }

        let availableTextSize = 17*my_scale;
        if (clicks_available > 0) {
            P5.fill(255);
            P5.stroke(150);
            P5.textAlign(P5.RIGHT, P5.CENTER);
            P5.textSize(availableTextSize);
            P5.text("Extra Clicks:", posRef.x-(1+HALF)*PADDING, posRef.y);
        } else if (this.state == STATE.PLAYING){
            P5.fill(255);
            P5.stroke(150);
            P5.textAlign(P5.CENTER, P5.CENTER);
            P5.textSize(availableTextSize);
            if (menu_state == MENU_STATE.PLAYING && level_controller.level < level_controller.getNumTutorialLevels())
                P5.text("Click with left-button to start connecting.\nClick with right-button to retry.", posRef.x, posRef.y);
            else
                P5.text("No Extra Clicks", posRef.x, posRef.y);
        } else {
            P5.fill(255);
            P5.stroke(150);
            P5.textAlign(P5.CENTER, P5.CENTER);
            P5.textSize(availableTextSize);
            P5.text("Free to create whatever u want! :)", posRef.x, posRef.y);
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
        this.animating_shrink = false;
        this.all_player_connections_are_expected_connections = true;
        this.num_fulfilled_connections = 0;

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
        if (!this.connections_ended_success || menu_state != MENU_STATE.PLAYING) {
            this.all_player_connections_are_expected_connections = true;
            this.num_fulfilled_connections = 0;
            this.connections_ended_success = false;
            this.player_connections.length = 0;
            this.leading_connection = null;
            this.leading_dot = null;
            this.animating_shrink = false;

            for (let i = 0;i < this.dots.length;i++) {
                this.dots[i].alive = false;
                this.dots[i].clicks_consumed = 0;
            }

            this.clicks_consumed = 0;
            this.expected_connections.length = 0;

            if (this.code)
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
            
            min_row = P5.min(min_row, begin.row, end.row);
            min_col = P5.min(min_col, begin.col, end.col);

            max_row = P5.max(max_row, begin.row, end.row);
            max_col = P5.max(max_col, begin.col, end.col);

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

    animate_shrink() {
        this.player_connections.length = 0;
        this.expected_connections.length = 0;
        this.leading_dot = null;
        this.leading_connection = null;
        this.animating_shrink = true;

        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];
            dot.alive = false;

            animations_controller.new_animation(new ObjAnimator(dot, 'alpha', 0, 0.1));
            animations_controller.new_animation(new ObjAnimator(dot, 'x', P5.width/2, 0.1));
            animations_controller.new_animation(new ObjAnimator(dot, 'y', P5.height/2, 0.1));
        }

        for (let i = 0;i < this.expected_connections.length;i++) {
            let conn = this.expected_connections[i];
            animations_controller.new_animation(new ObjAnimator(conn, 'alpha', 0, 0.1));
        }

        for (let i = 0;i < this.player_connections.length;i++) {
            let conn = this.player_connections[i];
            animations_controller.new_animation(new ObjAnimator(conn, 'alpha', 0, 0.1));
        }
    }

    animate_start() {
        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];

            dot.x = P5.width / 2;
            dot.y = P5.height / 2;
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

    reposition_dots() {
        let dotsContainerMeasures = this.#getDotsContainerMeasures();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let padding = dotsContainerMeasures.dotsPadding;
                let dotX = dotsContainerMeasures.marginLeft + col*padding;
                let dotY = dotsContainerMeasures.marginTop + row*padding;

                let i = row*this.cols + col;
                this.dots[i].x = dotX;
                this.dots[i].y = dotY;
            }
        }
    }
}