var FluxData = require('../FluxData');
var spawn = require('child_process').spawn;
var fs = require('fs');
 
var mongoChans = require('../fdmongo').Channels;
var rssChans = require('../fdrss').Channels;
var tcpChans = require('../fdtcp').Channels;
var wsckChans = require('../fdwebsockets').Channels;

FluxData.Channel.channels.Mongo = mongoChans;
FluxData.Channel.channels.RSS = rssChans;
FluxData.Channel.channels.TCP = tcpChans;
FluxData.Channel.channels.WebSockets = wsckChans;

var fs = require('fs');
var path = require('path');

var basePath = __dirname;

var webServer = new FluxData.Channel({
	type: 'http.server'
});

var childApp = false;

function getRandomFileName(){
	return 'tester';
}
var getContentCfg = require(__dirname+'/fdide_server_project.json');
var getContentChan = new FluxData.Channel(getContentCfg);

var serveFile = new FluxData.Channel({
	type: 'udf',
	fn: function(httpConn){
		var request = httpConn.get('request');
		var response = httpConn.get('response');
		
		if(request.url=='' || request.url=='/'){
			request.url='/index.html';
		}
		
		switch(request.url){
			case '/lib/channel_list.json':
			
				response.write(JSON.stringify(FluxData.Channel.channels));
				response.end();
				break;
			case '/actions/save':
				
				break;
			case '/actions/stop':
				if(childApp){
					childApp.kill();
				}
				response.write('{"result": true}');
				response.end();
				break;
			case '/actions/test':
				//save a temp file
				if(!fs.existsSync('./temp')){
					fs.mkdirSync('./temp');
					var filename = './temp/'+getRandomFileName()+'.json'; 
					fs.writeFile(filename, JSON.stringify(request.post_content.appCfg), function(err){
						if(!err){
							//run the file
							
							childApp = spawn('node ./server.js '+filename);
							
							response.write('{"result": '+childApp.pid+'}');
							response.end();
						}else{
							response.write(err);
							response.end();
						}
					});
				}else{
					var filename = process.cwd()+'/temp/'+getRandomFileName()+'.json'; 
					fs.writeFile(filename, request.post_content.appCfg, function(err){
						if(!err){
							//run the file
							childApp = spawn('node', [process.cwd()+'/server.js',filename]);
							childApp.on('error', function(){
								console.log('child error');
								console.log(arguments);
							});
							
							childApp.on('close', function(){
								console.log('child close');
								console.log(arguments);
							});
							
							childApp.stdout.on('data', function(data){
								console.log(data.toString());
							});
							
							childApp.stderr.on('data', function(data){
								console.log(data.toString());
							});
						}else{
							response.write(err);
							response.end();
						}
						response.write('{"result": '+childApp.pid+'}');
						response.end();
					});
				}
				
				//console.log(JSON.parse(request.post_content));
				
				break;
			default:
				if(fs.existsSync(basePath+request.url)){
					//load the file
					var fileContent = fs.readFileSync(basePath+request.url);
					response.write(fileContent);
					response.end();
				}
				break;
		}
	}
});

webServer.connect(serveFile);
