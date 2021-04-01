
const DOTS_MAX_ROWS = 5; // 5
const DOTS_MAX_COLS = 8; // 8
const MAX_PADDING = 140;

const STATE = {
    CREATING: 'creating',
    SOLVING: 'solving'
}

import { P5, animationsController, globalEnv } from '../index';
import p5 from '../lib/p5';

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

    // gets the dots container measures and return left margin and top margin and paddings
    #getDotsContainerMeasures() {
        let horizontalMargin = 30/*0.075 * P5.windowWidth*/;
        let verticalMargin = 60;

        let horizontalPadding = (P5.windowWidth - 2 * horizontalMargin) / (this.cols - 1);
        let verticalPadding = (P5.windowHeight - 2 * verticalMargin) / (this.rows - 1);
        let dotsPadding = P5.min(MAX_PADDING, horizontalPadding, verticalPadding);

        let dotsContainerSize = {
            width: (this.cols - 1) * (dotsPadding),
            height: (this.rows - 1) * (dotsPadding),
        };

        verticalMargin = (P5.windowHeight - dotsContainerSize.height) / 2;
        horizontalMargin = (P5.windowWidth - dotsContainerSize.width) / 2;
        /*if (verticalMargin < 0.1*P5.windowHeight || horizontalMargin < 0.1*P5.windowWidth) {
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
        }*/

        let dotSize = dotsPadding / 8;
        if (dotsPadding > 100) {
            dotSize = 20;
        } else if (dotsPadding > 80) {
            dotSize = 16;
        } else {
            dotSize = 12;
        }

        let containerMeasures = {
            marginTop: verticalMargin,
            marginLeft: horizontalMargin,
            dotsPadding: dotsPadding,
            dotSize: dotSize
        }

        return containerMeasures;
    }

    //self explanatory
    #initializeDots(visible = false) {
        let dots = [];

        let dotsContainerMeasures = this.#getDotsContainerMeasures();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let padding = dotsContainerMeasures.dotsPadding;
                let dotX = dotsContainerMeasures.marginLeft + col * padding;
                let dotY = dotsContainerMeasures.marginTop + row * padding;
                let dotSize = dotsContainerMeasures.dotSize;

                dots.push(new Dot(row * this.cols + col, dotX, dotY, dotSize, visible));
            }
        }

        return dots;
    }

    //self explanatory
    #isMouseCloseTo(dot) {
        return dot.isMouseClose();
    }

    //self explanatory
    #canConnect(dot) {
        if (!this.leadingDot)
            return P5.mouseIsPressed && this.leadingDot != dot && dot.visible && !this.connectionsEndedSuccess && !this.animatingShrink;
        return this.leadingDot != dot && dot.visible && !this.connectionsEndedSuccess && !this.animatingShrink;
    }

    // return all dots indexes between dotBegin and dotEnd not including them;
    #getDotsIdxBetween(begin, end) {
        let dots_between = [];

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
        let posIdx = this.#toIdx(begin) + stepIdx;
        let endIdx = this.#toIdx(end);

        while (posIdx != endIdx) {
            dots_between.push(posIdx);
            posIdx += stepIdx;
        }

        return dots_between;
    }

    //self explanatory
    #handleConnectionSuccess() {
        this.connectionsEndedSuccess = true;
        console.log(this.encodeConnections());
        setTimeout(this.animateSuccess.bind(this), 1000);
        
        if (this.successCallback)
            setTimeout(this.successCallback.bind(this), 2000);
    }

    //self explanatory
    #checkConnectionSuccess() {
        if (this.numFulfilledConnections == this.expectedConnections.length
            && this.state == STATE.SOLVING
            && this.allPlayerConnectionsAreExpectedConnections) {
            this.#handleConnectionSuccess();
        }
    }

    // check if the leading connections matches one of the expected connections 
    // and update the connection with fulfilled or not
    #updateExpectedConnections() {
        let foundExpectedConnection = false;

        for (let i = 0; i < this.expectedConnections.length; i++) {
            let expectedConnection = this.expectedConnections[i];

            if (this.leadingConnection.isEqual(expectedConnection)) {
                foundExpectedConnection = true;

                if (!expectedConnection.fulfilled) {
                    expectedConnection.fulfilled = true;
                    this.numFulfilledConnections += 1
                }
            }
        }

        this.allPlayerConnectionsAreExpectedConnections &= foundExpectedConnection;
    }

    /* close the connection between the leading dot and the newDot */
    #closeLeadingConnection(new_dot) {
        this.leadingConnection.end(new_dot);
        this.#updateExpectedConnections();
    }


    // opens a leading connection (the loose string we see when moving the mouse)
    #openLeadingConnection(newDot) {
        this.leadingConnection = new Connection(true);
        this.leadingConnection.begin(newDot);
        this.playerConnections.push(this.leadingConnection);
    }

    // main connect function, responsible for updating leading dot and leading connection
    // and make the animations
    #connect(dot) {
        this.positionsHistory.push(this.#toPos(dot.idx));
        navigator.vibrate(50);

        if (this.leadingDot) {
            let dotsIdxBetween = this.#getDotsIdxBetween(
                this.#toPos(this.leadingDot.idx), 
                this.#toPos(dot.idx)
            );
            this.leadingDot.vibrate();

            for (let i = 0; i < dotsIdxBetween.length; i++) {
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

        if (!this.connectionsEndedSuccess) {
            this.#openLeadingConnection(dot);
            this.leadingDot = dot;
        }

        if (this.connMadeCallback && this.playerConnections.length && this.playerConnections[0].dotEnd)
            this.connMadeCallback();
    }

    #updateAndDrawDots() {
        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];

            if (this.#isMouseCloseTo(dot) && this.#canConnect(dot)) {
                let consumeClick = (globalEnv.isDevice && !P5.mouseIsPressed) 
                                || (!globalEnv.isDevice && P5.mouseIsPressed);
                if (consumeClick && dot.alive) {
                    if ((this.state == STATE.SOLVING && this.clicksConsumed < this.maxClicks)
                        || this.state == STATE.CREATING) {
                        dot.clicksConsumed += 1;
                        dot.vibrate();
                        this.clicksConsumed += 1;
                        this.#connect(dot);
                    }
                } else {
                    if (!dot.alive) {
                        dot.alive = true;
                        this.#connect(dot);
                    }
                }
            }

            dot.updateAndDraw();
        }
    }

    #updateAndDrawConnections() {
        //expected connections
        for (let i = 0; i < this.expectedConnections.length; i++) {
            this.expectedConnections[i].updateAndDraw();
        }

        // player connections
        for (let i = 0; i < this.playerConnections.length; i++) {
            this.playerConnections[i].updateAndDraw();
        }
    }

    /** PUBLIC METHODS */

    constructor() {
        this.waitingLoad = true;
    }

    loadSolve(code, successCallback, connMadeCallback) {
        this.waitingLoad = false;
        this.successCallback = successCallback;
        this.connMadeCallback = connMadeCallback;
        this.code = code;
        this.connectionsEndedSuccess = false;
        this.animatingShrink = false;
        this.allPlayerConnectionsAreExpectedConnections = true;
        this.numFulfilledConnections = 0;
        this.positionsHistory = [];

        if (code) { // SOLVING
            let values = this.#getInfoFrom(code);
            this.maxClicks = values[0];
            this.rows = values[1];
            this.cols = values[2];

            this.dots = this.#initializeDots();
            this.playerConnections = [];
            this.expectedConnections = [];
            this.leadingConnection = null;

            this.tips = this.#decodeConnections(code);
            this.tipId = 0;

            this.leadingDot = null;
            this.clicksConsumed = 0;
            this.state = STATE.SOLVING;
        }
    }

    loadCreate(connMadeCallback) {
        this.positionsHistory = [];
        this.waitingLoad = false;
        this.connMadeCallback = connMadeCallback;

        this.rows = DOTS_MAX_ROWS;
        this.cols = DOTS_MAX_COLS;

        this.dots = this.#initializeDots(true);
        this.playerConnections = [];
        this.expectedConnections = [];
        this.leadingConnection = null;
        this.leadingDot = null;
        this.clicksConsumed = 0;
        this.maxClicks = 0;
        this.state = STATE.CREATING;
        this.connectionsEndedSuccess = false;
        this.animatingShrink = false;
    }

    reload() {
        if (this.state == STATE.CREATING || !this.connectionsEndedSuccess) {
            this.positionsHistory = [];
            this.allPlayerConnectionsAreExpectedConnections = true;
            this.numFulfilledConnections = 0;
            this.connectionsEndedSuccess = false;
            this.playerConnections.length = 0;
            this.leadingConnection = null;
            this.leadingDot = null;
            this.animatingShrink = false;
            this.clicksConsumed = 0;

            for (let i = 0; i < this.dots.length; i++) {
                this.dots[i].alive = false;
                this.dots[i].clicksConsumed = 0;
            }

            this.expectedConnections.length = 0;

            if (this.state == STATE.SOLVING)
                this.#decodeConnections(this.code);
        }
    }

    updateAndDraw() {
        if (!this.waitingLoad) {
            this.#updateAndDrawConnections();
            this.#updateAndDrawDots();
        }
    }

    showNextTip() {
        if (this.tipId < this.tips.length) {
            let idx = this.tips[this.tipId];
            this.tipId += 1;
            this.dots[idx].vibrate();
            this.dots[idx].tip = this.tipId;
        }
    }

    animateShrink() {
        animationsController.clearAnimations(true);
        
        if (!this.waitingLoad) {
            this.playerConnections.length = 0;
            this.expectedConnections.length = 0;
            /*this.tips.length = 0;
            this.tipId = 0;*/
            this.leadingDot = null;
            this.leadingConnection = null;
            this.animatingShrink = true;

            for (let i = 0; this.dots && i < this.dots.length; i++) {
                let dot = this.dots[i];
                dot.alive = false;
                dot.tip = 0;

                animationsController.newAnimation(new ObjAnimator(dot, 'alpha', 0, 0.1));
                animationsController.newAnimation(new ObjAnimator(dot, 'x', P5.width / 2, 0.1));
                animationsController.newAnimation(new ObjAnimator(dot, 'y', P5.height / 2, 0.1));
            }
        }
    }

    animateExpand() {
        animationsController.clearAnimations();

        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];

            dot.x = P5.width / 2;
            dot.y = P5.height / 2;
            dot.alpha = 0;

            animationsController.newAnimation(new ObjAnimator(dot, 'alpha', dot.initAlpha, 0.05));
            animationsController.newAnimation(new ObjAnimator(dot, 'x', dot.initX, 0.05));
            animationsController.newAnimation(new ObjAnimator(dot, 'y', dot.initY, 0.05));
        }

        for (let i = 0; i < this.expectedConnections.length; i++) {
            let conn = this.expectedConnections[i];
            conn.alpha = 0;
            animationsController.newAnimation(new ObjAnimator(conn, 'alpha', conn.initAlpha, 0.05));
        }
    }

    animateSuccess() {
        for (let i = 0; i < this.dots.length; i++) {
            let dot = this.dots[i];
            dot.alive = false;
            dot.vibrate();
        }
    }

    repositionDots() {
        let dotsContainerMeasures = this.#getDotsContainerMeasures();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let padding = dotsContainerMeasures.dotsPadding;
                let dotX = dotsContainerMeasures.marginLeft + col * padding;
                let dotY = dotsContainerMeasures.marginTop + row * padding;
                let dotSize = dotsContainerMeasures.dotSize;

                let i = row * this.cols + col;
                this.dots[i].x = dotX;
                this.dots[i].y = dotY;
                this.dots[i].setSize(dotSize);
            }
        }
    }

    /*transform playerConnections to the level code (used in case we are creating a level)*/
    encodeConnections() {
        let max = {row: -1, col: -1};
        let min = {row: 10, col: 10};
        let total = {row: 0, col: 0};
        
        for (let i = 0; i < this.positionsHistory.length; i++) {
            let pos = this.positionsHistory[i];

            if (pos.row > max.row) {
                max.row = pos.row;
            }
            if (pos.col > max.col) {
                max.col = pos.col;
            }
            if (pos.row < min.row) {
                min.row = pos.row;
            }
            if (pos.col < min.col) {
                min.col = pos.col;
            }
        }

        total.row = max.row - min.row + 1;
        total.col = max.col - min.col + 1;

        let code = this.clicksConsumed + '' + total.row + '' + total.col + '';
        
        for (let i = 0; i < this.positionsHistory.length; i++) {
            let pos = this.positionsHistory[i];
            code += (pos.row - min.row) + '' + (pos.col - min.col); 
        }

        return code;
    }

    /* transform code to the expected connections (used in case we are playing the level) */
    #decodeConnections(code) {
        let codeTips = [];
        for (let i = 3; i < code.length; i += 2) {
            let idxFrom = parseInt(code[i]) * this.cols + parseInt(code[i + 1]);
            let idxTo = parseInt(code[i + 2]) * this.cols + parseInt(code[i + 3]);

            codeTips.push(idxFrom);

            let dotFrom = this.dots[idxFrom];
            let dotTo = this.dots[idxTo];

            if (dotFrom && dotTo) {
                let dotsIdxBetween = this.#getDotsIdxBetween(this.#toPos(idxFrom), this.#toPos(idxTo));
                dotsIdxBetween.push(idxTo);
                let connections = [];
                
                dotFrom.visible = true;
                for (let j = 0;j < dotsIdxBetween.length;j++) {
                    let dotIdx = dotsIdxBetween[j];
                    dotTo = this.dots[dotIdx];
                    dotTo.visible = true;
                    connections.push(new Connection(false, dotFrom, dotTo));
                    dotFrom = dotTo;
                }
                for (let j = 0;j<connections.length;j++) {
                    let connection = connections[j];
                    let alreadyThere = false;

                    for (let i = 0; i < this.expectedConnections.length; i++) {
                        let otherConn = this.expectedConnections[i];
                        if (connection.isEqual(otherConn)) {
                            alreadyThere = true;
                            break;
                        }
                    }

                    if (!alreadyThere)
                        this.expectedConnections.push(connection);
                }
            }
        }
        return codeTips;
    }

    // gets row, col and max clicks from code
    #getInfoFrom(code) {
        return [parseInt(code[0]), parseInt(code[1]), parseInt(code[2])];
    }
}