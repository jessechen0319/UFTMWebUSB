var serial = {};

(function() {
  'use strict';

  serial.getPorts = function() {
    return navigator.usb.getDevices().then(devices => {
      return devices.map(device => new serial.Port(device));
    });
  };

  serial.requestPort = function() {
    return navigator.usb.requestDevice({ filters: [] }).then(
      device => new serial.Port(device)
    );
  }

  serial.Port = function(device) {
    this.device_ = device;
  };

  serial.Port.prototype.connect = function() {
    let readLoop = () => {
      console.log(this.device_.configuration.interfaces)
      const {
        endpointNumber
      } = this.device_.configuration.interfaces[0].alternate.endpoints[0]
 
      this.device_.transferIn(endpointNumber, 64).then(result => {
        this.onReceive(result.data);
        readLoop();
      }, error => {
        this.onReceiveError(error);
      });
    };

    return this.device_.open()
        .then(() => {
          if (this.device_.configuration === null) {
            return this.device_.selectConfiguration(1);
          }
        })
        .then(() => this.device_.claimInterface(0))
        .then(() => {
          readLoop();
        });
  };

  serial.Port.prototype.disconnect = function() {
    return this.device_.close();
  };

  serial.Port.prototype.send = function(data,type) {
    console.log(this.device_.configuration)
    const {
      endpointNumber
    } = this.device_.configuration.interfaces[0].alternates[0].endpoints[1]
    let str = this.device_.manufacturerName +'\r\n' +this.device_.productName+'\r\n'  +this.device_.serialNumber+'\r\n'  +this.device_.vendorId;
    if(type === 'info'){
      document.getElementById('output').innerHTML=str
    } 
    return this.device_.transferOut(endpointNumber, data);
  };
})();

let port;

function connect() {
  port.connect().then(() => {
    port.onReceive = data => {
      let textDecoder = new TextDecoder();
      console.log("Received:", textDecoder.decode(data));
      document.getElementById('output').value += textDecoder.decode(data);
    }
    port.onReceiveError = error => {
      console.error(error);
      document.querySelector("#connect").style = "visibility: initial";
      port.disconnect();
    };
  });
}

function send(string,type) {
  console.log("sending to serial:" + string.length);
  if (string.length === 0)
    return;
  console.log("sending to serial: [" + string +"]\n");

  let view = new TextEncoder('utf-8').encode(string);
  if (port) {
    port.send(view,type);
  }
};

window.onload = _ => {
  document.querySelector("#connect").onclick = function() {
    serial.requestPort().then(selectedPort => {
      port = selectedPort;
      this.style = "visibility: hidden";
      connect();
    });
  }

  document.querySelector("#submit").onclick = () => {
    let source = document.querySelector("#editor").value;
    send(source,'send');
  }
  document.querySelector('#information').onclick=()=>{
    let source = document.querySelector("#editor").value;
    send(source,'info')
  }
}