var FluxData = require('../FluxData');

var mongoChans = require('../fdmongo').Channels;
var rssChans = require('../fdrss').Channels;
var tcpChans = require('../fdtcp').Channels;
var wsckChans = require('../fdwebsockets').Channels;

FluxData.Channel.channels.Mongo = mongoChans;
FluxData.Channel.channels.RSS = rssChans;
FluxData.Channel.channels.TCP = tcpChans;
FluxData.Channel.channels.WebSockets = wsckChans;

var appChannels = {}

for(var chanName in FluxData.Channel.channels){
	
	appChannels[chanName] = FluxData.Channel.channels[chanName];	
}

var filename = __dirname+'/fdide_server_project_base.json';

if(process.argv[2]){
	filename = process.argv[2];
}

var appCfg = require(filename);

var appMeshCfg = appCfg.App;

for(var meshName in appCfg){
	//if(meshName!='App'){
		FluxData.Channel.channels[meshName] = appCfg[meshName];
	//}
}
console.log('************************************************************************************************************');
var appMesh = new FluxData.Channel({
	name: 'App',
	type: 'App'
}, function(appMesh){
	appMesh.publish({});	
});


//process.exit();

