let dots_controller;
let bg_controller;
let current_level;
let game_animations;
let my_scale;
let menu_state;

const KEY_SPACE = 32;
const MOUSE_RIGHT_BUTTON = 2;
const MENU_STATE = {
  PLAYING: "playing",
  CREATING: "creating",
  LOADING: "loading",
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  my_scale = ((windowWidth + windowHeight)/(displayWidth + displayHeight));
  menu_state = MENU_STATE.PLAYING;

  animations_controller = new AnimationsController();
  level_controller = new LevelController();
  bg_controller = new BackgroundController(75); 
}

function draw() {
  bg_controller.update_and_draw();
  level_controller.update_and_draw();
  animations_controller.update_and_draw();
}

function keyPressed() {
  let min_level = 15; // corresponds to tutorial

  if (keyCode === LEFT_ARROW) {
    if (level_controller.level > min_level) {
      level_controller.level -= 1;
      level_controller.load_level();
    }
  } else if (keyCode === RIGHT_ARROW) {
    let max_level = parseInt(localStorage.getItem('level'));

    if (level_controller.level >= min_level && level_controller.level < max_level) {
      level_controller.level += 1;
      level_controller.load_level();
    }
  }
}

function mousePressed(event) {
  if (event.button === MOUSE_RIGHT_BUTTON) {
    level_controller.reload_dots();

    if (menu_state === MENU_STATE.CREATING)
      updateCodeInputTextFromLevel("");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  my_scale = ((windowWidth + windowHeight)/(displayWidth + displayHeight));
  level_controller.handle_resize();
}

document.addEventListener('contextmenu', event => event.preventDefault());

function handleMenuItemClick(item) {
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

function updateCodeInputTextFromLevel(code_text) {
  document.getElementById("code-input").value = code_text;
}

function updateLevelFromCodeInputText() {
  let code_input = document.getElementById("code-input");

  if (code_input.value) {
    let level_structure = [code_input.value, ""];
    level_controller.load_level(level_structure);
  }
}