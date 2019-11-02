var BridgeState = {
	UnBind:0,
	Binded:1,

    //暂时不用这个值
    Closed:2,
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

        console.log("unbind web socket, key:" + this.bridgeKey);
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

    unbindDeviceSocket(socket)
    {
        this.socket = null;
        this.state = BridgeState.UnBind;

        console.log("unbind device socket, key:" + this.bridgeKey);
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
        this.socket2KeyMap = {};
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

        this.registerSocketAndKey(webSocket, bridgeKey);

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

        this.registerSocketAndKey(deviceSocket, bridgeKey);

		return bridge;
	}

    registerSocketAndKey(socket, key)
    {
        if (this.socket2KeyMap.hasOwnProperty(socket))
        {
            console.error("already contains the socket, ignore regist");
            return;
        }

        this.socket2KeyMap[socket] = key;
    }

    unregisterSocketAndKey(socket, key)
    {
        if (!this.socket2KeyMap.hasOwnProperty(socket))
        {
            console.error("socket not registered, ignore");
            return;
        }

        delete this.socket2KeyMap[socket];
    }

    unbindDeviceSocket(deviceSocket)
    {
        if (this.socket2KeyMap.hasOwnProperty(deviceSocket))
        {
            var key = this.socket2KeyMap[deviceSocket];

            var bridge = this.bridgeMap[key];
            if (bridge)
            {
                bridge.unbindDeviceSocket(deviceSocket);
                //todo是否需要delete bridge?

                this.unregisterSocketAndKey(deviceSocket, key);
            }
            else
            {
                console.error("cannot find bridge with key:" + key);
            }
        }
    }

    unbindWebSocket(webSocket)
    {
        if (this.socket2KeyMap.hasOwnProperty(webSocket))
        {
            var key = this.socket2KeyMap[webSocket];

            var bridge = this.bridgeMap[key];
            if (bridge)
            {
                bridge.unbindWebSocket(webSocket);
                //todo是否需要delete bridge?

                this.unregisterSocketAndKey(webSocket, key);
            }
            else
            {
                console.error("cannot find bridge with key:" + key);
            }
        }
    }

};

var bridgeMgr = new BridgeManager();

module.exports = bridgeMgr;