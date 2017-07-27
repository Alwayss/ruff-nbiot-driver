/**
 * Created by huangwj on 2017/7/27.
 */
var EventEmitter = require('events');
var util = require('util');
var ReadUart = require('./readUart');

//data format '+R'
var RECV = '+R';
var MODE = {
  CMD: 0,
  DATA: 1
};

function Dispatcher(port) {
  EventEmitter.call(this);
  this._port = port;

  this._mode = MODE.CMD;

  this._readUart = new ReadUart(port);
  this._readUart.on('data', this.dispatch.bind(this));
  this.on('data', this.dispatch.bind(this));
  this._readUart.on('error', function () {
    throw new Error('UART is crashed');
  });
  this._readUart.start();
}
util.inherits(Dispatcher, EventEmitter);

Dispatcher.prototype.switchMode = function () {
  this._mode = this._mode === MODE.CMD ? MODE.DATA : MODE.CMD;
};

Dispatcher.prototype.dispatch = function(data){
  var dataStr = data.toString();

  if(data[1] !== 'OK'){
    this.emit('cmdFail',data);
    return;
  }
  // when in DATA mode, dispatch data to client communication directly
  if (this._mode === MODE.DATA) {
    this.emit('recv', data);
  } else {
    var recvIndex = dataStr.indexOf(RECV);
    if (recvIndex !== -1) {
      // enter DATA mode
      this.switchMode();
      this.emit('recv', data.slice(recvIndex));
    }else{
      this.emit('cmd', data[0]);
    }
  }
};
