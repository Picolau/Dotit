const LEVEL_STATE = {
    PLAYING: 'playing',
    LOADING: 'loading',
    SHOWING_ERROR: 'showing_error',
    SHOWING_SUCCESS: 'showing_success'
}

class LevelController {
    
    #connWeight = 1;
    /* PRIVATE METHODS */

    #toIdx(pos) {
        return pos.row * this.cols + pos.col;
    }

    #toPos(idx) {
        let pos = {
            row: Math.floor(idx / this.cols),
            col: idx % this.cols
        }

        return pos;
    }

    #loadExpectedConnections(connectionsPos) {
        let beginPos = connectionsPos[0];

        for (let i = 1;i < connectionsPos.length;i++) {
            let endPos = connectionsPos[i];

            this.#makeNewConnection(beginPos, endPos, this.expectedConnections);

            beginPos = endPos;
        }
    }

    #changeLeadingDot(newLeadingDot) {
        if (this.leadingDot)
            this.leadingDot.setLeading(false);

        newLeadingDot.setLeading(true);
        this.leadingDot = newLeadingDot;
    }

    #makeNewConnection(begin, end, connections) {
        let posConnsMade = [];

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
        let posIdx = this.#toIdx(begin);
        let endIdx = this.#toIdx(end);

        while (posIdx != endIdx) {
            let nextIdx = posIdx + stepIdx;

            connections[posIdx][nextIdx] += 1;
            connections[nextIdx][posIdx] += 1;

            posConnsMade.push(this.#toPos(nextIdx));

            posIdx = nextIdx;
        }

        return posConnsMade;
    }

    #checkNewConnection(dot, mouseDis) {
        if (!dot.isFullyConnected() && !dot.isLeading) {
            if (mouseDis < Dot.MIN_CONNECTION_DIST) {
                if (this.leadingDot) {
                    let posLeadingDot = {
                        row: this.leadingDot.row,
                        col: this.leadingDot.col
                    }
                    let posConnectedDot = {
                        row: dot.row,
                        col: dot.col
                    }

                    let posConnsMade = this.#makeNewConnection(posLeadingDot, posConnectedDot, this.playerConnections);

                    /* Getting dots from pos of connections made */
                    for (let i = 0;i < posConnsMade.length;i++) {
                        let pos = posConnsMade[i];
                        let connectedDot = this.dots[pos.row][pos.col];
                        connectedDot.handleConnection();
                    }
                } else {
                    dot.handleConnection();
                }

                this.#changeLeadingDot(dot);
            }
        }
    }

    #checkClosestDot(dot, mouseDis) {
        if (dot != this.leadingDot && !dot.isFullyConnected() && dot != this.closestDot) {
            if (this.closestDot) {
                let distClosestDost = dist(mouseX, mouseY, this.closestDot.x, this.closestDot.y);

                if (mouseDis < distClosestDost) {
                    this.closestDot = dot;
                }
            } else {
                this.closestDot = dot;
            }
        }
    }

    #changeState(state) {
        if (state == LEVEL_STATE.PLAYING) {
            for (let i = 0;i < this.rows; i++) {
                for (let j = 0;j < this.cols;j++) {
                    let dot = this.dots[i][j];

                    dot.size = dot.initSize;
                    dot.alpha = dot.initAlpha;
                    dot.x = dot.initX;
                    dot.y = dot.initY;
                    dot.state = DOT_STATE.ANIMATING_MOUSE_CLOSE;
                }
            }
        }

        this.state = state;
    }

    #initDots() {
        let dots = []
        let horizontalMargin = width / 10;
        let dotsSquareSize = (width - 2*horizontalMargin);
        let verticalMargin = (height - dotsSquareSize) / 2;
        
        let horizontalPaddingDots = dotsSquareSize / (this.rows - 1);
        let verticalPaddingDots = dotsSquareSize / (this.cols - 1);
        
        for (let row = 0; row < this.rows; row++) {
            let dotsRow = [];

            for (let col = 0; col < this.cols; col++) {
                let dotX = horizontalMargin + col*horizontalPaddingDots;
                let dotY = verticalMargin + row*verticalPaddingDots;

                dotsRow.push(new Dot(row, col, dotX, dotY, 1));
            }

            dots.push(dotsRow);
        }

        return dots;
    }

    #initConnections() {
        let connections = [];

        for (let i = 0;i < this.rows*this.cols;i++) {
            let conns = [];

            for (let j = 0;j < this.rows*this.cols;j++) {
                conns.push(0);
            }

            connections.push(conns);
        }

        return connections;
    }

    #drawDots() {
        for (let i = 0;i < this.rows; i++) {
            for (let j = 0;j < this.cols;j++) {
                let dot = this.dots[i][j];
                
                if (this.state == LEVEL_STATE.PLAYING) {
                    let mouseDis = dist(mouseX, mouseY, dot.x, dot.y);
                    this.#checkClosestDot(dot, mouseDis);
                    this.#checkNewConnection(dot, mouseDis);
                } else if (this.state == LEVEL_STATE.LOADING) {
                    dot.size = lerp(dot.size, dot.initSize, 0.05);
                    dot.alpha = lerp(dot.alpha, dot.initAlpha, 0.05);
                    dot.x = lerp(dot.x, dot.initX, 0.05);
                    dot.y = lerp(dot.y, dot.initY, 0.05);
                }

                dot.draw();
            }
        }

        /* Checking if we should change the game state from loading to playing */
        if (this.state == LEVEL_STATE.LOADING) {
            let dot = this.dots[0][0];
            if (Math.sqrt(Math.pow(dot.initX - dot.x, 2) + Math.pow(dot.initY - dot.y, 2)) < 0.2)
                this.#changeState(LEVEL_STATE.PLAYING);
        }
    }

    #drawConnections() {
        /* DRAWING EXPECTED CONNECTIONS */
        for (let i = 0;i < this.rows * this.cols;i++) {
            for (let j = 0;j < i;j++) {
                if (this.expectedConnections[i][j] || this.playerConnections[i][j]) {
                    let posDot1 = this.#toPos(i);
                    let posDot2 = this.#toPos(j);

                    let lineX1 = this.dots[posDot1.row][posDot1.col].x;
                    let lineY1 = this.dots[posDot1.row][posDot1.col].y;

                    let lineX2 = this.dots[posDot2.row][posDot2.col].x;
                    let lineY2 = this.dots[posDot2.row][posDot2.col].y;

                    let alpha = this.playerConnections[i][j] ? 255 : 50;
                    stroke(255, alpha);

                    if (this.state == LEVEL_STATE.PLAYING) {
                        strokeWeight(4);
                    } else if (this.state == LEVEL_STATE.LOADING) {
                        this.#connWeight = lerp(this.#connWeight, 4, 0.05);
                        strokeWeight(this.#connWeight);
                    }

                    line(lineX1, lineY1, lineX2, lineY2);
                }
            }
        }
    }

    #drawLeadingConnection() {
        if (mouseIsPressed && this.leadingDot) {
            let pos1 = {
                dis: 60,
                alpha: 100
            };

            let pos2 = {
                dis: 35,
                alpha: 250
            }

            let m = (pos2.alpha - pos1.alpha) / (pos2.dis - pos1.dis);
            let dis = dist(mouseX, mouseY, this.closestDot.x, this.closestDot.y);
            let alpha = m * (dis - pos1.dis) + pos1.alpha;

            if (dis > pos1.dis)
                alpha = pos1.alpha;

            stroke(255, alpha);
            strokeWeight(4);
            line(mouseX, mouseY, this.leadingDot.x, this.leadingDot.y);
        }
    }

    /** PUBLIC METHODS */

    constructor(levelObj=null) {
        if (levelObj)
            this.load(levelObj);
    }

    restart() {

    }

    finish() {

    }

    load(levelObj) {
        this.rows = levelObj.rows;
        this.cols = levelObj.cols;

        this.dots = this.#initDots();

        this.playerConnections = this.#initConnections();
        this.expectedConnections = this.#initConnections();
        this.#loadExpectedConnections(levelObj.connections);

        this.leadingDot = null; 
        this.closestDot = null;

        this.state = LEVEL_STATE.LOADING;
    }

    draw() {
        this.#drawConnections();
        this.#drawDots();
        this.#drawLeadingConnection();
    }
}