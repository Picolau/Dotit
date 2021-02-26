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

    #init_dots() {
        let dots = [];

        let dotsContainerSize = {
            width: DOT_SIZE*this.cols + (this.cols - 1)*(DOTS_PADDING),
            height: DOT_SIZE*this.rows + (this.rows - 1)*(DOTS_PADDING),
        };

        let horizontalMargin = (width - dotsContainerSize.width) / 2;
        let verticalMargin = (height - dotsContainerSize.height) / 2;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let dotX = horizontalMargin + col*DOTS_PADDING;
                let dotY = verticalMargin + row*DOTS_PADDING;

                dots.push(new Dot(row * this.cols + col, dotX, dotY));
            }
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

    #mouseCanConnect(dot) {
        if (this.leadingDot == dot) {
            return false;
        }

        return dist(dot.x, dot.y, mouseX, mouseY) <= DOT_MOUSE_SENSITIVITY_RADIUS;
    }

    #update_and_draw_dots() {
        for (let i = 0;i < this.rows*this.cols; i++) {
            let dot = this.dots[i];

            if (this.#mouseCanConnect(dot)) {
                this.current_conn_string?.tighten(dot);
                this.current_conn_string = new ConnString(dot);
                this.player_conn_strings.push(this.current_conn_string);
                this.leadingDot = dot;
            }

            dot.update_and_draw();
        }
    }

    #update_and_draw_conn_strings() {
        // player conn strings
        for(let i = 0;i < this.player_conn_strings.length;i++) {
            this.player_conn_strings[i].update_and_draw();
        }
    }

    /** PUBLIC METHODS */

    constructor(levelObj=null) {
        if (levelObj)
            this.load(levelObj);
    }

    load(levelObj) {
        this.rows = levelObj.rows;
        this.cols = levelObj.cols;

        this.dots = this.#init_dots();
        this.player_conn_strings = [];
        this.current_conn_string;

        this.leadingDot;
        /*this.playerConnections = this.#initConnections();
        this.expectedConnections = this.#initConnections();
        this.#loadExpectedConnections(levelObj.connections);

        this.playerConnectionsStrings = [];
        this.expectedConnectionsStrings = [];

        

        this.#myAnimations = [];
        this.#startedConnecting = false;*/
    }

    update_and_draw() {
        this.#update_and_draw_conn_strings();
        this.#update_and_draw_dots();
    }
}