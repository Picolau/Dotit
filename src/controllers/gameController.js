
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

import { } from '../index';
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

    #syncApi(type) {
        let stored = this.performanceController.getStored(type);
        let alreadySynced = stored.length == 0;

        let promise = alreadySynced ? Promise.resolve() : new Promise((resolve, reject) => {
            this.apiController.requestId().then((id) => {
                if (type === 'game') {
                    let performances = stored;
                    return this.apiController.sendGamePerformances(performances);
                } 
                if (type === 'challenge') {
                    let performance = stored[0];
                    return this.apiController.sendChallengePerformance(performance);
                }
                return Promise.reject("Invalid type");
            }).then(() => {
                this.performanceController.resetStored(type);
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });

        return promise;
    }

    loadResults(type) {
        if (this.loadingResults) return;

        this.loadingResults = true;
        const MIN_TIME = 2500;
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));    
        let start = Date.now();
        this.domController.showResultsMessage(i18n.t('messages.api.syncingPerformances'));
        this.#syncApi(type).then(() => {
            let elapsed = Date.now() - start;
            let ms = Math.max(0, MIN_TIME - elapsed);
            return wait(ms);
        }).then(() => {
            start = Date.now();
            this.domController.showResultsMessage(i18n.t('messages.api.fetchingResults'));
            return this.apiController.requestResults(type);
        }).then(results => {
            let elapsed = Date.now() - start;
            let ms = Math.max(0, MIN_TIME - elapsed);
            wait(ms).then(() => {
                this.domController.showResultsMessage(i18n.t('messages.api.resultsSuccess'));
                this.domController.showResults(results);
                this.loadingResults = false;
            });
        }).catch((errMessage) => {
            this.loadingResults = false;
            this.domController.showResultsMessage(i18n.t('messages.api.resultsError'));
        });
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
            this.domController.showInfoScreen(true);
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
                if (this.levelController.progressNext())
                    this.#syncApi('game').catch((err) => {});
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
            this.domController.showInfoScreen(false);
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
                this.domController.showInfoScreen(false);
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