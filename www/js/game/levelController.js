class LevelController {
    toIdx(pos) {
        return pos.row * this.cols + pos.col;
    }

    toPos(idx) {
        let pos = {
            row: Math.floor(idx / this.cols),
            col: idx % this.cols
        }

        return pos;
    }

    makeNewConnection(begin, end, connections) {
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
        } else if (deltaCol <= deltaRow && deltaRow % deltaCol == 0) {
            step.col = delta.col > 0 ? 1 : -1;
            let m = Math.abs(delta.row / delta.col); 
            step.row = delta.row > 0 ? m : -m;
        }

        let stepIdx = this.toIdx(step);
        let posIdx = this.toIdx(begin);
        let endIdx = this.toIdx(end);

        while (posIdx != endIdx) {
            let nextIdx = posIdx + stepIdx;

            connections[posIdx][nextIdx] += 1;
            connections[nextIdx][posIdx] += 1;

            posConnsMade.push(this.toPos(nextIdx));

            posIdx = nextIdx;
        }

        return posConnsMade;
    }
    
    initDots() {
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

    initConnections() {
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

    loadExpectedConnections(connectionsPos) {
        let beginPos = connectionsPos[0];

        for (let i = 1;i < connectionsPos.length;i++) {
            let endPos = connectionsPos[i];

            this.makeNewConnection(beginPos, endPos, this.expectedConnections);

            beginPos = endPos;
        }
    }

    constructor(levelObj) {
        this.rows = levelObj.rows;
        this.cols = levelObj.cols;

        this.playerConnections = this.initConnections();
        this.expectedConnections = this.initConnections();

        this.dots = this.initDots(); // matrix of dots

        this.loadExpectedConnections(levelObj.connections);
    }

    draw() {
        this.drawConnections();
        this.drawDots();
    }

    checkNewConnection(dot) {
        if (!dot.isFullyConnected() && !dot.isLeading) {
            let mouseDis = dist(mouseX, mouseY, dot.x, dot.y);

            if (mouseDis < Dot.MIN_CONNECTION_DIST) {
                dot.handleConnection();
                this.changeLeadingDot(dot);
            }
        }
    }

    changeLeadingDot(newLeadingDot) {
        if (this.leadingDot)
            this.leadingDot.setLeading(false);

        newLeadingDot.setLeading(true);
        this.leadingDot = newLeadingDot;
    }

    drawDots() {
        for (let i = 0;i < this.rows; i++) {
            for (let j = 0;j < this.cols;j++) {
                let dot = this.dots[i][j];
            
                this.checkNewConnection(dot);

                dot.draw();
            }
        }
    }

    drawConnections() {
        /* DRAWING EXPECTED CONNECTIONS */
        for (let i = 0;i < this.rows * this.cols;i++) {
            for (let j = 0;j < i;j++) {
                if (this.expectedConnections[i][j]) {
                    let posDot1 = this.toPos(i);
                    let posDot2 = this.toPos(j);

                    let lineX1 = this.dots[posDot1.row][posDot1.col].x;
                    let lineY1 = this.dots[posDot1.row][posDot1.col].y;

                    let lineX2 = this.dots[posDot2.row][posDot2.col].x;
                    let lineY2 = this.dots[posDot2.row][posDot2.col].y;
                    
                    let alpha = this.playerConnections[i][j] ? 255 : 50;
                    stroke(255, alpha);
                    strokeWeight(4);
                    line(lineX1, lineY1, lineX2, lineY2);
                }
            }
        }
    }
}