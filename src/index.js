'use strict';

var driver = require('ruff-driver');
var Dispatcher = require('./dispatcher');
var createCommands = require('./commands');
var CmdCommunication = require('./cmdCommunication');

module.exports = driver({

  attach: function (inputs, context) {
    this._uart = inputs['uart'];
    this._dispatcher = new Dispatcher(this._uart);
    this._cmdCommunication = new CmdCommunication(this._uart, this._dispatcher);
    this._commands = createCommands(this._cmdCommunication);

    //add func that sending AT cmd to wireless module
    var that = this;
    Object.keys(this._commands).forEach(function (key) {
      that[key] = that._commands[key].bind(that._commands);
    });

    this._cmdCommunication.on('ready', function () {
      that.emit('ready');
    });

    //get the transmission channel id
    this._cmdCommunication.on('channelId',function(channelId){
      that.emit('channelId',channelId);
    })


  }
});
