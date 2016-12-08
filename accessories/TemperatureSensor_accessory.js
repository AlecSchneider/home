var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var eventEmitter = require('./EventEmitter.js')



// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  currentTemperature: 20,
  currentRelativeHumidity: 30,
  getTemperature: function() {
    console.log("Getting the current temperature!");
    return FAKE_SENSOR.currentTemperature;
  },
  getRelativeHumidity: function() {
    console.log("Getting the current humidity!");
    return FAKE_SENSOR.currentRelativeHumidity;
  }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature/Humidity Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {

    // return our current value
    callback(null, FAKE_SENSOR.getTemperature());
  });
sensor
    .addService(Service.HumiditySensor)
    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function(callback) {

      // return our current value
      callback(null, FAKE_SENSOR.getRelativeHumidity());
});

eventEmitter.on('updateDesk', function(data){
    try{
        data = JSON.parse(data)
        console.log("DESK! T: "+data.T+" H: "+data.H)
        FAKE_SENSOR.currentTemperature = data.T
        FAKE_SENSOR.currentRelativeHumidity = data.H
    }catch(err){
        console.log(err); //error in the above string(in this case,yes)!
    }
  });
