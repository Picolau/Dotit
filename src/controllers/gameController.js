
const DotsController = require('./dotsController').default;
const DomController = require('./domController').default;
const MessagesController = require('./messagesController').default;
const LevelController = require('./levelController').default;
const HintsController = require('./hintsController').default;
const PerformanceController = require('./performanceController').default;
const ApiController = require('./apiController').default;

const GAME_STATE = {
    PLAYING_GAME: 'playing-game',
    PLAYING_LOAD: 'playing-load',
    PLAYING_CREATE: 'playing-create',
    PLAYING_CHALLENGE: 'playing-challenge',
}

const INACTIVITY_MAX_TIME = 1000 * 60 * 10

import { secureStorage } from '../index';
import { i18n } from '../translate/i18n';

export default class {
    constructor() {
        this.apiController         = new ApiController();
        this.levelController       = new LevelController();
        this.hintsController       = new HintsController();
        this.messagesController    = new MessagesController();
        this.dotsController        = new DotsController();
        this.performanceController = new PerformanceController();
        this.domController         = new DomController();
    }

    async #syncApi(type) {
        let stored = this.performanceController.getStored(type);
        let alreadySynced = stored.length == 0;

        if (!alreadySynced) {
            try {
                await this.apiController.requestId()

                if (type === 'game') {
                    let performances = stored;
                    await this.apiController.sendGamePerformances(performances);
                } else if (type === 'challenge') {
                    let performance = stored[0];
                    await this.apiController.sendChallengePerformance(performance);
                }

                this.performanceController.resetStored(type);
            } catch (e) {
                return;
            }
        }
    }

    async #authCaptcha() {
        const getCaptcha = new Promise((resolve, reject) => {
            document.getElementById("captcha-1").innerHTML = "";
            setTimeout(() => {
                hcaptcha.render("captcha-1", {
                    "callback": (response) => {resolve(response)},
                    "error-callback": () => {reject()},
                    "close-callback": () => {reject()},
                    "size": "normal",
                    "sitekey": "cd5b4897-aa1f-432c-bdbd-6c2d7cb02f27"
                });
            }, 200);
        });
        
        try {
            let captchaResponse = await getCaptcha;
            await this.apiController.requestId()
            let success = await this.apiController.authPlayer(captchaResponse)
            secureStorage.setItem('player-is-human', success)
            return success;
        } catch (e) {
            return false;
        }
    }

    async loadResults(type) {
        if (this.loadingResults) return;

        try {
            let playerIsHuman = secureStorage.getItem('player-is-human')
            if (!playerIsHuman) {
                this.domController.showResultsMessage(i18n.t('messages.api.performCaptcha'));
                let success = await this.#authCaptcha() 
                while (!success) {
                    this.domController.showResultsMessage(i18n.t('messages.api.errorCaptcha'));
                    success = await this.#authCaptcha() 
                }
            }

            const sleep = start => new Promise(resolve => setTimeout(resolve, Math.max(0, 2500 - (Date.now() - start))));    
            this.loadingResults = true;
            let start = Date.now();
            this.domController.showResultsMessage(i18n.t('messages.api.syncingPerformances'));
            await this.#syncApi(type)
            await sleep(start);

            start = Date.now();
            this.domController.showResultsMessage(i18n.t('messages.api.fetchingResults'));
            const results = await this.apiController.requestResults(type);
            await sleep(start);
            
            this.domController.showResultsMessage(i18n.t('messages.api.resultsSuccess'));
            this.domController.showResults(results);
            this.loadingResults = false;
            document.getElementById("captcha-1").innerHTML = "";
        } catch (err) {
            this.loadingResults = false;
            this.domController.showResultsMessage(i18n.t('messages.api.resultsError'));
        }
    }

    #updateLevelInfo() {
        let headerText = "";
        let levelText = "";

        if (this.state === GAME_STATE.PLAYING_GAME) {
            let levelNumber = this.currentLevel.number;
            let extraClicksText = (this.dotsController.maxClicks - this.dotsController.clicksConsumed) + " ";
            let totalHintsText = this.hintsController.getTotal()+"";
            
            levelText = (levelNumber < 10 ? '0' + levelNumber : levelNumber);
            headerText += "<span>" + i18n.t('info.extra') + ": </span>";
            headerText += extraClicksText;
            headerText += "<span>" + i18n.t('info.tips') + ": </span>";
            headerText += totalHintsText;
        } else if (this.state === GAME_STATE.PLAYING_CREATE) {
            headerText = i18n.t('info.free');  
            levelText = "";
        } else if (this.state === GAME_STATE.PLAYING_LOAD) {
            let extraClicksText = '' + (this.dotsController.maxClicks - this.dotsController.clicksConsumed);
            headerText  = "<span>Extra: </span>";
            headerText += extraClicksText;
            levelText = "";
        } else if (this.state === GAME_STATE.PLAYING_CHALLENGE) {
            let extraClicksText = (this.dotsController.maxClicks - this.dotsController.clicksConsumed) + ' ';
            headerText += "<span>" + i18n.t('info.extra') + ": </span>";
            headerText += extraClicksText;
            headerText += "<span>" + i18n.t('info.tips') + ": </span>";
            headerText += '99';
        }

        this.domController.setHeaderText(headerText);
        this.domController.setLevelText(levelText);
    }

    useHint() {
        if (this.state === GAME_STATE.PLAYING_CHALLENGE) {
            this.performanceController.incHints('challenge');
            this.dotsController.showNextHint();
        } else if (this.state === GAME_STATE.PLAYING_GAME && this.hintsController.hasAny()) {
            this.hintsController.useOne();
            this.dotsController.showNextHint();
            this.#updateLevelInfo();
            if (this.currentLevel.isMax)
                this.performanceController.incHints('game');
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

    refreshResults() {
        if (this.state === GAME_STATE.PLAYING_GAME) {
            this.loadResults('game');
        } else if (this.state === GAME_STATE.PLAYING_CHALLENGE) { 
            this.loadResults('challenge');
        }
    }

    backToLevels() {
        if (this.state === GAME_STATE.PLAYING_CHALLENGE) {
            let loadLocal = true;
            this.loadDailyChallenge(loadLocal);
        } else {
            this.goToPrevLevel();
        }
    }

    reloadLevel() {
        if (this.state === GAME_STATE.PLAYING_GAME) {
            this.dotsController.reload();
            if (this.currentLevel.isMax)
                this.performanceController.incRetries('game');
        } else if (this.state === GAME_STATE.PLAYING_CHALLENGE) {
            this.dotsController.reload();
            this.performanceController.incRetries('challenge');
        } else {
            let forceReload = true;
            this.dotsController.reload(forceReload);
        }

        this.#updateLevelInfo();
    }

    continueGame() {
        this.state = GAME_STATE.PLAYING_GAME;
        
        if (this.levelController.progressEnded()) {
            this.clearScreen();
            this.domController.showInfoScreen('game');
            this.loadResults('game');
            return;
        }
        
        this.currentLevel = this.levelController.getCurrent();

        let onFinishSolvingDots = () => {
            if (this.currentLevel.isMax) {
                this.performanceController.endClock('game');
                this.performanceController.store('game');
                if (this.currentLevel.number % 3 == 0)
                    this.hintsController.addOne();
                this.levelController.progressNext()
                // if (this.levelController.progressNext())
                //     this.#syncApi('game')
            } else {
                this.levelController.goForward();
            }

            this.continueGame();
        };

        this.inactiveTimeout = setTimeout(() => {this.playerInactive = true}, INACTIVITY_MAX_TIME);
        let onConnectionMade = () => {
            if (this.playerInactive)
                this.performanceController.startClock('game', INACTIVITY_MAX_TIME);
            
            this.playerInactive = false;
            clearTimeout(this.inactiveTimeout)
            this.inactiveTimeout = setTimeout(() => {this.playerInactive = true}, INACTIVITY_MAX_TIME);
            
            this.#updateLevelInfo();
        }

        let loadDots = () => {
            this.dotsController.loadSolve(this.currentLevel.code, onFinishSolvingDots, onConnectionMade);
            this.dotsController.animateExpand();
            this.domController.showFooter(true, true, false);
            this.#updateLevelInfo();

            if (this.currentLevel.isMax) {
                this.performanceController.set('game', this.currentLevel);
                this.performanceController.startClock('game');
            }
        };

        if (this.currentLevel.hasMessage) { // has message
            let p = Promise.resolve();
            let messages = this.currentLevel.message.split(';');
            this.dotsController.animateShrink();
            this.domController.hideFooter();
            this.messagesController.prepare(messages, i18n.t('messages.tapContinue'));
            for (let i = 0;i < messages.length; i++)
                p = p.then(_ => this.messagesController.showNext());
            p.then(() => {
                this.messagesController.showNext(true)
                this.messagesController.onRead(loadDots);
            });
        } else {
            loadDots();
        }
    }

    replayTutorial() {
        this.levelController.goTo(0);
        this.continueGame();
    }

    createLevel() {
        document.getElementById('level-code').innerText = "";

        let onConnectionMade = () => {
            document.getElementById('level-code').innerText = this.dotsController.encodeConnections();
        }

        this.state = GAME_STATE.PLAYING_CREATE;
        this.dotsController.loadCreate(onConnectionMade);
        this.dotsController.animateExpand();
        this.domController.showFooter(false, false, true);
        this.#updateLevelInfo();
    }

    loadLevel(levelCode) {
        this.state = GAME_STATE.PLAYING_LOAD;

        let onConnectionMade = () => {
            this.#updateLevelInfo();
        };

        if (this.dotsController.loadSolve(levelCode, null, onConnectionMade)) {
            this.dotsController.waitingLoad = false;
            this.dotsController.animateExpand();
            this.domController.showFooter(false, false, false);
            this.#updateLevelInfo();
            return true;
        }
        
        this.dotsController.waitingLoad = true;
        return false;
    }

    loadDailyChallenge(loadLocal) {
        this.state = GAME_STATE.PLAYING_CHALLENGE;

        let onConnectionMade = () => {
            this.#updateLevelInfo();
        };

        let onFinishSolvingDots = () => {
            if (!loadLocal) {
                this.performanceController.endClock('challenge');
                this.performanceController.store('challenge');
            }
            this.clearScreen();
            this.domController.showInfoScreen('challenge');
            this.loadResults('challenge');
        };

        if (loadLocal) {
            let local = this.performanceController.get('challenge');
            this.dotsController.loadSolve(local.level.code, onFinishSolvingDots, onConnectionMade)
            this.dotsController.waitingLoad = false;
            this.dotsController.animateExpand();
            this.domController.showFooter(true, false, false);
            this.#updateLevelInfo();
            return;
        }

        this.messagesController.prepare([
            i18n.t('messages.dailyChallenge.fetching'),
            i18n.t('messages.dailyChallenge.successFetching')
        ], i18n.t('messages.tapContinue'))
        let messagePromise = this.messagesController.showNext();

        this.apiController.requestDailyChallenge().then((level) => {
            const playChallenge = () => {
                level.id = level._id;
                this.performanceController.set('challenge', level);
                this.performanceController.startClock('challenge');
                this.dotsController.loadSolve(level.code, onFinishSolvingDots, onConnectionMade)
                this.dotsController.waitingLoad = false;
                this.dotsController.animateExpand();
                this.domController.showFooter(true, false, false);
                this.#updateLevelInfo();
            }

            let localLevel = this.performanceController.get('challenge');
            let levelIsLocal = localLevel.level.id == level._id;
            let solvedLocal = !!localLevel.end;

            if (levelIsLocal && solvedLocal) {
                this.clearScreen();
                this.domController.showInfoScreen('challenge');
                this.loadResults('challenge');
            } else {
                messagePromise
                .then(_ => this.messagesController.showNext()) // show success
                .then(_ => {
                    this.messagesController.showNext();  // show tapContinue
                    this.messagesController.onRead(playChallenge);
                });
            }
        }).catch(() => {
            this.messagesController.set(1, i18n.t('messages.dailyChallenge.errorFetching'), false);
            this.messagesController.set(0, i18n.t('messages.tapTryAgain'), true);
            messagePromise
            .then(_ => this.messagesController.showNext()) // show error
            .then(_ => {
                this.messagesController.showNext();
                this.messagesController.onRead(() => {
                    this.loadDailyChallenge();
                });
            }); // show tapTryAgain
        })
    }

    updateAndDraw() {
        this.dotsController.updateAndDraw();
    }

    handleResize() {
        this.dotsController.repositionDots();
    }

    clearScreen() {
        this.dotsController.animateShrink();
        this.messagesController.clear();
        this.domController.hideAll();
    }

    finishedPlaying() {
        return this.levelController.progressEnded();
    }
}