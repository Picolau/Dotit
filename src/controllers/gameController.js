
const DotsController = require('./dotsController').default;
const MessagesController = require('./messagesController').default;
const LevelController = require('./levelController').default;
const HintsController = require('./hintsController').default;
const PerformanceController = require('./performanceController').default;

const GAME_STATE = {
    PLAYING_GAME: 'playing-game',
    PLAYING_LOAD: 'playing-load',
    PLAYING_CREATE: 'playing-create',
    PLAYING_CHALLENGE: 'playing-challenge',
}


import { } from '../index';
import { i18n } from '../translate/i18n';

export default class {
    constructor() {
        this.levelController       = new LevelController();
        this.hintsController       = new HintsController();
        this.messagesController    = new MessagesController();
        this.dotsController        = new DotsController();
        this.performanceController = new PerformanceController();

        this.#clearHeaderText();
    }

    #handleGameEnded() {
        let finalResults = localStorage.getItem("final-results");

        if (finalResults) {
            finalResults = JSON.parse(finalResults);
            this.#showInfoScreen(finalResults);
            return;
        }

        const levelsPerformance = this.performanceController.results();

        fetch('http://localhost:4100/results', {
            method: 'POST',
            body: levelsPerformance,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            response.json().then((resultsApi) => {
                const resultsMax = this.performanceController.resultsMax();
                const finalResults = {
                    time: {
                        score: resultsApi.time.myScore,
                        scoreOthers: resultsApi.time.meanScore,
                        betterThan: resultsApi.time.percent,
                        max: {
                            score: resultsMax.time.value,
                            level: resultsMax.time.level,
                        }
                    },
                    hints: {
                        score: resultsApi.hints.myScore,
                        scoreOthers: resultsApi.hints.meanScore,
                        betterThan: resultsApi.hints.percent,
                        max: {
                            score: resultsMax.hints.value,
                            level: resultsMax.hints.level,
                        }
                    },
                    retries: {
                        score: resultsApi.retries.myScore,
                        scoreOthers: resultsApi.retries.meanScore,
                        betterThan: resultsApi.time.percent,
                        max: {
                            score: resultsMax.retries.value,
                            level: resultsMax.retries.level,
                        }
                    },
                }

                localStorage.setItem("final-results", JSON.stringify(finalResults));
                this.#showInfoScreen(finalResults);
            })
        }).catch((error) => {
            this.#showInfoScreen(null);
        });
    }

    #hideInfoScreen() {
        document.getElementById("info-screen").style.display = "none";
    }

    #showInfoScreen(results) {
        function msToClock(timems) {
            let time = Math.round(timems / 1000);
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time % 3600) / 60);
            let seconds = Math.floor((time % 60));

            let clock = ''
            
            if (hours > 0) {
                clock += hours < 10 ? '0' + hours : '' + hours;
                clock += 'h:';
            }
            
            clock += minutes < 10 ? '0' + minutes : '' + minutes;
            clock += 'm:';
            clock += seconds < 10 ? '0' + seconds : '' + seconds;
            clock += 's';

            return clock;
        }

        function percToStr(perc) {
            return (Math.round(perc*1000)/10)+"%";
        }

        this.clearScreen();

        document.getElementById("info-screen").style.display = "block";
        document.getElementById("end-info-wrapper").style.display = "block";
        document.getElementById("results-container-success").style.display = "block";
        // document.getElementById("results-container-error").style.display = "block";
        
        // if (!results) {
        //     document.getElementById("results-container-success").style.display = "none";
        //     return;
        // }
        
        document.getElementById("results-container-error").style.display = "none";

        // /** Primeiro card */
        // document.getElementById("total-time-card").style.display = "block";
        // document.getElementById("total-time").innerText = msToClock(results.time.score);
        // document.getElementById("total-time-others").innerText = ' / ' + msToClock(results.time.scoreOthers);
        // document.getElementById("time-percentage").innerText = percToStr(results.time.betterThan);

        // /** Segundo card */
        // document.getElementById("total-retries-card").style.display = "block";
        // document.getElementById("total-retries").innerText = results.retries.score;
        // document.getElementById("total-retries-others").innerText = ' / ' + Math.round(results.retries.scoreOthers);
        // document.getElementById("retries-percentage").innerText = percToStr(results.retries.betterThan);
        
        // /** Terceiro card */
        // document.getElementById("total-hints-card").style.display = "block";
        // document.getElementById("total-hints").innerText = results.hints.score;
        // document.getElementById("total-hints-others").innerText = ' / ' + Math.round(results.hints.scoreOthers);
        // document.getElementById("hints-percentage").innerText = percToStr(results.hints.betterThan);
        
        // /** Quarto card */
        // document.getElementById("max-time-card").style.display = "block";
        // document.getElementById("max-time-level").innerText = results.time.max.level;
        // document.getElementById("max-time").innerText = msToClock(results.time.max.score);

        // /** Quinto card */
        // document.getElementById("max-retries-card").style.display = "block";
        // document.getElementById("max-retries-level").innerText = results.retries.max.level;
        // document.getElementById("max-retries").innerText = results.retries.max.score;

        // /** Sexto card */
        // document.getElementById("max-hints-card").style.display = "block";
        // document.getElementById("max-hints-level").innerText = results.hints.max.level;
        // document.getElementById("max-hints").innerText = results.hints.max.score;
        
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
            let headerInfoHTML  = "<span>" + i18n.t('info.extra') + ": </span>";
                headerInfoHTML += extraClicksText;
                headerInfoHTML += "<span>" + i18n.t('info.tips') + ": </span>";
                headerInfoHTML += totalHintsText;

            document.getElementById("header-info").innerHTML = headerInfoHTML;
            document.getElementById("level-number").innerText = levelNumberText;
        } else if (this.state === GAME_STATE.PLAYING_CREATE) {
            document.getElementById("header-info").innerText = i18n.t('info.free');  
            document.getElementById("level-number").innerText = "";
        } else if (this.state === GAME_STATE.PLAYING_LOAD || this.state === GAME_STATE.PLAYING_CHALLENGE) {
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

            if (this.currentLevel.isMax)
                this.performanceController.incHints(this.currentLevel.code);
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
        if (this.state === GAME_STATE.PLAYING_GAME) {
            this.dotsController.reload();
            if (this.currentLevel.isMax)
                this.performanceController.incRetries(this.currentLevel.code);
        } else {
            let forceReload = true;
            this.dotsController.reload(forceReload);
        }

        this.#updateLevelInfo();
    }

    continueGame() {
        if (!this.levelController.progressEnded()) {
            this.state = GAME_STATE.PLAYING_GAME;
            this.currentLevel = this.levelController.getCurrent();
            this.#changeFooterElementsShowing(true, false);

            let onFinishSolvingDots = () => {
                if (this.currentLevel.isMax) {
                    this.performanceController.setClockEnd(this.currentLevel.code);
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

                if (this.currentLevel.isMax)
                    this.performanceController.setClockStart(this.currentLevel.code);
            };

            if (this.currentLevel.hasMessage) { // has message
                let onFinishReadingMessages = loadDots;

                this.dotsController.animateShrink();
                this.messagesController.loadMessages(this.currentLevel.message, onFinishReadingMessages);
                this.#hideFooter();
            } else {
                loadDots();
            }
        }

        if (this.levelController.progressEnded()) {
            this.#handleGameEnded();
        }
    }

    replayTutorial() {
        this.performanceController.reset();
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

    loadLevel(levelCode) {
        this.state = GAME_STATE.PLAYING_LOAD;

        let onConnectionMade = () => {
            this.#updateLevelInfo();
        };

        if (this.dotsController.loadSolve(levelCode, null, onConnectionMade)) {
            this.dotsController.waitingLoad = false;
            this.dotsController.animateExpand();
            this.#changeFooterElementsShowing(false, false);
            this.#showFooter();
            this.#updateLevelInfo();
            return true;
        }
        
        this.dotsController.waitingLoad = true;
        return false;
    }

    loadDailyChallenges() {
        this.state = GAME_STATE.PLAYING_CHALLENGE;

        let onConnectionMade = () => {
            this.#updateLevelInfo();
        };

        fetch('http://localhost:4100/levels/daily-challenge', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            response.json().then((level) => {
                let code = level._id;
                this.dotsController.loadSolve(code, null, onConnectionMade)
                this.dotsController.waitingLoad = false;
                this.dotsController.animateExpand();
                this.#changeFooterElementsShowing(false, false);
                this.#showFooter();
                this.#updateLevelInfo();
            })
        });
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
        this.#hideInfoScreen();
        this.#clearHeaderText();
        document.getElementById("load-level-code-container").style.display = "none";
    }
}