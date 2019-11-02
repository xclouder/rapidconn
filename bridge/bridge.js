var BridgeState = {
	UnBind:0,
	Binded:1,
}

class Bridge
{

	constructor(bridgeKey) {
        this.state = BridgeState.UnBind;
        this.bridgeKey = bridgeKey;
    }

	updateState()
    {
    	if (this.webSocket != null && this.deviceSocket != null)
    	{
    		if (this.state == BridgeState.UnBind)
    		{
    			this.state = BridgeState.Binded;

    			console.log("bridge binded:" + this.bridgeKey);
    			//todo callback?
    		}
    	}
    }

    bindWebSocket(webSocket)
    {
    	if (this.state == BridgeState.Binded)
    	{
    		console.error("bridge already binded, please unbind first to bind another socket");
    		return;
    	}

    	this.webSocket = webSocket;

    	console.log("web socket binded, key:" + this.bridgeKey);

    	this.updateState();
    }

    unbindWebSocket()
    {
    	this.webSocket = null;
    	this.state = BridgeState.UnBind;
    }

    bindDeviceSocket(socket)
    {
    	if (this.state == BridgeState.Binded)
    	{
    		console.error("bridge already binded, please unbind first to bind another socket");
    		return;
    	}

    	this.deviceSocket = socket;

    	console.log("device socket binded, key:" + this.bridgeKey);

    	this.updateState();
    }

    send(senderSocket, data)
    {
    	if (this.state != BridgeState.Binded)
    	{
    		console.error("bridge not binded, send data ignored");
    		return;
    	}

    	if (senderSocket == this.webSocket)
    	{
    		this.deviceSocket.write(data);
    	}
    	else
    	{
    		this.webSocket.send(data);
    	}
    }
};

class BridgeManager { 
	constructor()
	{
		this.bridgeMap = {};
	}

	createBridge(bridgeKey)
	{
		if (this.bridgeMap.hasOwnProperty(bridgeKey))
		{
			console.error("already contains bridge with key:" + bridgeKey);
			return null;
		}

		var bridge = new Bridge(bridgeKey);
		this.bridgeMap[bridgeKey] = bridge;

		return bridge;
	}

	bindWebSocket(webSocket, bridgeKey) {

		if (!this.bridgeMap.hasOwnProperty(bridgeKey))
		{
			console.error("bridge not exist with key:" + bridgeKey);
			return null;
		}

		var bridge = this.bridgeMap[bridgeKey];
		bridge.bindWebSocket(webSocket);

		return bridge;
	}

	bindDeviceSocket(deviceSocket, bridgeKey)
	{
		if (!this.bridgeMap.hasOwnProperty(bridgeKey))
		{
			console.error("bridge not exist with key:" + bridgeKey);
			return null;
		}

		var bridge = this.bridgeMap[bridgeKey];
		bridge.bindDeviceSocket(deviceSocket);

		return bridge;
	}

};

var bridgeMgr = new BridgeManager();

module.exports = bridgeMgr;