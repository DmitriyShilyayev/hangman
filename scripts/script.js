const answerInputElem = document.querySelector('#answerInput'),
    startScreenElem = document.querySelector('#startScreen'),
    gameScreenElem = document.querySelector('#gameScreen'),
    canvasElem = document.querySelector('#canvas'),
    livesElem = document.querySelector('#lives'),
    stopButtonElem = document.querySelector('#stop'),
    restartButtonElem = document.querySelector('#restart'),
    buttonsWrapperElem = document.querySelector('.buttons-wrapper'),
    answerWrapperElem = document.getElementById('answerWrapper'),
    languageWrapperElem = document.querySelector('.language-wrapper'),
    languageSelectElem = document.querySelector('#language');

answerInputElem.addEventListener('change', filterInput);
startScreenElem.addEventListener('submit', startGame);
stopButtonElem.addEventListener('click', stopGame);
restartButtonElem.addEventListener('click', stopGame);
buttonsWrapperElem.addEventListener('click', tryLetter);

loadLanguages();

let livesAmount,
    mistakesMade,
    answer,
    gameWon,
    languagesObj,
    currentLanguage = 'en';
const ctx = canvasElem.getContext('2d');

function filterInput(event) {
    let value = event.target.value;
    var regRule = new RegExp(
        languagesObj[currentLanguage]['filter-string'],
        'g'
    );
    if (regRule.test(value)) {
        value = value.replace(regRule, '');
        event.target.value = value;
    }
}

function loadLanguages() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'static/languages.json');
    xhr.onload = () => {
        if (xhr.status == 200) {
            languagesObj = JSON.parse(xhr.responseText);
            languageSelectElem.addEventListener('change', changeLanguage);
        } else {
            languageWrapperElem.classList.add('hidden');
        }
    };
    xhr.send();
}

function changeLanguage(event) {
    currentLanguage = event.target.value;

    document.title = languagesObj[currentLanguage].title;
    document.querySelector('#pageTitle').innerHTML =
        languagesObj[currentLanguage]['title'];
    document.querySelector('#pageSubtitle').innerHTML =
        languagesObj[currentLanguage]['subtitle'];
    answerInputElem.placeholder =
        languagesObj[currentLanguage]['input-placeholder'];
    document.querySelector('#start').innerHTML =
        languagesObj[currentLanguage]['start-button'];
    document.querySelector('#optionsLabel').innerHTML =
        languagesObj[currentLanguage]['options-button'];
    document.querySelector('#rulesTitle').innerHTML =
        languagesObj[currentLanguage]['rules-title'];
    document.querySelector('#rulesText').innerHTML =
        languagesObj[currentLanguage]['rules'];
    document.querySelector('#difficultyTitle').innerHTML =
        languagesObj[currentLanguage]['difficulty-title'];
    document.querySelector('#difficultyText').innerHTML =
        languagesObj[currentLanguage]['difficulty-text'];
    document.querySelector('#languageTitle').innerHTML =
        languagesObj[currentLanguage]['language-title'];
    document.querySelector('#languageText').innerHTML =
        languagesObj[currentLanguage]['language-text'];
    document.querySelector('#stop').innerHTML =
        languagesObj[currentLanguage]['stop-title'];
    document.querySelector('#restart').innerHTML =
        languagesObj[currentLanguage]['restart-title'];
    answerInputElem.value = '';
}

function startGame(e) {
    e.preventDefault();
    setLives(livesElem.value);
    answer = answerInputElem.value;
    if (!answer) {
        answerInputElem.placeholder =
            languagesObj[currentLanguage]['input-placeholder-empty'];
        return false;
    }
    answer = answer.toUpperCase();
    renderAnswerLetters(answer);
    document
        .querySelectorAll('.letter-button')
        .forEach((item) => item.classList.remove('hidden'));
    renderLetters(languagesObj[currentLanguage]['letters']);
    buttonsWrapperElem.classList.remove('hidden');
    startScreenElem.classList.add('hidden');
    gameScreenElem.classList.remove('hidden');
    stopButtonElem.classList.remove('hidden');
    restartButtonElem.classList.add('hidden');
    gameWon = true;
    drawBlueSky();
    drawPerson();
}

function setLives(lives) {
    switch (lives) {
        case '6':
            mistakesMade = 6;
            break;
        case '8':
            mistakesMade = 4;
            break;
        case '10':
            mistakesMade = 2;
            break;
        case '12':
            mistakesMade = 0;
            break;
    }
    livesAmount = 12;
}

function renderAnswerLetters(answer) {
    answerWrapperElem.innerHTML = '';
    for (let i = 0; i < answer.length; i++) {
        let item = document.createElement('input');
        item.setAttribute('inert', 'true');
        item.classList.add('answer-letter');
        if (answer[i] === ' ' || answer[i] === '-') {
            item.classList.add('space');
            item.setAttribute('value', answer[i]);
        } else {
            item.setAttribute('value', '');
        }
        answerWrapperElem.append(item);
    }
}

function renderLetters(lettersObj) {
    buttonsWrapperElem.innerHTML = '';
    lettersObj.forEach((letter) => {
        let button = document.createElement('button');
        button.setAttribute('value', letter);
        button.classList.add('letter-button');
        button.innerHTML = letter;
        buttonsWrapperElem.append(button);
    });
}

function tryLetter(event) {
    event.preventDefault();
    let button = event.target;
    if (button.tagName !== 'BUTTON') {
        return false;
    }

    let letters = document.querySelectorAll('.answer-letter'),
        letterFound = false,
        correctLeters = 0;
    letters.forEach((item, index) => {
        if (answer[index] === button.value) {
            item.value = button.value;
            item.classList.add('correct');
            letterFound = true;
        }
        if (answer[index] === item.value) {
            correctLeters++;
        }
    });
    button.classList.add('hidden');
    if (!letterFound) {
        mistakesMade++;
    }

    drawPerson();
    if (mistakesMade === livesAmount) {
        loseGame();
    }
    if (correctLeters === answer.length) {
        endGame();
    }
}

function stopGame() {
    startScreenElem.classList.remove('hidden');
    gameScreenElem.classList.add('hidden');
    restartButtonElem.classList.add('hidden');
    answerInputElem.value = '';
    answerInputElem.placeholder =
        languagesObj[currentLanguage]['input-placeholder'];
}

function loseGame() {
    let letters = document.querySelectorAll('.answer-letter');
    letters.forEach((item, index) => {
        if (answer[index] !== item.value) {
            item.value = answer[index];
            item.classList.add('wrong');
        }
    });
    gameWon = false;
    endGame();
}

function endGame() {
    buttonsWrapperElem.classList.add('hidden');
    restartButtonElem.classList.remove('hidden');
    stopButtonElem.classList.add('hidden');

    if (gameWon) {
        drawVictoryScreen();
    } else {
        drawLoseScreen();
    }
}

function drawBlueSky() {
    ctx.clearRect(0, 0, 400, 600);
    canvasElem.classList.add('blue');
    canvasElem.classList.remove('gray');
    drawWhiteClouds();
}

function drawWhiteClouds() {
    ctx.beginPath();
    ctx.moveTo(70, 80);
    ctx.bezierCurveTo(30, 100, 30, 150, 130, 150);
    ctx.bezierCurveTo(150, 180, 220, 180, 240, 150);
    ctx.bezierCurveTo(320, 150, 320, 120, 290, 100);
    ctx.bezierCurveTo(330, 40, 270, 30, 240, 50);
    ctx.bezierCurveTo(220, 5, 150, 20, 150, 50);
    ctx.bezierCurveTo(100, 5, 50, 20, 70, 80);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(370, 130);
    ctx.bezierCurveTo(330, 150, 330, 200, 430, 200);
    ctx.bezierCurveTo(450, 230, 520, 230, 540, 200);
    ctx.bezierCurveTo(620, 200, 620, 170, 590, 150);
    ctx.bezierCurveTo(630, 90, 570, 80, 540, 100);
    ctx.bezierCurveTo(520, 55, 450, 70, 450, 100);
    ctx.bezierCurveTo(400, 55, 350, 70, 370, 130);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'gray';
    ctx.stroke();
}

function drawGraySky() {
    canvasElem.classList.remove('blue');
    canvasElem.classList.add('gray');
    drawRain();
}

function drawRain() {
    ctx.setLineDash([12, 6, 24, 9, 10, 5]);
    for (let i = 0, j = 0; i < 700; i += 25, j -= 25) {
        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.moveTo(i, j);
        ctx.lineTo(i - 300, 600);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'gray';
        ctx.stroke();
        ctx.closePath();
    }
    ctx.setLineDash([]);
}

function drawVictoryScreen() {
    ctx.clearRect(0, 0, 400, 600);
    ctx.beginPath();
    ctx.fillStyle = 'gold';
    ctx.arc(400, 0, 150, 0, Math.PI * 5, false);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'gold';
    ctx.moveTo(400, 0);
    ctx.lineTo(150, 30);
    ctx.moveTo(400, 0);
    ctx.lineTo(180, 120);
    ctx.moveTo(400, 0);
    ctx.lineTo(250, 200);
    ctx.moveTo(400, 0);
    ctx.lineTo(360, 240);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.moveTo(80, 30);
    ctx.bezierCurveTo(110, 30, 110, 60, 110, 50);
    ctx.bezierCurveTo(110, 60, 110, 30, 140, 30);
    ctx.bezierCurveTo(130, 35, 120, 45, 110, 50);
    ctx.bezierCurveTo(100, 45, 90, 35, 80, 30);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fill();
    ctx.moveTo(30, 80);
    ctx.bezierCurveTo(60, 80, 60, 110, 60, 100);
    ctx.bezierCurveTo(60, 110, 60, 80, 90, 80);
    ctx.bezierCurveTo(80, 85, 70, 95, 60, 100);
    ctx.bezierCurveTo(50, 95, 40, 85, 30, 80);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fill();
    ctx.moveTo(130, 130);
    ctx.bezierCurveTo(160, 130, 160, 160, 160, 150);
    ctx.bezierCurveTo(160, 160, 160, 130, 190, 130);
    ctx.bezierCurveTo(180, 135, 170, 145, 160, 150);
    ctx.bezierCurveTo(150, 145, 140, 135, 130, 130);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'gray';
    ctx.arc(250, 280, 50, 0, Math.PI * 5, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.moveTo(250, 330);
    ctx.lineTo(250, 460);
    ctx.moveTo(250, 340);
    ctx.lineTo(150, 380);
    ctx.moveTo(250, 340);
    ctx.lineTo(350, 380);
    ctx.moveTo(250, 460);
    ctx.lineTo(200, 600);
    ctx.moveTo(250, 460);
    ctx.lineTo(300, 600);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function drawLoseScreen() {
    drawGraySky();
}

function drawPerson() {
    switch (mistakesMade) {
        case 12:
            ctx.clearRect(215, 465, 170, 95);
            break;
        case 11:
            ctx.beginPath();
            ctx.moveTo(300, 0);
            ctx.lineTo(300, 100);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(300, 200);
            ctx.lineTo(300, 210);
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
            ctx.closePath();
            break;
        case 10:
            ctx.beginPath();
            ctx.fillStyle = 'gray';
            ctx.arc(300, 150, 50, 0, Math.PI * 5, false);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
            break;
        case 9:
            ctx.beginPath();
            ctx.moveTo(300, 210);
            ctx.lineTo(400, 250);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
            break;
        case 8:
            ctx.beginPath();
            ctx.moveTo(300, 210);
            ctx.lineTo(200, 250);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
            break;
        case 7:
            ctx.beginPath();
            ctx.moveTo(300, 200);
            ctx.lineTo(300, 330);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
            break;
        case 6:
            ctx.beginPath();
            ctx.moveTo(300, 330);
            ctx.lineTo(250, 470);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
        case 5:
            ctx.beginPath();
            ctx.moveTo(300, 330);
            ctx.lineTo(350, 470);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
        case 4:
            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(300, 0);
            ctx.lineWidth = 20;
            ctx.strokeStyle = 'brown';
            ctx.stroke();
            ctx.closePath();
        case 3:
            ctx.beginPath();
            ctx.moveTo(100, 600);
            ctx.lineTo(100, 0);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'brown';
            ctx.stroke();
            ctx.closePath();
        case 2:
            ctx.beginPath();
            ctx.moveTo(220, 470);
            ctx.lineTo(380, 470);
            ctx.moveTo(250, 470);
            ctx.lineTo(250, 600);
            ctx.moveTo(350, 470);
            ctx.lineTo(350, 600);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'brown';
            ctx.stroke();
            ctx.closePath();
        case 1:
            ctx.beginPath();
            ctx.moveTo(0, 600);
            ctx.lineTo(400, 600);
            ctx.lineWidth = 40;
            ctx.strokeStyle = 'brown';
            ctx.stroke();
            ctx.closePath();
            break;
    }
}
