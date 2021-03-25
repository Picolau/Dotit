
const DotsController = require('./dotsController').default;
const MessagesController = require('./messagesController').default;
const LevelController = require('./levelController').default;

const GAME_STATE = {
    CONTINUE: 'continue',
}


import {} from '../index';

export default class {
    constructor() {
        this.levelController = new LevelController();
        this.messagesController = new MessagesController();
        this.dotsController = new DotsController();

        this.state = GAME_STATE.CONTINUE;
        this.continueGame();
    }

    #hideFooter() {
        document.getElementById("footer").style.display = "none";
    }

    #showFooter() {
        document.getElementById("footer").style.display = "flex";
    }

    #changeHeaderText(text) {
        document.getElementById("level-info").innerHTML = text;
    }

    #changeFooterElementsShowing(showArrows, showLevelCodeCopy) {
        let arrowLeftElem = document.getElementById("arrow-left-icon");
        let arrowRightElem = document.getElementById("arrow-right-icon");
        let levelCodeCopyElem = document.getElementById("level-code-container");
        
        arrowLeftElem.style.display = "none";
        arrowRightElem.style.display = "none";
        levelCodeCopyElem.style.display = "none";

        if (showArrows) {
            arrowLeftElem.style.display = "block";
            arrowRightElem.style.display = "block";
        }
        if (showLevelCodeCopy) {
            levelCodeCopyElem.style.display = "flex";
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
    }

    continueGame() {
        this.currentLevel = this.levelController.getCurrent();
        let levelNumber = this.currentLevel.levelNumber;

        this.#changeHeaderText((levelNumber < 10 ? '0'+levelNumber : levelNumber) + '-' + this.currentLevel.code[0]);
        this.#changeFooterElementsShowing(true, false);

        let onFinishSolvingDots = () => {
            if (this.currentLevel.isMax)
                this.levelController.progressNext();
            else
                this.levelController.goForward();
                
            this.continueGame();
        };

        if (this.currentLevel.hasMessage) { // has message
            let onFinishReadingMessages = () => {
                this.dotsController.loadSolve(this.currentLevel.code, onFinishSolvingDots);
                this.dotsController.animateExpand();
                this.#showFooter();
            };

            if (!this.dotsController.inactive)
                this.dotsController.animateShrink();
            this.messagesController.loadMessages(this.currentLevel.message, onFinishReadingMessages);
            this.#hideFooter();
        } else {
            this.dotsController.loadSolve(this.currentLevel.code, onFinishSolvingDots);
            this.dotsController.animateExpand();
        }
    }

    startNewGame() {
        this.levelController.resetProgress();
        this.continueGame();
    }

    createLevel() {
        this.messagesController.unloadMessages();
        this.#showFooter();
        this.#changeFooterElementsShowing(false, true);
        this.dotsController.loadCreate();
        this.dotsController.animateExpand();
    }

    loadLevel() {
        this.#changeFooterElementsShowing(false, false);
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
}