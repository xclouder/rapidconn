$(document).ready(function(){
	var url = 'ws://localhost:8080'
	console.log('ready, start connect ' + url)

	var ws = new WebSocket(url);
	ws.onopen = function () {
		console.log('ws onopen');
	    ws.send('from client: hello');
	};
	ws.onmessage = function (e) {
		console.log('ws onmessage');
		console.log('from server: ' + e.data);
	};
});
