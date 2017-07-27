/**
 * Created by huang on 2017/7/27.
 * read UART data
 */
var util = require('util');
var EventEmitter = require('events');

function ReadUart(obj) {
  EventEmitter.call(this);
  this._read = obj.read.bind(obj);
}

util.inherits(ReadUart, EventEmitter);

ReadUart.prototype.start = function () {
  var that = this;

  setImmediate(readNext);

  function readNext() {
    that._read(function (err, data) {
      if (err) {
        that.emit('error', err);
      } else {
        that.emit('data', data);
      }
    });
  }
};

module.exports = ReadUart;