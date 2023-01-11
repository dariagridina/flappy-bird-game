let weatherData, weatherCode, temperature;
let lat, lng;
const PIPE_SPACE = 180;
let playing = false;
let startScreen = true;
let isPaused = false;
let fenceX = 0;
let speed = 5;
let obstacles = [];
let bird, helicopter;

let yearS, monthS, dayS, hourS;

let birdImg, fenceImg, pipeTopImg, pipeBottomImg, backgroundPrison, helicopterImg, restartImg, pauseBackgroundImg, pauseImg, playImg, bestScoreImg, scoreImg, music;

let storedBestScore = getCookie('bestScore');
if (storedBestScore) {
  bestScore = storedBestScore;
} else {
  bestScore = 0;
}

function preload() {
  navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    loadJSON('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&hourly=weathercode', displayWeather);
    loadJSON('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&hourly=temperature_2m', displayTemperature);
  }, () => {
    weatherCode = '';
    temperature = '';
  }
  );

  soundFormats('mp3');
  music = loadSound('static/Mission-Impossible.mp3');

  birdImg = loadImage('static/flappybird.png');
  fenceImg = loadImage('static/fence1.png');
  pipeBottomImg = loadImage('static/pipe_bottom.png');
  pipeTopImg = loadImage('static/pipe_top.png');
  bestScoreImg = loadImage('static/best.png');
  scoreImg = loadImage('static/score.png');
  restartImg = loadImage('static/restart.png');
  pauseImg = loadImage('static/pause_button.png');
  playImg = loadImage('static/play1.png');
  pauseBackgroundImg = loadImage('static/pause.png');
  backgroundPrison = loadImage('static/backgr_img/prison.png');
  weatherCodeToImageMap = {
  '0':
  loadImage('static/weather/sun.png'),
  '1':
  loadImage('static/weather/cloudy1.png'),
  '2':
  loadImage('static/weather/cloudy2.png'),
  '3':
  loadImage('static/weather/cloudy3.png'),
  '45':
  loadImage('static/weather/fog.png'),
  '48':
  loadImage('static/weather/fog.png'),
  '51':
  loadImage('static/weather/rain_showers.png'),
  '53':
  loadImage('static/weather/rain_showers.png'),
  '55':
  loadImage('static/weather/rain_showers.png'),
  '56':
  loadImage('static/weather/rain_showers.png'),
  '57':
  loadImage('static/weather/rain_showers.png'),
  '61':
  loadImage('static/weather/rain.png'),
  '63':
  loadImage('static/weather/rain.png'),
  '65':
  loadImage('static/weather/rain.png'),
  '66':
  loadImage('static/weather/rain.png'),
  '67':
  loadImage('static/weather/rain.png'),
  '71':
  loadImage('static/weather/snow.png'),
  '73':
  loadImage('static/weather/snow.png'),
  '75':
  loadImage('static/weather/snow.png'),
  '77':
  loadImage('static/weather/snow.png'),
  '80':
  loadImage('static/weather/rain_showers.png'),
  '81':
  loadImage('static/weather/rain_showers.png'),
  '82':
  loadImage('static/weather/rain_showers.png'),
  '85':
  loadImage('static/weather/snow.png'),
  '86':
  loadImage('static/weather/snow.png'),
  '95':
  loadImage('static/weather/thunder.png'),
  '96':
  loadImage('static/weather/thunder.png'),
  '99':
  loadImage('static/weather/thunder.png'),
}
}


function displayWeather(data) {
  yearS = year();
  monthS = month();
  if (monthS < 10) {
    monthS = '0' + str(month());
  }
  dayS = day();
  if (dayS < 10) {
    dayS = '0' + str(day());
  }
  hourS = hour();
  if (hourS < 10) {
    hourS = '0' + str(hour());
  }
  let currentDate = yearS + '-' + monthS + '-' + dayS + 'T' + hourS + ':00';
  for (let i = 0; i < data.hourly.time.length; i++) {
    if (data.hourly.time[i] === currentDate) {
      weatherCode = data.hourly.weathercode[i];
      break;
    }
  }
}

function displayTemperature(tempData) {
  yearS = year();
  monthS = month();
  if (monthS < 10) {
    monthS = '0' + str(month());
  }
  dayS = day();
  if (dayS < 10) {
    dayS = '0' + str(day());
  }
  hourS = hour();
  if (hourS < 10) {
    hourS = '0' + str(hour());
  }

  let currentDate = yearS + '-' + monthS + '-' + dayS + 'T' + hourS + ':00';
  for (let i = 0; i < tempData.hourly.time.length; i++) {
    if (tempData.hourly.time[i] === currentDate) {
      temperature = tempData.hourly.temperature_2m[i];
      break;
    }
  }
}

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = 'expires='+ d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 60;
    this.gravity = 0.7;
    this.velocity = 0;
    this.lift = -15;
    this.score = 0;
    this.direction = 'down';
  }

  show() {
    image(birdImg, this.x, this.y, this.size, this.size);
  }

  update() {
    // apply gravity to the velocity
    this.velocity += this.gravity;
    // add the velocity to the y position
    this.y += this.velocity;

    // prevent the bird from falling through the floor
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
    // prevent the bird from going above the screen
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  flap() {
    this.velocity += this.lift;
  }

  move() {
    if (startScreen) {
      this.x = width/3;
      this.y = height/3;
      this.score = 0;
    }
    this.y = height/3 + map( sin(frameCount*10), 0, 1, -2, 2 );
  }

  reset() {
    this.x = width / 3;
    this.y = height / 3;
    this.gravity = 0.7;
    this.velocity = 0;
    this.lift = -15;
    this.size = 60;
    this.score = 0;
  }
}


class Helicopter {
  constructor(x, y, size, src) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.src = src
      this.gif = loadImage(src);
    this.direction = 'down';
  }

  update() {
    // Check the current direction of the helicopter
    if (this.direction === 'down') {
      this.y += 3;
    } else {
      this.y -= 3;
    }
    if (this.y <= 10) {
      this.direction = 'down'
    } else if (this.y >= 50) {
      this.direction = 'up'
    }
  }

  show() {
    image(this.gif, this.x, this.y, 370, 250);
  }

  reset() {
    this.x = 10;
    this.y = 50;
    this.direction = 'down';
  }
}


class Obstacle {
  constructor() {
    this.topPipeEnd = random(height / 2);
    this.x = width;
    this.w = 60;
    this.h = pipeBottomImg.height;
    this.highlight = false;
  }

  show() {
    // draw the top pipe
    image(pipeTopImg, this.x, this.topPipeEnd - pipeTopImg.height, this.w, pipeTopImg.height);
    // draw the bottom pipe
    image(pipeBottomImg, this.x, this.topPipeEnd + PIPE_SPACE, this.w, this.h);
  }


  update() {
    // move the obstacles to the left
    this.x -= speed;
  }

  offScreen() {
    return this.x < -this.w;
  }

  pass(bird) {
    // check if the bird has passed through the obstacles
    if (bird.x > this.x && !this.highlight) {
      this.highlight = true;
      return true;
    } else {
      return false;
    }
  }

  hit(bird) {
    if (bird.y < this.topPipeEnd || -bird.y > this.topPipeEnd + PIPE_SPACE) {
      if (bird.x + bird.size > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    if (bird.x + bird.size > this.x && bird.x < this.x + this.w) {
      if (bird.y + bird.size >= this.topPipeEnd + PIPE_SPACE && bird.y + bird.size <= this.topPipeEnd + PIPE_SPACE + this.h) {
        return true;
      }
    }
    return false;
  }
}

function addObstacle() {
  if (frameCount % 50 == 0) {
    obstacles.push(new Obstacle());
    playing = true;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].show();
    obstacles[i].update();
    if (obstacles[i].pass(bird)) {
      bird.score++;
      if (bird.score % 10 === 0) {
        speed += 1;
      }
    }
    if (obstacles[i].offScreen()) {
      obstacles.splice(i, 1);
    }

    if (bird.y > height - bird.size || obstacles[i].hit(bird)) {
      playing = false;
    }
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  helicopter = new Helicopter(20, 10, 100, 'static/helicopter1.gif');
  frameRate(40);
  bird = new Bird(width / 3, height / 3);
  bird.flap();
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(50);
}


function draw() {
  let backgroundImg = backgroundPrison;
  backgroundImg.resize(windowWidth, windowHeight);
  image(backgroundImg, 0, 0);

  if (temperature) {
    let tempImg = weatherCodeToImageMap[weatherCode];
    if (!tempImg) {
      return;
    }
    image(tempImg, 10, 10, tempImg.width/8, tempImg.height/8);
    textSize(25);
    fill(200);
    text(temperature + '°C', 55, 100);
  }

  if (startScreen) {
    for (let i = 0; i < width; i += fenceImg.width) {
      if (fenceX == 0) {
        image(fenceImg, i, height - fenceImg.height);
      }
    }
    bird.move();
    image(playImg, windowWidth / 2 - 60, windowHeight / 2 - 60, 100, 100);
    textSize(30);
    fill(200);
    text('Tap to start', width / 2 - 13, height / 3 + 10);
    if (keyPressed) {
      if (key == ' ') {
        startScreen = false;
        playing = true;
      }
    }
  }

  if (playing) {
    
    fenceX -= speed;
    for (let i = 0; i < width; i += fenceImg.width) {
      if (fenceX < -fenceImg.width) {
        fenceX = 0;
        image(fenceImg, i, height - fenceImg.height);
      } else {
        image(fenceImg, fenceX + i, height - fenceImg.height);
      }
    }

    addObstacle();

    fill(200);
    textSize(50);
    text(bird.score, width / 2, height / 5);

    image(pauseImg, windowWidth - 110, 30, 70, 70);

    if (obstacles.length - 1 < 0 && !isPaused) {
      textSize(50);
      fill(200);
      text("Let's go", width / 2, height / 3);
    }
  } else {
    if (!startScreen) {
      image(restartImg, windowWidth / 2 - 170, windowHeight / 2 - 250, 350, 500);
      rectMode(CENTER);
      fill(255);
      image(scoreImg, width/3 - 28, height/2 - 105, 50, 45);
      text('Score: ' + bird.score, width/3, height/2 - 40, 50);
      if (bird.score > bestScore) {
        bestScore = bird.score;
        setCookie('bestScore', bestScore, 365);
      }
      fill(255);
      image(bestScoreImg, width - 464, height/2 - 110, 60, 50);
      text('Best: ' + bestScore, width - 430, height/2 - 40, 50);
      fill(203, 51, 51);
      rect(width / 2, height / 2 + 180, 150, 50, 10);
      fill(255);
      textSize(20);
      text('Restart', width / 2, height / 2 + 180);
      if (keyPressed) {
        if (key == 'Escape') {
          return;
        }
      }
      playing = false;
    }
  }

  bird.show();
  helicopter.show();
  bird.update();
  helicopter.update();

  if (isPaused) {
    image(pauseImg, windowWidth - 110, 30, 70, 70);
    image(pauseBackgroundImg, windowWidth / 2 - 265, windowHeight / 2 - 90, 500, 250);

    fill(200);
    stroke(3);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('PAUSED', width / 2, height / 2);
    noStroke();
    fill(150);
    textAlign(CENTER, CENTER);
    textSize(15);
    text('press "ESCAPE" to continue', width / 2, 320);
  }
}


function keyPressed() {
  if (!isPaused) {
    if (key == ' ') {
      bird.flap();
    }
  }

  if (key === 'Escape' && playing) {
    if (isPaused) {
      loop();
    } else {
      noLoop();
    }
    isPaused = !isPaused;
  }

  if (key !== 'Escape' && !playing && key == ' ') {
    restartGame();
  }

  if (startScreen) {
    music.loop();
  }

  if (key === 'm') {
    if (music.isPlaying()) {
      music.stop();
    } else {
      music.loop();
    }
  }
}




function mousePressed() {
  if (playing) {
    if (mouseX > 0 && mouseX < width &&
      mouseY > 0 && mouseY < height) {
      bird.flap();
    }
    if (mouseX > windowWidth - 110 && mouseX < windowWidth - 110 + 70 && mouseY > 30 && mouseY < 30 + 70) {
      if (isPaused) {
        loop();
      } else {
        noLoop();
      }
      isPaused = !isPaused;
    }
  }

  if (!playing) {
    // check if the restart button was clicked
    if (mouseX > width / 2 - 75 && mouseX < width / 2 + 75 && mouseY > height / 2 + 150 && mouseY < height / 2 + 200) {
      // restart the game
      restartGame();
    }
  }

  if (startScreen) {
    if (mouseX > windowWidth / 2 - 60 && mouseX < windowWidth / 2 + 40 &&
      mouseY > windowHeight / 2 - 60 && mouseY < windowHeight / 2 + 40) {
      startScreen = false;
      playing = true;
    }
  }
}

function restartGame() {
  // Reset variables to initial values
  playing = true;
  obstacles = [];
  speed = 5;
  fenceX = 0;
  bird.reset();
  helicopter.reset();
  isPaused = false;
}
