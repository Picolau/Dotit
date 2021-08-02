import { i18n } from '../translate/i18n';

export default class {
    constructor() {
        this.hideAll();
    }

    showInfoScreen(type) {
        let showEndMessages = type == 'game';
        document.getElementById("back-text").innerText = i18n.t('infoScreen.backText.' + type)

        document.getElementById("info-screen").style.display = "block";
        document.getElementById("end-info-wrapper").style.display = showEndMessages ? "block" : "none";
    }

    hideInfoScreen() {
        document.getElementById("info-screen").style.display = "none";
        document.getElementById("end-info-wrapper").style.display = "none";
        document.getElementById("results-wrapper").style.display = "none";
        document.getElementById("results-container-message").style.display = "none";
        document.getElementById("results-container-success").style.display = "none";
    }

    hideFooter() {
        document.getElementById("footer").style.display = "none";
    }

    showFooter(showHints, showArrows, showLevelCodeCopy) {
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

        if (showHints) {
            hintElem.style.display = "block";
        }

        if (showArrows) {
            arrowLeftElem.style.display   = "block";
            arrowRightElem.style.display  = "block";
            levelNumberElem.style.display = "block";
        }

        if (showLevelCodeCopy) {
            levelCodeCopyElem.style.display = "flex";
        }

        document.getElementById("footer").style.display = "flex";
    }

    setHeaderText(text) {
        document.getElementById("header-info").innerHTML = text;  
    }
    
    setLevelText(text) {
        document.getElementById("level-number").innerText = text;
    }

    showResultsMessage(message) {
        document.getElementById("results-wrapper").style.display = "block";
        document.getElementById("results-container-message").style.display = "block";
        document.getElementById("results-message").innerText = message;
    }

    showResults(results) {
        document.getElementById("results-wrapper").style.display = "block";
        document.getElementById("results-container-success").style.display = "block";

        /** Primeiro card */
        document.getElementById("total-time").innerText = results.time.score;
        document.getElementById("total-time-others").innerText = ' / ' + results.time.scoreOthers;
        document.getElementById('time-percentage').innerText = results.time.betterThan;

        /** Segundo card */
        document.getElementById("total-retries").innerText = results.retries.score;
        document.getElementById("total-retries-others").innerText = ' / ' + results.retries.scoreOthers;
        document.getElementById("retries-percentage").innerText = results.retries.betterThan;
        
        /** Terceiro card */
        document.getElementById("total-hints").innerText = results.hints.score;
        document.getElementById("total-hints-others").innerText = ' / ' + results.hints.scoreOthers;
        document.getElementById("hints-percentage").innerText = results.hints.betterThan;
        
        /** Quarto card */
        document.getElementById("max-time-card").style.display = "none";
        if (results.time.max) {
            document.getElementById("max-time-card").style.display = "block";
            document.getElementById("max-time-level").innerText = results.time.max.level;
            document.getElementById("max-time").innerText = results.time.max.score;
        }

        /** Quinto card */
        document.getElementById("max-retries-card").style.display = "none";
        if (results.retries.max) {
            document.getElementById("max-retries-card").style.display = "block";
            document.getElementById("max-retries-level").innerText = results.retries.max.level;
            document.getElementById("max-retries").innerText = results.retries.max.score;
        }

        /** Sexto card */
        document.getElementById("max-hints-card").style.display = "none";
        if (results.hints.max) {
            document.getElementById("max-hints-card").style.display = "block";
            document.getElementById("max-hints-level").innerText = results.hints.max.level;
            document.getElementById("max-hints").innerText = results.hints.max.score;
        }
    }

    hideAll() {
        this.hideFooter();
        this.hideInfoScreen();
        this.setHeaderText("");
        this.setLevelText("");

        document.getElementById("load-level-code-container").style.display = "none";
    }
}
