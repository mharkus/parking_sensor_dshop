var util = require('util');
var SerialPort = require('serialport');
var xbee_api = require('xbee-api');

var C = xbee_api.constants;
var carCount = 7;
var previousCarCount = 0;
var previous = {}
var entryToggle = true;
var exitToggle = true;
var SENSOR_THRESHOLD = 0.1;
var SENSOR_ENTRY_MAC = "0013a20040f65a68";
var SENSOR_EXIT_MAC = "0013a20041258bd6"; 


var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 0
});

var serialport = new SerialPort("/dev/ttyUSB0", {
    baudrate: 9600,
    parser: xbeeAPI.rawParser()
});

serialport.on('data', function (data) {
    console.log('data received: ' + data.toString('hex'));
});



// All frames parsed by the XBee will be emitted here
xbeeAPI.on("frame_object", function (frame) {
    var sensorValue = frame.data.slice(4,6).readUIntBE(0,2);
    sensorValue = sensorValue / 1023; //MX sensor returns 0 - 1023 so recalibrate it
    var remoteMAC = frame.remote64;
    if(remoteMAC === SENSOR_ENTRY_MAC){
	var deviation = sensorValue - previous.entry;
	if(deviation >= SENSOR_THRESHOLD){
		entryToggle = !entryToggle;
		if(entryToggle && carCount < 10){
			carCount++;
		}

	}

	previous.entry = sensorValue;
    }else if(remoteMAC === SENSOR_EXIT_MAC){
	var deviation = sensorValue - previous.exit;
	if(deviation >= SENSOR_THRESHOLD){
		exitToggle = !exitToggle;
		if(exitToggle && carCount > 0){
			carCount--;
		}
	}	
	previous.exit = sensorValue;
    }

    if(carCount != previousCarCount){
    	console.log(carCount);
    }
   
    previousCarCount = carCount; 
});

