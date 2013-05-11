console.log('--------------------------------------------------');

var a = {"attribute":"url", "operator":"=", "value":"/lib/channels.js"}

var Data = require('../FluxData');
var tcpChans = require('../fdtcp').Channels;

Data.Channel.channels.TCP = tcpChans;

var logger = new Data.Channel('logger', 'console_log');

var app = new Data.Channel('App', {
        "name": "App",
        "type": "mesh",
        "channels": [
            {
                "name": "MeshIn",
                "type": "MeshIn"
            },
            {
                "name": "MeshOut",
                "type": "MeshOut"
            },
            {
                "name": "GetContent",
                "type": "GetContent"
            },
            {
                "name": "SendResponse",
                "type": "udf"
            },
            {
                "name": "GetResponse",
                "type": "get"
            },
            {
                "name": "WebServer",
                "type": "http"
            }
        ],
        "links": [
            {
                "name": "MeshIn",
                "source": "entity",
                "target": "WebServer"
            },
            {
                "name": "WebServer",
                "source": "entity",
                "target": "GetContent"
            },
            {
                "name": "MeshIn",
                "source": "entity",
                "target": "GetResponse"
            },
            {
                "name": "SendResponse",
                "source": "entity",
                "target": "MeshOut"
            }
        ],
        "attributeLinks": [
            {
                "name": "WebServer",
                "source": "entity",
                "target": "GetResponse",
                "attribute": "attribute"
            }
        ]
    });

var handlerMesh = new Data.Channel('testMesh',  {
        "name": "GetContent",
        "type": "mesh",
        "channels": [
            {
                "name": "MeshIn",
                "type": "MeshIn"
            },
            {
                "name": "MeshOut",
                "type": "MeshOut"
            },
            {
                "name": "GetRequest",
                "type": "get",
                "attribute": "Request"
            },
            {
                "name": "IsChannelList",
                "type": "filter",
                "query": null
            },
            {
                "name": "LoadChannelList",
                "type": "udf"
            },
            {
                "name": "LoadFile",
                "type": "udf"
            }
        ],
        "links": [
            {
                "name": "MeshIn",
                "source": "entity",
                "target": "GetRequest"
            },
            {
                "name": "GetRequest",
                "source": "entity",
                "target": "IsChannelList"
            },
            {
                "name": "IsChannelList",
                "source": "entity",
                "target": "LoadChannelList"
            },
            {
                "name": "LoadChannelList",
                "source": "entity",
                "target": "MeshOut"
            },
            {
                "name": "IsChannelList",
                "source": "fail",
                "target": "LoadFile"
            },
            {
                "name": "LoadFile",
                "source": "entity",
                "target": "MeshOut"
            }
        ],
        "attributeLinks": []
    });

app.connect('')


