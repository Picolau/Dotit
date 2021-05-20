
const NUM_LEVELS_TUTORIAL = 15;

import levels from '../levels';
import { i18n } from '../translate/i18n'

export default class {
    constructor() {
        let levelIndex = localStorage.getItem("level");
        this.storageLevelIndex = levelIndex ? parseInt(levelIndex) : 0;
        this.currentLevelIndex = this.storageLevelIndex;
    }

    getCurrent() {
        let level = levels[this.currentLevelIndex]
        let levelObj = {
            hasMessage: level.length == 2,
            code: level[0],
            message: i18n.t(level[1]),
            levelNumber: this.currentLevelIndex+1,
            isMax: this.currentLevelIndex == this.storageLevelIndex
        }
        return levelObj;
    }

    progressNext() {
        this.storageLevelIndex++;
        this.currentLevelIndex++;
        localStorage.setItem("level", this.storageLevelIndex);
    }

    goBackward() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
        }
    }

    goForward() {
        if (this.currentLevelIndex < this.storageLevelIndex) {
            this.currentLevelIndex++;
        }
    }

    resetProgress() {
        this.storageLevelIndex = 0;
        this.currentLevelIndex = 0;
        localStorage.setItem("level", 0);
        return this.getCurrent();
    }

    progressEnded() {
        return this.storageLevelIndex >= levels.length;
    }
}