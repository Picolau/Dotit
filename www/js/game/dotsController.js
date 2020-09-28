const LEVEL_STATE = {
    PLAYING: 'playing',
    LOADING: 'loading',
    SHOWING_ERROR: 'showing_error',
    SHOWING_SUCCESS: 'showing_success'
}

class DotsController {
    /* PRIVATE VARIABLES USED TO HANDLE THE ANIMATIONS */
    #myAnimations;

    #startedConnecting;

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

            this.dots[beginPos.row][beginPos.col].maxConns += 1;
            beginPos = endPos;
        }

        this.dots[beginPos.row][beginPos.col].maxConns += 1;
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

    #checkMouseCanConnect(dot, mouseDis) {
        if (!dot.isFullyConnected() && dot != this.leadingDot) {
            if (mouseDis < 25) {
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

                        if (!connectedDot.isFullyConnected()) {
                            connectedDot.resetPosAndSize();
                            connectedDot.numConns += 1;
                            connectedDot.animateExpand();
                        }
                    }
                } else {
                    if (!dot.isFullyConnected()) {
                        dot.resetPosAndSize();
                        dot.numConns += 1;
                        dot.animateExpand();
                    }
                }

                this.leadingDot = dot;
            }
        }
    }

    #checkConnectionSuccess() {
        for (let i = 0;i < this.rows * this.cols;i++) {
            for (let j = 0;j < i;j++) {
                if (this.expectedConnections[i][j] && !this.playerConnections[i][j]) {
                    this.#changeState(LEVEL_STATE.SHOWING_ERROR);
                    return;
                }
            }
        }

        // Level completed! Success
        this.#changeState(LEVEL_STATE.SHOWING_SUCCESS);
    }

    #updateMouseClose(dot, mouseDis) {
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
        
        let mouseAngle = Math.atan2(mouseY - dot.y, mouseX - dot.x);
        let toX = dot.initX;
        let toY = dot.initY;
        let toSize = dot.initSize;
        let toAlpha = dot.initAlpha;
        let deadDot = dot.maxConns == 0;

        if (mouseDis < 45 && this.leadingDot != dot) {
            dot.state = DOT_STATE.REACTING_MOUSE_CLOSE;

            if (!deadDot) {
                toX = dot.initX + Math.cos(mouseAngle) * 5;
                toY = dot.initY + Math.sin(mouseAngle) * 5;
                toSize = 15;
            } else {
                toX = dot.initX + Math.cos(mouseAngle) * 3;
                toY = dot.initY + Math.sin(mouseAngle) * 3;
            }
                
            toAlpha = 255;
        } 
        
        if (dot.state == DOT_STATE.REACTING_MOUSE_CLOSE && (!dot.isFullyConnected() || deadDot)) {
            dot.x = lerp(dot.x, toX, 0.25);
            dot.y = lerp(dot.y, toY, 0.25);
            dot.size = lerp(dot.size, toSize, 0.25);
            dot.alpha = lerp(dot.alpha, toAlpha, 0.25);

            if (dist(dot.x, dot.y, dot.initX, dot.initY) < 0.1) {
                dot.state = DOT_STATE.STILL;

                dot.x = dot.initX;
                dot.y = dot.initY;
                dot.size = toSize;
                dot.alpha = toAlpha;
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

                dotsRow.push(new Dot(dotX, dotY, 12, row, col));
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

                let mouseDis = dist(mouseX, mouseY, dot.x, dot.y);
                this.#updateMouseClose(dot, mouseDis);
                this.#checkMouseCanConnect(dot, mouseDis);

                dot.draw();
            }
        }

        /* Checking if we should change the game state from loading to playing */
        /*if (this.state == LEVEL_STATE.LOADING) {
            let dot = this.dots[0][0];
            if (Math.sqrt(Math.pow(dot.initX - dot.x, 2) + Math.pow(dot.initY - dot.y, 2)) < 0.2)
                this.#changeState(LEVEL_STATE.PLAYING);
        }*/
    }

    #drawConnections() {
        /* DRAWING EXPECTED CONNECTIONS */
        for (let i = 0;i < this.rows * this.cols;i++) {
            for (let j = 0;j < i;j++) {
                if (this.expectedConnections[i][j] || this.playerConnections[i][j]) {
                    let posDot1 = this.#toPos(i);
                    let posDot2 = this.#toPos(j);

                    let dot1 = this.dots[posDot1.row][posDot1.col];
                    let dot2 = this.dots[posDot2.row][posDot2.col];

                    let angle1 = Math.atan2(dot2.y - dot1.y, dot2.x - dot1.x);
                    let angle2 = Math.atan2(dot1.y - dot2.y, dot1.x - dot2.x);

                    let lineX1 = dot1.x + Math.cos(angle1)*(dot1.size);
                    let lineY1 = dot1.y + Math.sin(angle1)*(dot1.size);

                    if (dot1.isFullyConnected()) {
                        lineX1 = dot1.x;
                        lineY1 = dot1.y;
                    }

                    let lineX2 = dot2.x + Math.cos(angle2)*(dot2.size);
                    let lineY2 = dot2.y + Math.sin(angle2)*(dot2.size);

                    if (dot2.isFullyConnected()) {
                        lineX2 = dot2.x;
                        lineY2 = dot2.y;
                    }

                    let alpha = this.playerConnections[i][j] ? 255 : 50;
                    stroke(255, alpha);
                    strokeWeight(4);
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

            let angle = Math.atan2(mouseY - this.leadingDot.y, mouseX - this.leadingDot.x);
            let lineX = this.leadingDot.x + Math.cos(angle) * (this.leadingDot.size);
            let lineY = this.leadingDot.y + Math.sin(angle) * (this.leadingDot.size);

            if (this.leadingDot.isFullyConnected()) {
                lineX = this.leadingDot.x;
                lineY = this.leadingDot.y;
            }

            stroke(255, alpha);
            strokeWeight(4);
            line(mouseX, mouseY, lineX, lineY);
        }
    }

    /** PUBLIC METHODS */

    constructor(levelObj=null) {
        if (levelObj)
            this.load(levelObj);
    }

    animateExpand() {
        this.#myAnimations = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let dot = this.dots[row][col];
                
                dot.x = width/2;
                dot.y = height/2;
                dot.size = 0;
                dot.alpha = 0;

                this.#myAnimations.push(new DotitAnimation(dot, 'x', dot.initX, 0.05));
                this.#myAnimations.push(new DotitAnimation(dot, 'y', dot.initY, 0.05));
                this.#myAnimations.push(new DotitAnimation(dot, 'size', dot.initSize, 0.05));
                this.#myAnimations.push(new DotitAnimation(dot, 'alpha', dot.initAlpha, 0.05));
            }
        }
    }

    #updateAnimations() {
        for (let i = this.#myAnimations.length-1;i >= 0;i--) {
            let animation = this.#myAnimations[i];
            
            if (animation.ended()) {
                this.#myAnimations.splice(i);
            } else {
                animation.update();
            }
        }
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

        this.#myAnimations = [];
        this.#startedConnecting = false;
    }

    draw() {
        this.#drawConnections();
        this.#drawLeadingConnection();
        this.#drawDots();
        this.#updateAnimations();

        if (!mouseIsPressed && this.#startedConnecting) {
            //this.#checkConnectionSuccess();
        }

        if (mouseIsPressed && !this.#startedConnecting) {
            this.#startedConnecting = true;
        }
    }
}