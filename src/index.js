import './styles/index.css';
import * as p5 from './lib/p5.js';
import { i18n } from './translate/i18n'

window.mobileCheck = function () {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

let backgroundController;
let gameController;
let animationsController;
let globalEnv = {
  isDevice: window.mobileCheck(),
};

const BackgroundController = require('./background/background').default;
const GameController = require('./controllers/gameController').default;
const AnimationsController = require('./controllers/animationsController').default;

let p5Sketch = (sk) => {
  sk.setup = () => {
    translateDocument();
    globalEnv.screenSizeFactor = Math.sqrt(Math.pow(sk.windowWidth, 2) + Math.pow(sk.windowWidth, 2)) / Math.sqrt(1600 * 1600 + 900 * 900)
    animationsController = new AnimationsController();
    backgroundController = new BackgroundController();
    gameController = new GameController();
    decideGameStateAndStart();
    sk.frameRate(61);
  }

  sk.draw = () => {
    backgroundController.updateAndDraw();
    gameController.updateAndDraw();
    animationsController.updateAndDraw();
  }

  sk.windowResized = () => {
    sk.resizeCanvas(sk.windowWidth, sk.windowHeight);

    animationsController?.clearAnimations(true);
    backgroundController?.handleResize();
    gameController?.handleResize();

    updateFullscreenIcon();
  }
}

const P5 = new p5(p5Sketch);

window.onload = () => {
  // close menu when click outside menu
  document.addEventListener("click", (event) => {
    let menuContainerDiv = document.getElementById("menu-container");
    let isMenuActive = menuContainerDiv.style.display != "none";
    let clickedOutsideMenu = true;
    for (let i = 0; i < event.path.length; i++) {
      let elem = event.path[i];
      if (elem.id == 'menu-container') {
        clickedOutsideMenu = false;
        break;
      }
    }
    if (isMenuActive && clickedOutsideMenu) {
      hideMenu();
      event.stopPropagation();
    }
  });
  document.getElementById("menu-icon").onclick = (event) => {
    showMenu();
    event.stopPropagation();
  };

  document.getElementById("fullscreen-icon").onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => {
        updateFullscreenIcon();
      });
    } else {
      document.exitFullscreen().then(() => {
        updateFullscreenIcon();
      });
    }
  }

  document.getElementById("hint-icon").onclick = (event) => {
    gameController.useHint();
  };
  document.getElementById("arrow-left-icon").onclick = (event) => {
    gameController.goToPrevLevel();
  };
  document.getElementById("arrow-right-icon").onclick = (event) => {
    gameController.goToNextLevel();
  }
  document.getElementById("retry-icon").onclick = (event) => {
    gameController.reloadLevel()
  }
  document.getElementById('copy-icon').addEventListener('click', () => {
    copyTextToClipboard(document.getElementById('level-code').innerText);
  })

  document.addEventListener('contextmenu', event => event.preventDefault());
  document.getElementById('menu-item-continue').onclick = () => {
    gameController.clearScreen();
    gameController.levelController.goToMax();
    gameController.continueGame();
    hideMenu();
  };
  document.getElementById('menu-item-tutorial').onclick = () => {
    gameController.clearScreen();
    gameController.replayTutorial();
    hideMenu();
  };
  document.getElementById('menu-item-challenge').onclick = () => {
    gameController.clearScreen();
    gameController.loadDailyChallenge();
    hideMenu();
  };
  document.getElementById('menu-item-create').onclick = () => {
    gameController.clearScreen();
    gameController.createLevel();
    hideMenu();
  };
  document.getElementById('menu-item-load').onclick = () => {
    gameController.clearScreen();
    document.getElementById("load-level-code-container").style.display = "flex";
    document.getElementById('code-input').value = "";
    document.getElementById('code-input').onchange = () => {
      let codeFromInput = document.getElementById('code-input').value
      if (gameController.loadLevel(codeFromInput))
        document.getElementById("load-level-code-container").style.display = "none";
      else
        document.getElementById("load-level-message").innerHTML = i18n.t('messages.loadLevel.error');
    };
    document.getElementById("load-level-message").innerHTML = i18n.t('messages.loadLevel.info');

    hideMenu();
  };
  document.getElementById('menu-item-color').onclick = () => {
    document.getElementById('color-picker').click();
  };
  document.getElementById('color-picker').addEventListener('input', () => {
    backgroundController.changeBackgroundColor(document.getElementById('color-picker').value);
  });
  document.getElementById("back-to-levels-button").onclick = () => {
    gameController.clearScreen();
    gameController.backToLevels();
  }
  document.getElementById("refresh-results-button").onclick = () => {
    gameController.refreshResults();
  }
}

function decideGameStateAndStart() {
  let levelCodeURL = window.location.pathname.substring(1)
  if (levelCodeURL) {
    if (!gameController.loadLevel(levelCodeURL)) {
      gameController.clearScreen();
      document.getElementById("load-level-code-container").style.display = "flex";
      document.getElementById('code-input').value = levelCodeURL;
      document.getElementById("load-level-message").innerHTML = i18n.t('messages.loadLevel.error');
      document.getElementById('code-input').onchange = () => {
        let codeFromInput = document.getElementById('code-input').value
        if (gameController.loadLevel(codeFromInput))
          document.getElementById("load-level-code-container").style.display = "none";
      };
    }
    return;
  }

  gameController.continueGame();
}

function updateFullscreenIcon() {
  if (document.fullscreenElement) {
    document.getElementById("fullscreen-icon").src = "./images/minimize.svg";
  } else {
    document.getElementById("fullscreen-icon").src = "./images/fullscreen.svg";
  }
}

function translateDocument() {
  /** Translate menu */
  document.getElementById("menu-item-continue")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.continue')

  document.getElementById("menu-item-tutorial")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.tutorial')

  document.getElementById("menu-item-challenge")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.challenge')

  document.getElementById("menu-item-create")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.create')

  document.getElementById("menu-item-load")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.load')

  document.getElementById("menu-item-color")
  .getElementsByClassName("menu-item-desc")[0].innerText = i18n.t('menu.color')

  /* Translate end screen */
  document.getElementById("congratulations-text").innerText = i18n.t('infoScreen.congratulationsText');
  document.getElementById("congratulations-1").innerText = i18n.t('infoScreen.congratulations1')
  document.getElementById("congratulations-2").innerText = i18n.t('infoScreen.congratulations2')
  document.getElementById("congratulations-3").innerText = i18n.t('infoScreen.congratulations3')

  document.getElementById("back-text").innerText = i18n.t('infoScreen.backText')
  document.getElementById("refresh-text").innerText = i18n.t('infoScreen.refreshText')
  document.getElementById("results-text").innerText = i18n.t('infoScreen.resultsText')
  document.getElementById("results-message").innerText = i18n.t('infoScreen.resultsErrorMessage')
  document.getElementById("you-others-text").innerText = i18n.t('infoScreen.youOthersText')
  document.getElementById("total-time-text").innerText = i18n.t('infoScreen.totalTimeText')
  document.getElementById("total-retries-text").innerText = i18n.t('infoScreen.totalRetriesText')
  document.getElementById("total-hints-text").innerText = i18n.t('infoScreen.totalHintsText')

  document.getElementById("time-better-than").innerHTML = i18n.t('infoScreen.betterThan') + " <span id='time-percentage'></span> " + i18n.t('infoScreen.ofPeople')
  document.getElementById("retries-better-than").innerHTML = i18n.t('infoScreen.betterThan') + " <span id='retries-percentage'></span> " + i18n.t('infoScreen.ofPeople')
  document.getElementById("hints-better-than").innerHTML = i18n.t('infoScreen.betterThan') + " <span id='hints-percentage'></span> " + i18n.t('infoScreen.ofPeople')

  document.getElementById("max-time-text").innerHTML = i18n.t('infoScreen.theLevel') + " <span id='max-time-level'></span> " + i18n.t('infoScreen.maxTimeText') 
  document.getElementById("max-retries-text").innerHTML = i18n.t('infoScreen.theLevel') + " <span id='max-retries-level'></span> " + i18n.t('infoScreen.maxRetriesText') 
  document.getElementById("max-hints-text").innerHTML = i18n.t('infoScreen.theLevel') + " <span id='max-hints-level'></span> " + i18n.t('infoScreen.maxHintsText') 
  
  document.getElementById("curiosities-text").innerText = i18n.t('infoScreen.curiositiesText');
  document.getElementById("curiosities-info").innerText = i18n.t('infoScreen.curiositiesInfo')
  document.getElementById("curiosities-1").innerHTML = "<span>1. </span>" + i18n.t('infoScreen.curiosities1')
  document.getElementById("curiosities-2").innerHTML = "<span>2. </span>" + i18n.t('infoScreen.curiosities2')
  document.getElementById("curiosities-3").innerHTML = "<span>3. </span>" + i18n.t('infoScreen.curiosities3')
  document.getElementById("curiosities-4").innerHTML = "<span>4. </span>" + i18n.t('infoScreen.curiosities4')
}

function hideMenu() {
  let menuContainerDiv = document.getElementById("menu-container");
  menuContainerDiv.style.opacity = 0;
  setTimeout(function () {
    menuContainerDiv.style.display = "none";
  }, 500)

  if (window.location.pathname.substring(1) != "")
    window.history.pushState({}, document.title, "/");
  else
    window.history.replaceState({}, document.title, "/");
}

function showMenu() {
  let menuContainerDiv = document.getElementById("menu-container");
  menuContainerDiv.style.display = "flex";
  setTimeout(function () {
    menuContainerDiv.style.opacity = 1;
  }, 50)
}

let displayingClipboardMessage = false;

function displayClipboardMessage(levelCode, successCopying) {
  if (!displayingClipboardMessage) {
    if (successCopying)
      document.getElementById("level-code").innerText = i18n.t("messages.clipboard.success");
    else
      document.getElementById("level-code").innerText = i18n.t("messages.clipboard.error");
    displayingClipboardMessage = true;
    setTimeout(function () {
      document.getElementById("level-code").innerText = levelCode;
      displayingClipboardMessage = false;
    }, 2000);
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    if (document.execCommand('copy')) {
      displayClipboardMessage(text, true);
    } else {
      displayClipboardMessage(text, false);
    }
  } catch (err) {
    displayClipboardMessage(text, false);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    displayClipboardMessage(text, true);
  }, function (err) {
    displayClipboardMessage(text, false);
  });
}

export {
  P5,
  backgroundController,
  animationsController,
  globalEnv
};
