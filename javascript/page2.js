// Sondre Gjellestad | 2017

var speedInit = 1;
var printPenalty = 0;

function setup() {
  loadFiles(1);

  // Bruker ikke canvas
  noCanvas();

  // Initialisere timer og database
  timer = new Timer();
  database = new Database();

  timer.init();
  database.init(); // initialiserer databasen med eksempler


  // Sette opp HTML-elementer for brukerinteraksjon
  setupHTML();
  updateHTML();
}

function setupHTML() {
  // Fart og timer
  speedOut = createP('');
  speedOut.parent('speed');

  timeOut = createP('');
  timeOut.parent('time');
  timerToggle = createButton('Start | stopp');
  timerToggle.parent('time');
  timerToggle.mousePressed(timer.toggle);

  // Valg av distanse
  distanceInput = createSlider(0, 5000, 250, 25)
  distanceInput.parent('distance');
  distanceInput.input(updateHTML);
  distOut = createSpan('');
  distOut.parent('distance');

  // Valg av fartsgrense
  speedLimit = createSlider(10, 130, 50, 10);
  speedLimit.parent('speedlimit');
  speedLimit.input(updateHTML);
  limitOut = createSpan('');
  limitOut.parent('speedlimit');

  // Fartsbot
  penalty = createSpan('<b>Bot:</b> Ingen bot.');
  penalty.parent('penalty')

  // Loggføring


  carId = createInput('', text);
  carId.parent('inputfields');
  carId.input(updateHTML);


  lookupResult = createSpan('');
  lookupResult.parent('lookup');

  vehiclePenalty = createP('');
  vehiclePenalty.parent('lookup');
}

function Timer() {
  // Variabel som holder antall millisekunder tidtakeren har gått
  this.milliseconds = 0;
  this.running = 0;
  this.hasRun = 0;

  this.startmillis = 0;
  this.currentmillis = 0;
  this.time = 0;

  this.init = function() {
    this.time = "0 minutter 0 sekunder 0 millisekunder";
  }

  this.toggle = function() {
    if (timer.running) {
      timer.running = 0;
    } else {
      timer.startmillis = millis();
      timer.running = 1;
    }
  }

  this.update = function() {
    this.currentmillis = millis() - this.startmillis;
    var secs = floor(this.currentmillis / 1000);
    var mins = floor(this.currentmillis / 60000);
    this.time = mins + " minutter" + " " + secs + " sekunder" + " " + floor(this.currentmillis % 1000) + " millisekunder";
    updateHTML();
  }
}

function Database() {
  this.storage = [];

  this.init = function() {
    // Denne funksjonen initialiserer databasen med eksempler for oppgaven.
    this.addEntry('SR19766', 'Lastebil', 80);
    this.addEntry('UV54545', 'Moped', 45);
    this.addEntry('GF98987', 'Buss', 100);
    this.addEntry('ST33445', 'Personbil', 999);
  }

  this.addEntry = function(id_, type_, maxSpeed_) {
    this.storage.push({
      id: id_,
      type: type_,
      maxSpeed: maxSpeed_
    });
  }

  this.lookup = function(id) {
    for (var i = 0; i < this.storage.length; i++) {
      if (id == this.storage[i].id) {
        var result = this.storage[i];
      } else {

      }
    }
    if (result) {
      return result;
    } else {
      return 0;
    }
  }
}


function updateHTML() {
  // Oppdater uttekstfelt
  distOut.html(distanceInput.value() + " meter");
  limitOut.html(speedLimit.value() + "km/t");
  timeOut.html(timer.time);

  speed = floor((distanceInput.value() / (timer.currentmillis / 1000)) * 360) / 100;
  if (speed > 1000) {
    speedOut.html("> 1000km/t");
    var penaltySpeed = "> 1000km/t";
  } else {
    speedOut.html(speed + "km/t");
    var penaltySpeed = speed + "km/t";
  }

  if (timer.hasRun == 0) {
    speedOut.html("--km/t");
    timer.hasRun = 1;
  }

  var penaltyKr = penaltyCheck();
  console.log(penaltyKr);
  if (penaltyKr == 0) {
    printPenalty = 0;
  } else if (penaltyKr > 0) {
    penaltyKr += "kr";
    printPenalty = 1;
  } else {
    printPenalty = 1;
  }
  var date = day() + "." + month() + "." + year();
  var timenow = hour() + "." + minute();
  if (carId.value() == 0) {
    regnr = "Mangler registreringsnummer";
  } else {
    regnr = carId.value();
  }
  if (printPenalty) {
    penalty.html(date + " | " + timenow + " | " + regnr + " | " + penaltySpeed + " | " + penaltyKr);
  } else {
    penalty.html('Ingen bot.')
  }

  var result = database.lookup(regnr);
  if (result == 0) {
    lookupResult.html('Ingen treff.');
  } else {
    lookupResult.html(result.id + " | " + result.type + " | Toppfart: " + result.maxSpeed + "km/t");
  }

  if (speed > result.maxSpeed) {
    vehiclePenalty.html("Bot: " + date + ", " + timenow + ", " + regnr + ", Kjøretøyets toppfart: " + result.maxSpeed + "km/t, " + result.type + ", " + penaltySpeed + ", " + "10000kr");
  } else {
    vehiclePenalty.html('');
  }

}

function penaltyCheck() {
  var limit = speedLimit.value();
  if (speed > limit) {
    var amount = speed - limit;
    if (limit <= 60) {
      if (amount <= 5) {
        speedPenalty = 750;
      } else if (amount <= 10) {
        speedPenalty = 2050;
      } else if (amount <= 15) {
        speedPenalty = 3700;
      } else if (amount <= 20) {
        speedPenalty = 5350;
      } else if (amount <= 25) {
        speedPenalty = 8300;
      } else {
        speedPenalty = "ANMELDELSE"
      }
    } else if (limit >= 70) {
      if (amount <= 5) {
        speedPenalty = 750;
      } else if (amount <= 10) {
        speedPenalty = 2050;
      } else if (amount <= 15) {
        speedPenalty = 3300;
      } else if (amount <= 20) {
        speedPenalty = 4600;
      } else if (amount <= 25) {
        speedPenalty = 6250;
      } else if (amount <= 30) {
        speedPenalty = 8300;
      } else if (amount <= 35) {
        speedPenalty = 9950;
      } else if (amount <= 40) {
        speedPenalty = 10400;
      } else {
        speedPenalty = "ANMELDELSE"
      }
    }
  } else {
    speedPenalty = 0;
  }
  return speedPenalty;
}

function draw() {
  if (timer.running) {
    timer.update();
  }
}
