var Service, Characteristic;
var request = require('request');


module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-sonoff-tasmota-http-arilux", "SonoffTasmotaHTTParilux", SonoffTasmotaHTTPariluxAccessory);
}

function SonoffTasmotaHTTPariluxAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"]
  this.hostname = config["hostname"] || "sonoff";

  var informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, 'Sonoff Tasmota')
    .setCharacteristic(Characteristic.Model, 'homebridge-sonoff-tasmota-http-arilux')
    .setCharacteristic(Characteristic.SerialNumber, 'HTTP Serial Number')

  this.service = new Service.Lightbulb(this.name);
  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));
  this.service     
    .addCharacteristic(new Characteristic.Brightness())
    .on('get', this.getBrightness.bind(this))
    .on('set', this.setBrightness.bind(this))
  this.service
    .addCharacteristic(new Characteristic.Color())
    .on('get', this.getColor.bind(this))
    .on('set', this.setColor.bind(this))

  this.log("Sonoff Tasmota HTTP LED Initialized")
}

SonoffTasmotaHTTPariluxAccessory.prototype.getState = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Power", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("\n");
  	that.log("ARILUX: " + that.hostname + " Get State: " + lines[1]);
  	if (lines[1] == "POWER = OFF") callback(null, 0)
  	else if (lines[1] == "POWER = ON") callback(null, 1)
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.setState = function(toggle, callback) {
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Power" + newstate, function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("\n");
  	that.log("ARILUX: " + that.hostname + " Set State to: " + lines[1]);
  	if (lines[1] == "POWER = OFF") callback()
  	else if (lines[1] == "POWER = ON") callback()
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.getBrightness = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Dimmer", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("ARILUX: " + that.hostname + " Get Brightness: " + jsonreply.Dimmer);
  	callback(null, jsonreply.Dimmer)
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.setBrightness = function(brightness, callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Dimmer%20" + brightness, function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("ARILUX: " + that.hostname + " Set Brightness to: " + jsonreply.Dimmer);
  	if (jsonreply.Dimmer == brightness) callback()
  	else { 
  	  that.log("ARILUX: " + that.hostname + " ERROR Setting Brightness to: " + brightness) 
  	  callback()
  	}
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.getColor = function(callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Color", function(error, response, body) {
    if (error) return callback(error);
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("ARILUX: " + that.hostname + " Get Color: " + jsonreply.CT);
  	callback(null, jsonreply.CT)
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.setColor = function(CT, callback) {
  var that = this
  request("http://" + this.hostname + "/cm?cmnd=Color%20" + CT, function(error, response, body) {
    if (error) return callback(error);
    that.service.setCharacteristic(Characteristic.On, 1)
  	var lines = body.split("=");
  	var jsonreply = JSON.parse(lines[1])
  	that.log("ARILUX: " + that.hostname + " Set Color to: " + CT);
  	if (jsonreply.Color != undefined) callback()
  	else { 
  	  that.log("ARILUX: " + that.hostname + " ERROR Setting Color to: " + CT) 
  	  callback()
  	}
  })
}

SonoffTasmotaHTTPariluxAccessory.prototype.getServices = function() {
  return [this.service];
}
