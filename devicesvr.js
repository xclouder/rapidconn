const net = require('net')
const server = net.createServer();

const bridgeMgr = require('./bridge/bridge');

var bridge = null;
var code = '8888';
var bindMsg = "bind:" + code;

server.on('connection', (socket) => {

  console.log('[devicesvr]a client is connected');
  
  socket.on('data', (data)=>{

    console.log("[devicesvr]receive data:%s", data);

    if (data.toString() == bindMsg)
    {
      bridge = bridgeMgr.bindDeviceSocket(socket, code);
    }
    else
    {
      if (bridge != null)
      {
        bridge.send(socket, data);
      }
      else
      {
        console.error("bridge is null");
      }
    }

  });

  socket.on('end', ()=>{
    bridgeMgr.unbindDeviceSocket(socket);
  });
});
server.listen(8081, () => {
  console.log(`[devicesvr]listen on port:${server.address().port}`);
});

module.exports = server;