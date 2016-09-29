var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var five = require("johnny-five");
var one = require('onecolor');
var eventEmitter = require('./EventEmitter.js')

// here's a fake hardware device that we'll expose to HomeKit
var FAKE_LIGHT = {
  powerOn: false,
  brightness: 100, // percentage
  hue: 0,
  saturation: 0,

  setPowerOn: function(on) {
    console.log("Turning the light %s!", on ? "ON" : "OFF");
    if (FAKE_LIGHT.powerOn != on) {
        FAKE_LIGHT.powerOn = on;
        eventEmitter.emit('toggle');
    }
    // Turn it on and set the initial color
  },
  setBrightness: function(brightness) {
    console.log("Setting light brightness to %s", brightness);
    FAKE_LIGHT.brightness = brightness;
    eventEmitter.emit('color');
  },
  setHue: function(hue){
    console.log("Setting light Hue to %s", hue);
    FAKE_LIGHT.hue = hue;
    eventEmitter.emit('color');
  },
  setSaturation: function(saturation){
    console.log("Setting light Saturation to %s", saturation);
    FAKE_LIGHT.saturation = saturation;
  },
  identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:DeskLEDlight');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('DeskLEDLight', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "1A:2B:3C:4D:5E:FF";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  FAKE_LIGHT.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "LED Strip") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    FAKE_LIGHT.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems

    if (FAKE_LIGHT.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });

// also add an "optional" Characteristic for Brightness
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, FAKE_LIGHT.brightness);
  })
  .on('set', function(value, callback) {
    FAKE_LIGHT.setBrightness(value);
    callback();
  })

  light
    .getService(Service.Lightbulb)
    .addCharacteristic(Characteristic.Hue)
    .on('get',function(callback){
     callback(null,FAKE_LIGHT.hue);
     })
     .on('set',function(value,callback){
     FAKE_LIGHT.setHue(value);
     callback();
     })

  light
    .getService(Service.Lightbulb)
    .addCharacteristic(Characteristic.Saturation)
    .on('get',function(callback){
     callback(null,FAKE_LIGHT.saturation);
     })
     .on('set',function(value,callback){
     FAKE_LIGHT.setSaturation(value);
     callback();
     })

 var serialport = require("serialport")
 var SerialPort = serialport.SerialPort

var port = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});


port.on('open', onPortOpen);
port.on('data', onData);
port.on('close', onClose);
port.on('error', onError);


function onPortOpen(){
    console.log("YESSIR THE PORT IS OPEN COS CAPS");

    eventEmitter.on('toggle', function(){
          if(FAKE_LIGHT.powerOn) {
              port.write("on")
          } else {
              port.write("off")
          }
      });
      eventEmitter.on('color', function(){
          var newColor = one('hsv('+FAKE_LIGHT.hue+', '+FAKE_LIGHT.saturation+'%, '+FAKE_LIGHT.brightness+'%)').hex()
          port.write(newColor)
      });
}

function onData(data)
{
    eventEmitter.emit('update', data);
}

function onClose(){
    console.log("Port is closed, yo");
}
function onError(){
    console.log("something went horribly wrong");
}
