/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
}

let backgroundController;
let dotsController;
let gameFont;

function setup() {
    let levelNumber = 0;
    let levelSize = 3;
    let levelObj = 0;

    if (levelSize == 3)
        levelObj = levels3x3[levelNumber]

    backgroundController = new BackgroundController(50);
    dotsController = new DotsController(levelObj);
    dotsController.animateExpand();
}

function draw() {
    backgroundController.draw();
    dotsController.draw();
}

function preload() {
    gameFont = loadFont('fonts/Dotnation.ttf');
}

function drawInfo() {
    let strNumber = this.number + "";
    while (strNumber.length < 3) strNumber = "0" + strNumber;

    fill(255);
    textAlign(CENTER, CENTER);
    textFont(gameFont);
    textSize(45);
    text(strNumber, width/2, 50);
}
