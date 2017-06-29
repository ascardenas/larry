var five = require("johnny-five");
var Raspi = require("raspi-io");
var Gpio = require('pigpio').Gpio;
var RaspiCam = require("raspicam");
var jpeg = require('jpeg-js');
const fs = require('fs');

//rgb led constructor with three pins controlled by one of two methods --depending on the led config (Common Anode, Common Cathode). 
function ledRGB (pin1, pin2, pin3){
	this.red = new Gpio(pin1, {
		mode: Gpio.OUTPUT
	});
	this.green = new Gpio(pin2, {
		mode: Gpio.OUTPUT
	});
	this.blue = new Gpio(pin3, {
		mode: Gpio.OUTPUT
	});
	
	this.writeCommonAnode = function(redCode, greenCode, blueCode) {
		var r = 255 - redCode
		var g = 255 - greenCode
		var b = 255 - blueCode
		
		this.red.pwmWrite(r)
		this.green.pwmWrite(g)
		this.blue.pwmWrite(b)
	}
	
	this.writeCommonCathode = function(redCode, greenCode, blueCode) {
		var r = redCode
		var g = greenCode
		var b = blueCode
		
		this.red.pwmWrite(r)
		this.green.pwmWrite(g)
		this.blue.pwmWrite(b)
	}
}

var ledLarry = new ledRGB(10,9,11);
var camera = new RaspiCam({mode: "photo", output: "larryImage.jpg", timeout: 10, opacity: 255});
var motor = new Gpio(7, {
	mode: Gpio.OUTPUT
});
var board = new five.Board({
  io: new Raspi()
});
var mincycle = 500;
var maxcycle = 2300;
var dutycycle = mincycle;
var control = 0;

//Takes a picture, turns the rgb led on, and moves the arm up and down.
board.on("ready", () => {
	camera.start();
	var interval1 = setInterval(function () {
		control++;
	    dutycycle = dutycycle == mincycle ? maxcycle : mincycle;
        motor.servoWrite(dutycycle);
        if(control == 2){
			clearInterval(interval1);
		}
	}, 200);

  });

camera.on("started", function(){ 
	ledLarry.writeCommonAnode(255,255,255);
	
});

camera.on("exit", function(){ 
	ledLarry.writeCommonAnode(0,0,0);
	
});

