/**
 * Created by huangwj on 2017/7/27.
 */


function createCommands(cmdCommunication) {
  var commands = Object.create(null);

  commands._cmd2do = function (cmdType, cmdArray, removeCmdHeader, checkStatus, statusIndex, cb) {
    var cmd;
    var cmdStr = cmdArray[0];
    //if cmdArray's length = 1, the writeValue = cmdArray[0]
    if(cmdArray.length > 1){
      var writeValue = cmdArray[1];
    }
    switch (cmdType) {
      case "read":
        cmd = generateReadCmd(cmdStr);
        break;
      case "write":
        cmd = generateWriteCmd(cmdStr, writeValue);
        break;
      case "test":
        cmd = generateTestCmd(cmdStr);
        break;
      case "exec":
        cmd = generateExecutionCmd(cmdStr);
        break;
      default:
        throw new Error('unrecognized command: ' + cmdType);
        break;
    }
    cmdCommunication.pushCmd(cmd, function (error, result) {
      if (error) {
        cb && cb(error);
      }
      statusIndex = statusIndex === -1 ? result.length - 1 : 0;
      if (!checkStatus) {
        cb && cb(null, result);
      } else if (!result[statusIndex].match(/OK/)) {
        error = new Error('response ends with error');
        cb && cb(error, result);
      } else {
        var resValue;
        if (removeCmdHeader) {
          var regexp = new RegExp(cmdStr.slice(1) + ': (.+)');
          resValue = result[0].match(regexp)[1];
        }
        cb && cb(null, resValue || result);
      }
    });
  };

  //create udp socket transmission channel (AT+NSOCR=DGRAM,17,5683,1)
  commands.init = function(port){
    var cmd = Buffer.from('AT+NSOCR=DGRAM,17,' + port + ',1\r');
    cmdCommunication.pushCmd(cmd, function (error, result) {
      if (error) {
        cmdCommunication.emit('error',error);
      } else if (result[1] !== 'OK') {
        error = new Error('create transmission channel error');
        cmdCommunication.emit('error',error);
      } else {
        cmdCommunication.emit('channelId',result[0]);
      }
    });
  };

  //wireless module restart
  commands.reboot = function(cb){
    this._cmd2do('exec', 'NRB', false, false, -1, function(error,result){
      if (error) {
        cb && cb(error);
        return;
      }
      cb && cb(null, result);
    })
  }
}

function generateTestCmd(cmd) {
  return Buffer.from('AT+' + cmd + '=?\r');
}

function generateReadCmd(cmd) {
  return Buffer.from('AT+' + cmd + '?\r');
}

function generateWriteCmd(cmd, value) {
  return Buffer.from('AT+' + cmd + '=' + value + '\r');
}

function generateExecutionCmd(cmd) {
  return Buffer.from('AT+' + cmd + '\r');
}

module.exports = createCommands;
