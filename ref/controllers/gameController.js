
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

    }

    loadLevel() {

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