var eventEmitter = require('./EventEmitter.js')
// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '10.0.1.13',
  clientId: 'MakeUseOf Wifi Light'
};
var client = mqtt.connect(options);
console.log("Wifi Light Connected to MQTT broker");
client.subscribe(['drinkTemperature', 'deskTemperature'])
client.on('message', function (topic, message) {
    if(topic === 'drinkTemperature') {
        eventEmitter.emit('updateDrink', message.toString('utf-8'))
    }
	else if(topic === 'deskTemperature') {
        eventEmitter.emit('updateDesk', message.toString('utf-8'))
    }
})


eventEmitter.on('OutletAOn', function(){
	client.publish('drinklight/power', "PowerAOn")
});
eventEmitter.on('OutletAOff', function(){
	client.publish('drinklight/power', "PowerAOff")
});
eventEmitter.on('OutletBOn', function(){
	client.publish('drinklight/power',"PowerBOn")
});
eventEmitter.on('OutletBOff', function(){
	client.publish('drinklight/power',"PowerBOff")
});
eventEmitter.on('OutletCOn', function(){
	client.publish('drinklight/power',"PowerCOn")
});
eventEmitter.on('OutletCOff', function(){
	client.publish('drinklight/power',"PowerCOff")
});
eventEmitter.on('beamerOn', function(){
	client.publish('drinklight/ir',"BeamerOn")
});
eventEmitter.on('beamerOff', function(){
	client.publish('drinklight/ir',"BeamerOff")
});
eventEmitter.on('receiverOn', function(){
	client.publish('drinklight/ir',"ReceiverOn")
});
eventEmitter.on('receiverOff', function(){
	client.publish('drinklight/ir',"ReceiverOff")
});
module.exports = client;
