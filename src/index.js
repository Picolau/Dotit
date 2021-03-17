import './styles/index.css';
import * as p5 from './lib/p5.js';

const BackgroundController = require('./background/background').default;
const LevelController = require('./controllers/levelController').default;
const AnimationsController = require('./controllers/animationsController').default;

//const BackgroundController = require('./background/background').default;
/*let dots_controller;
let bg_controller;
let current_level;
let game_animations;
let my_scale;
let menu_state;
*/

const MOUSE_RIGHT_BUTTON = 2;
const MENU_STATE = {
  PLAYING: "playing",
  CREATING: "creating",
  LOADING: "loading",
}
const animations_controller = new AnimationsController();

let bg_controller, level_controller;
let menu_state, my_scale;
let s = (sk) => {
  sk.setup = () => {
    menu_state = MENU_STATE.PLAYING;
    my_scale = ((sk.windowWidth + sk.windowHeight)/(sk.displayWidth + sk.displayHeight));

    bg_controller = new BackgroundController(75);
    level_controller = new LevelController();
  }

  sk.draw = () => {
    bg_controller.update_and_draw();
    level_controller.update_and_draw();
    animations_controller.update_and_draw();
  }

  sk.windowResized = () => {
    sk.resizeCanvas(sk.windowWidth, sk.windowHeight);
    my_scale = ((sk.windowWidth + sk.windowHeight)/(sk.displayWidth + sk.displayHeight));
    level_controller.handle_resize();
  }

  sk.keyPressed = () => {
    let min_level = 15; // corresponds to tutorial
  
    if (sk.keyCode === sk.LEFT_ARROW) {
      if (level_controller.level > min_level) {
        level_controller.level -= 1;
        level_controller.load_level();
      }
    } else if (sk.keyCode === sk.RIGHT_ARROW) {
      let max_level = parseInt(localStorage.getItem('level'));
  
      if (level_controller.level >= min_level && level_controller.level < max_level) {
        level_controller.level += 1;
        level_controller.load_level();
      }
    }
  }

  sk.mousePressed = (event) => {
    if (event.button === MOUSE_RIGHT_BUTTON) {
      level_controller.reload_dots();
  
      if (menu_state === MENU_STATE.CREATING)
        document.getElementById("code-input").value = "";
    }
  }
}

const P5 = new p5(s);

window.onload = () => {
  document.addEventListener('contextmenu', event => event.preventDefault());
  document.getElementById('menu-item-continue').onclick = () => handleMenuItemClick('continue');
  document.getElementById('menu-item-new').onclick = () => handleMenuItemClick('new');
  document.getElementById('menu-item-create').onclick = () => handleMenuItemClick('create');
  document.getElementById('menu-item-load').onclick = () => handleMenuItemClick('load');

  document.getElementById('code-input').onchange= updateLevelFromCodeInputText;

  document.getElementById('clipboard-img').onmouseout = reset_clipboard_tooltip_text;
  document.getElementById('clipboard-img').onclick = copy_code_to_clipboard;

  let color_picker = document.getElementById('color-picker')
  color_picker.addEventListener('input', () => {
    bg_controller.changeBackgroundColor(color_picker.value);
  });
}

function handleMenuItemClick(item) {
  console.log(item);
  let function_on_end;
  let code_div = document.getElementById("code");
  let code_input = document.getElementById("code-input");
  let div_clipboard = document.getElementById("code-copy");

  code_input.value = "";

  if (item === 'continue') {
    function_on_end = () => {level_controller.load_current_level()};
    code_div.style.top = '-35px';
    code_div.style.opacity = '0';
    menu_state = MENU_STATE.PLAYING;
  } else if (item === 'new') {
    localStorage.setItem('level', 0);
    function_on_end = () => {level_controller.load_current_level()};
    code_div.style.top = '-35px';
    code_div.style.opacity = '0';
    menu_state = MENU_STATE.PLAYING;
  } else if (item === 'create') {
    function_on_end = () => {level_controller.load_creation_level()}
    code_div.style.top = '3%';
    code_div.style.opacity = '1';
    code_input.disabled = true;
    code_input.placeholder = ""
    div_clipboard.style.display = 'block';
    menu_state = MENU_STATE.CREATING;
  } else if (item === 'load') {
    function_on_end = () => {}
    code_div.style.top = '3%';
    code_div.style.opacity = '1';
    code_input.disabled = false;
    code_input.placeholder = "Paste your level-code here :). Ex.: 0231101000102"
    div_clipboard.style.display = 'none'
    menu_state = MENU_STATE.LOADING;
  }

  level_controller.clear_level(function_on_end);
}

function copy_code_to_clipboard() {
  let input_value = document.getElementById("code-input").value;
  navigator.clipboard.writeText(input_value).then(function() {
    document.getElementById("clipboard-tooltip").innerHTML = "Copied!"
  });
}

function reset_clipboard_tooltip_text() {
  document.getElementById("clipboard-tooltip").innerHTML = "Copy to clipboard"
}

function updateLevelFromCodeInputText() {
  let code_input = document.getElementById("code-input");

  if (code_input.value) {
    let level_structure = [code_input.value, ""];
    level_controller.load_level(level_structure);
  }
}

export {
  P5,
  animations_controller,
  my_scale,
  menu_state,
  MENU_STATE,
  bg_controller
};