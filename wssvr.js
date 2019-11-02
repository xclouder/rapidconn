const WebSocket = require('ws');
const bridgeMgr = require('./bridge/bridge');

const server = new WebSocket.Server({ port: 8080 }, ()=>{
  console.log("[wssvr]listen on port:8080")
});

server.on('open', function open() {
  console.log('[wssvr]connected');
});

server.on('close', function close() {
  console.log('[wssvr]disconnected');
});

var bridge = null;
var code = '8888';
var bindMsg = "bind:" + code;

server.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  const port = req.connection.remotePort;
  const clientName = ip + port;

  console.log('[wssvr]%s is connected', clientName)

  // 发送欢迎信息给客户端
  // ws.send("Welcome " + clientName);

  ws.on('message', function incoming(message) {

    if (message.toString() == bindMsg)
    {
      bridge = bridgeMgr.bindWebSocket(ws, code);
    }
    else
    {
      if (bridge != null)
      {
        bridge.send(ws, message);
      }
      else
      {
        console.error("bridge is null");
      }
    }
    

    // console.log('received: %s from %s', message, clientName);
    
    // // 广播消息给所有客户端
    // server.clients.forEach(function each(client) {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send( clientName + " -> " + message);
    //   }
    // });

  });

  ws.onclose = function(){
    bridgeMgr.unbindWebSocket(ws);
  };
});



module.exports = server;