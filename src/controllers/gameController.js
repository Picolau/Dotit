
const DotsController = require('./dotsController').default;
const MessagesController = require('./messagesController').default;
const LevelController = require('./levelController').default;
const HintsController = require('./hintsController').default;

const GAME_STATE = {
    PLAYING_GAME: 'playing-game',
    PLAYING_LOAD: 'playing-load',
    PLAYING_CREATE: 'playing-create',
    PLAYING_CHALLENGE: 'playing-challenge',
}


import { } from '../index';

export default class {
    constructor() {
        this.levelController = new LevelController();
        this.hintsController = new HintsController();
        this.messagesController = new MessagesController();
        this.dotsController = new DotsController();

        this.state = GAME_STATE.PLAYING_GAME;
        this.#clearHeaderText();
        this.continueGame();
    }

    #hideEndScreen() {
        document.getElementById("end-screen-container").style.display = "none";
    }

    #showEndScreen() {
        this.clearScreen();
        document.getElementById("end-screen-container").style.display = "block";
    }

    #hideFooter() {
        document.getElementById("footer").style.display = "none";
    }

    #showFooter() {
        document.getElementById("footer").style.display = "flex";
    }

    #updateLevelInfo() {
        if (this.state === GAME_STATE.PLAYING_GAME) {
            let levelNumber = this.currentLevel.levelNumber;
            let levelNumberText = (levelNumber < 10 ? '0' + levelNumber : levelNumber);
            let extraClicksText = (this.dotsController.maxClicks - this.dotsController.clicksConsumed) + " ";
            let totalHintsText = this.hintsController.getTotal()+"";
            let headerInfoHTML  = "<span>Extra: </span>"
                headerInfoHTML += extraClicksText;
                headerInfoHTML += "<span>Hints: </span>";
                headerInfoHTML += totalHintsText;

            document.getElementById("header-info").innerHTML = headerInfoHTML;
            document.getElementById("level-number").innerText = levelNumberText;
        } else if (this.state === GAME_STATE.PLAYING_CREATE) {
            document.getElementById("header-info").innerText = "Free";  
            document.getElementById("level-number").innerText = "";
        } else if (this.state === GAME_STATE.PLAYING_LOAD) {
            let extraClicksText = '' + (this.dotsController.maxClicks - this.dotsController.clicksConsumed);
            let headerInfoHTML  = "<span>Extra: </span>";
                headerInfoHTML += extraClicksText;

            document.getElementById("header-info").innerHTML = headerInfoHTML;
            document.getElementById("level-number").innerText = "";
        }
    }

    #clearHeaderText() {
        document.getElementById("header-info").innerText = "";  
    }
    
    #changeFooterElementsShowing(showArrows, showLevelCodeCopy) {
        let hintElem          = document.getElementById("hint-icon");
        let arrowLeftElem     = document.getElementById("arrow-left-icon");
        let arrowRightElem    = document.getElementById("arrow-right-icon");
        let levelNumberElem   = document.getElementById("level-number");
        let levelCodeCopyElem = document.getElementById("copy-level-code-container");

        hintElem.style.display          = "none";
        arrowLeftElem.style.display     = "none";
        arrowRightElem.style.display    = "none";
        levelNumberElem.style.display   = "none";
        levelCodeCopyElem.style.display = "none";

        if (showArrows) {
            hintElem.style.display        = "block";
            arrowLeftElem.style.display   = "block";
            arrowRightElem.style.display  = "block";
            levelNumberElem.style.display = "block";
        }

        if (showLevelCodeCopy) {
            levelCodeCopyElem.style.display = "flex";
        }
    }

    showHint() {
        if (this.hintsController.hasAny()) {
            this.hintsController.useOne();
            this.dotsController.showNextHint();
            this.#updateLevelInfo();
        }
    }

    goToNextLevel() {
        this.levelController.goForward();
        this.continueGame();
    }

    goToPrevLevel() {
        this.levelController.goBackward();
        this.continueGame();
    }

    reloadLevel() {
        this.dotsController.reload();
        this.#updateLevelInfo();
    }

    continueGame() {
        if (!this.levelController.progressEnded()) {
            this.state = GAME_STATE.PLAYING_GAME;
            this.currentLevel = this.levelController.getCurrent();
            this.#changeFooterElementsShowing(true, false);

            let onFinishSolvingDots = () => {
                if (this.currentLevel.isMax) {
                    this.levelController.progressNext();
                    if (this.currentLevel.levelNumber % 3 == 0)
                        this.hintsController.addOne();
                } else {
                    this.levelController.goForward();
                }

                this.continueGame();
            };

            let onConnectionMade = () => {
                this.#updateLevelInfo();
            }

            let loadDots = () => {
                this.dotsController.loadSolve(this.currentLevel.code, onFinishSolvingDots, onConnectionMade);
                this.dotsController.animateExpand();
                this.#updateLevelInfo();
                this.#showFooter();
            };

            if (this.currentLevel.hasMessage) { // has message
                let onFinishReadingMessages = loadDots;

                this.dotsController.animateShrink();
                this.messagesController.loadMessages(this.currentLevel.message, onFinishReadingMessages);
                this.#hideFooter();
            } else {
                loadDots();
            }
        } else {
            this.#showEndScreen();
        }
    }

    startNewGame() {
        this.levelController.resetProgress();
        this.continueGame();
    }

    createLevel() {
        document.getElementById('level-code').innerText = "";

        let onConnectionMade = () => {
            document.getElementById('level-code').innerText = this.dotsController.encodeConnections();
        }

        this.state = GAME_STATE.PLAYING_CREATE;
        this.#changeFooterElementsShowing(false, true);
        this.dotsController.loadCreate(onConnectionMade);
        this.dotsController.animateExpand();
        this.#updateLevelInfo();
        this.#showFooter();
    }

    loadLevel() {
        this.state = GAME_STATE.PLAYING_LOAD;
        let levelCodeContainerElement = document.getElementById("load-level-code-container");
        let levelCodeInput = document.getElementById('code-input');
            levelCodeInput.value = "";

        let onConnectionMade = () => {
            this.#updateLevelInfo();
        };

        let loadDotsFromInput = () => {
            let code = levelCodeInput.value;
            levelCodeContainerElement.style.display = "none";
            this.dotsController.loadSolve(code, null, onConnectionMade);
            this.dotsController.animateExpand();
            this.#changeFooterElementsShowing(false, false);
            this.#showFooter();
            this.#updateLevelInfo();
        }

        levelCodeContainerElement.style.display = "flex";
        levelCodeInput.onchange = loadDotsFromInput;
    }

    loadDailyChallenges() {

    }

    changeBackground() {

    }

    updateAndDraw() {
        this.dotsController.updateAndDraw();
    }

    handleResize() {
        this.dotsController.repositionDots();
    }

    clearScreen() {
        this.dotsController.animateShrink();
        this.messagesController.unloadMessages();
        this.#changeFooterElementsShowing(false, false);
        this.#hideFooter();
        this.#hideEndScreen();
        this.#clearHeaderText();
    }
}