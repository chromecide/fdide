
function mesh_editor(cfg, callback){
	
	var thisEditor = this;
	/*
	 * Configuration Validation
	 */
	EventEmitter2.call(this, arguments);
	if(!cfg.container){
		throw new Error('No Container Supplied');
	}
	
	if(!cfg.bgColor){
		cfg.bgColor = '#A7A7A7';
	}
	
	if(!cfg.width){
		cfg.width=800;
	}
	
	if(!cfg.height){
		cfg.height=800;
	}
	/*
	 * End Validation
	 */
	
	this.name = cfg.name;
	
	this.selectedLine = false;
	this.selectedChannel = false;
	
	this.currentLine = false;
	this.currentAttributeLine = false;
	
	this.channels = [];
	this.links = [];
	this.attribute_links = [];
	
	this.scale = 1;
	this.lastPanPos = false;
	
	/*
	 * Stage Setup
	 */
	this.stage = new Kinetic.Stage({
        container: cfg.container,
        width: cfg.width,
        height: cfg.height,
        stroke: 'black',
    	strokeWidth: 2
    });
    
    /*
     * end Stage Setup
     */
    
    /*
     * Layer Setup
     */
	this.bgLayer = new Kinetic.Layer({
    	name: "EditorBG"
    });
    
    var bgRect = new Kinetic.Rect({
    	width: this.stage.getWidth(),
    	height: this.stage.getHeight(),
        fill: '#D8D8D8',
        stroke: 'black',
        strokeWidth: 2
    });
    
    //position tracking for Panning editor
    bgRect.on('mousedown', function(){
    	thisEditor.lastPanPos = thisEditor.stage.getMousePosition();
    	document.body.style.cursor = "move";
    });
    
    bgRect.on('mousemove', function(){
    	
    	//panning
    	if(thisEditor.lastPanPos){
    		var newPos = thisEditor.stage.getMousePosition();
    		thisEditor.shapesLayer.setPosition({
    			x: thisEditor.shapesLayer.getX()-((thisEditor.lastPanPos.x-newPos.x)),
    			y: thisEditor.shapesLayer.getY()-((thisEditor.lastPanPos.y-newPos.y))
    		});
    		thisEditor.shapesLayer.draw();
    		thisEditor.linkLayer.setPosition({
    			x: thisEditor.linkLayer.getX()-((thisEditor.lastPanPos.x-newPos.x)),
    			y: thisEditor.linkLayer.getY()-((thisEditor.lastPanPos.y-newPos.y))
    		});
    		thisEditor.linkLayer.draw();
    		thisEditor.lastPanPos = newPos;
    	}
    	
    	//links
    	if(thisEditor.currentLine!==false){
          	if(!thisEditor.currentLine.line){
          		thisEditor.currentLine.line = new Kinetic.Line({
		            stroke: 'black',
				    strokeWidth: 2,
				    lineCap: 'round',
				    lineJoin: 'round',
		            points: [thisEditor.currentLine.start.x, thisEditor.currentLine.start.y, thisEditor.currentLine.start.x+1, thisEditor.currentLine.start.y+1]
	            });
          		thisEditor.linkLayer.add(thisEditor.currentLine.line);
          	}
          	
			var scaledHeight = thisEditor.stage.getHeight()*thisEditor.linkLayer.getScale().y;
    		var scaledUnit = thisEditor.stage.getHeight()/scaledHeight;
    		
          	var mousePos = thisEditor.stage.getMousePosition();
          	var layerPos = thisEditor.linkLayer.getPosition();
          	
          	thisEditor.currentLine.line.getPoints()[1].x = (mousePos.x-layerPos.x)*scaledUnit;
            thisEditor.currentLine.line.getPoints()[1].y = (mousePos.y-layerPos.y)*scaledUnit;
            
          	thisEditor.linkLayer.drawScene();
      	}
      	
      	if(thisEditor.currentAttributeLine!==false){
          	if(!thisEditor.currentAttributeLine.line){
          		thisEditor.currentAttributeLine.line = new Kinetic.Line({
		            stroke: 'black',
				    strokeWidth: 2,
				    lineCap: 'round',
				    lineJoin: 'round',
		            points: [thisEditor.currentAttributeLine.start.x, thisEditor.currentAttributeLine.start.y, thisEditor.currentAttributeLine.start.x+1, thisEditor.currentAttributeLine.start.y+1]
	            });
          		thisEditor.linkLayer.add(thisEditor.currentAttributeLine.line);
          	}
          	
			var scaledHeight = thisEditor.stage.getHeight()*thisEditor.linkLayer.getScale().y;
    		var scaledUnit = thisEditor.stage.getHeight()/scaledHeight;
    		
          	var mousePos = thisEditor.stage.getMousePosition();
          	var layerPos = thisEditor.linkLayer.getPosition();
          	
          	thisEditor.currentAttributeLine.line.getPoints()[1].x = (mousePos.x-layerPos.x)*scaledUnit;
            thisEditor.currentAttributeLine.line.getPoints()[1].y = (mousePos.y-layerPos.y)*scaledUnit;
            
          	thisEditor.linkLayer.drawScene();
      	}
    });
    
    bgRect.on('mouseup', function(){
    	thisEditor.lastPanPos = false;
    	document.body.style.cursor = "default";
    });
    
    this.bgLayer.add(bgRect);
    
	this.shapesLayer = new Kinetic.Layer({
		name: "ShapesLayer",
 		width: this.stage.getWidth(),
 		height: this.stage.getHeight()
 	});
    
    if(!cfg.MeshIn){
    	thisEditor.MeshIn = thisEditor.addChannel({
    		name: 'MeshIn',
    		type: 'MeshIn',
    		publish: false,
    		x: 20,
    		y: 20
    	});
    	
    	
    }else{
    	//custom meshIn Object
    }
    
    if(!cfg.MeshOut){
    	thisEditor.MeshOut = thisEditor.addChannel({
    		name: 'MeshOut',
    		type: 'MeshOut',
    		entity: false,
    		x: 20,
    		y: thisEditor.stage.getHeight()-140
    	});
    }else{
    	//custom MeshOut Object
    }
    
 	this.linkLayer = new Kinetic.Layer({
 		name: "linkLayer",
 		width: this.stage.getWidth(),
 		height: this.stage.getHeight()
 	});
 	
 	this.toolTipLayer = new Kinetic.Layer();
 	
 	this.tooltip = new Kinetic.Text({
        text: "",
        fontFamily: "Calibri",
        fontSize: 12,
        padding: 5,
        textFill: "white",
        fill: "black",
            alpha: 0.75,
            visible: false
        });
 
            //tooltipLayer.listen(false);
    this.toolTipLayer.add(this.tooltip);
 	
 	this.stage.add(this.bgLayer);
 	this.stage.add(this.linkLayer);
 	this.stage.add(this.shapesLayer)
 	this.stage.add(this.toolTipLayer);
 	/*
 	 * End Layer Setup
 	 */
 	
 	/*
 	 * MeshIn and MeshOut Channels 
 	 */
 	
 	if(callback){
 		callback(this);
 	}
}

	Kinetic.Global.extend(mesh_editor, EventEmitter2);

	mesh_editor.prototype.addChannel = function(channelCfg, callback){
		var thisEditor = this;
		var newChannel = new channel(channelCfg);
		
		newChannel.on('output_mousedown', function(output, ev){
			var lineStart = this.getPosition();
			lineStart.x += output.getPosition().x+(output.getWidth()/2);
			lineStart.y += output.getPosition().y+(output.getHeight()/2);
			
			thisEditor.currentLine = {
    			sourceChannel: newChannel,
    			sourceOutput: output,
    			start: lineStart
    		};
		});
		
		newChannel.on('input_mousedown', function(){
			if(thisEditor.currentLine){
				thisEditor.currentLine.targetChannel = this;
    			thisEditor.addLink();	
			}
    	});
    	
    	newChannel.on('input_mousemove', function(input){
    		var mousePos = thisEditor.stage.getMousePosition();
    		thisEditor.tooltip.setPosition(mousePos.x-(thisEditor.tooltip.getWidth()/2), mousePos.y - 30);
    		thisEditor.tooltip.setText(input.label?input.label:input.name);
            thisEditor.tooltip.show();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('input_out', function(){
    		thisEditor.tooltip.hide();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('output_mousemove', function(input){
    		var mousePos = thisEditor.stage.getMousePosition();
    		thisEditor.tooltip.setText(input.label?input.label:input.name);
    		thisEditor.tooltip.setPosition(mousePos.x-(thisEditor.tooltip.getWidth()/2), mousePos.y + 10);
            thisEditor.tooltip.show();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('output_mouseout', function(){
    		thisEditor.tooltip.hide();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('attribute_mousemove', function(attr){
    		var mousePos = thisEditor.stage.getMousePosition();
    		thisEditor.tooltip.setText(attr.label?attr.label:attr.name);
    		thisEditor.tooltip.setPosition(mousePos.x+10, mousePos.y-10);
            thisEditor.tooltip.show();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('attribute_mouseout', function(){
    		thisEditor.tooltip.hide();
            thisEditor.toolTipLayer.draw();
    	});
    	
    	newChannel.on('node_selected', function(node){
    		if(thisEditor.currentAttributeLine){
	    		thisEditor.currentAttributeLine.targetChannel = this;
	    		thisEditor.addAttributeLink();
    		}else{
    			if(thisEditor.selectedLine){
	    			thisEditor.selectedLine.setStroke('#000');
	    			linkLayer.draw();
	    			selectedLine = false;
	    		}
	    		if(thisEditor.selectedChannel){
	    			thisEditor.selectedChannel.content.setShadowColor('#000');
	    		}
	    		thisEditor.selectedChannel = node;
	    		thisEditor.selectedChannel.content.setShadowColor('red');	
    		}
    	});
    	
    	newChannel.on('attribute_click', function(attr){
    		if(thisEditor.currentLine){
    			thisEditor.currentLine.targetChannel = this;
	    		thisEditor.currentLine.targetAttribute = attr;
	    		thisEditor.addAttributeLink();	
    		}else{
    			if(!this.currentAttributeLine){
    				var lineStart = this.getPosition();
					lineStart.x += attr.getPosition().x+(attr.getWidth()/2);
					lineStart.y += attr.getPosition().y+(attr.getHeight()/2);
					thisEditor.currentAttributeLine = {
		    			sourceChannel: newChannel,
		    			sourceAttribute: attr,
		    			start: lineStart
		    		};
    			}
    		}
    	});
    	
    	newChannel.on('attribute_dblclick', function(attr){
    		var attrName = attr.name;
    		var value = prompt('Enter a value for: '+attrName, this.params[attrName]!==undefined?this.params[attrName]:'');
			if(this.type && this.type.params[attrName] && this.type.params[attrName].type=='object'){
				value = JSON.parse(value);
			}	
			//this.params[attrName] = value;
			this.set(attrName, value);
			thisEditor.currentAttributeLine = false;
			thisEditor.emit('param_set', [attrName, value]);
			//thisEditor.deselect();
    	});
    	
    	newChannel.on('param_set', function(params){
    		console.log('Attribute Set: '+params[0]);
    		console.log(params[1]);
    	});
    	
    	newChannel.on('dragmove', function(line, sChan, sOut, sAttr, tChan, tAttr){
    		thisEditor.emit('channel_moved', newChannel);
    	});
    	
    	thisEditor.channels.push(newChannel);
    	
    	thisEditor.shapesLayer.add(newChannel);
    	thisEditor.shapesLayer.draw();
    	
    	if(callback){
    		callback(newChannel);
    	}
    	thisEditor.emit('channel_added', newChannel);
    	
    	return newChannel;
	}

	mesh_editor.prototype.removeChannel = function(channel){
		var thisEditor = this;
		if(channel==thisEditor.MeshIn || channel==thisEditor.MeshOut){
			alert('You cannot remove this item');
		}else{
			//first remove any links that link to the supplied channel
			var linkLength = thisEditor.links.length;
			
			while(linkLength--){
				//TODO: move to removeLink
				var linkItem = thisEditor.links[linkLength];
				
				if(linkItem.sourceChannel==channel || linkItem.targetChannel==channel){
					thisEditor.removeLink(linkItem);
				}
			}
			
			var linkLength = thisEditor.attribute_links.length;
			
			while(linkLength--){
				//TODO: move to removeLink
				var linkItem = thisEditor.attribute_links[linkLength];
				
				if(linkItem.sourceChannel==channel || linkItem.targetChannel==channel){
					thisEditor.removeAttributeLink(linkItem);
				}
			}
			
			//now remove the channel from the channels list
			for(var i=0;i<thisEditor.channels.length;i++){
				if(thisEditor.channels[i]==channel){
					thisEditor.channels.splice(i, 1);
				}
			}
			channel.remove();
			thisEditor.shapesLayer.draw();
		}
		thisEditor.emit('channel_remove');
	}

	mesh_editor.prototype.getChannel = function(name){
		
		for(var i=0;i<this.channels.length;i++){
			if(this.channels[i].attrs.name==name){
				return this.channels[i];
			}
		}
	}

	mesh_editor.prototype.replaceChannel = function(){
		
	}
	mesh_editor.prototype.cancelLink = function(){
		var thisEditor = this;
		thisEditor.currentLine.line.remove();
		thisEditor.currentLine = false;
	}
	mesh_editor.prototype.addLink = function(sourceChannel, sourceOutput, targetChannel, callback){
		var thisEditor = this;
		if(arguments.length==0){//called from within the editor object
			sourceChannel = thisEditor.currentLine.sourceChannel;
			sourceOutput = thisEditor.currentLine.sourceOutput;
			targetChannel = thisEditor.currentLine.targetChannel;
		}else{
			
			if((typeof sourceChannel)=='string'){
				sourceChannel = this.getChannel(sourceChannel);
			}
			
			if((typeof sourceOutput=='string')){
				sourceOutput = sourceChannel.getOutput(sourceOutput);
			}
			if((typeof targetChannel)=='string'){
				targetChannel = this.getChannel(targetChannel);
			}

		}
		
		if(thisEditor.currentLine){
			thisEditor.currentLine.line.remove();
			thisEditor.currentLine = false;	
		}
		
		
		var lineStart = sourceChannel.getPosition();
		lineStart.x += sourceOutput.getPosition().x+(sourceOutput.getWidth()/2);
		lineStart.y += sourceOutput.getPosition().y+(sourceOutput.getHeight()/2);
		
		var lineEnd = targetChannel.getPosition();
		lineEnd.x+=20;
		lineEnd.y+=10;
		
		var newLine = new Kinetic.Line({
    		stroke: 'black',
		    strokeWidth: 2,
		    lineCap: 'round',
		    lineJoin: 'round',
            points: [lineStart.x, lineStart.y, lineEnd.x, lineEnd.y]
    	});
    	
    	thisEditor.linkLayer.add(newLine);
    	thisEditor.linkLayer.draw();
    	
    	newLine.on('mouseover', function(){
    		$('body').css('cursor', 'pointer');
    	});
    	
    	newLine.on('mouseout', function(){
    		$('body').css('cursor', 'default');
    	});
    	
    	var link = {
    		sourceChannel: sourceChannel,
    		sourceOutput: sourceOutput,
    		targetChannel: targetChannel,
    		line: newLine
    	};
    	
    	thisEditor.links.push(link);
    	
    	newLine.on('click', function(lnk){
    		return function(){
    			thisEditor.selectedLink = lnk;
	    		thisEditor.selectedLink.line.setShadowColor('red');
	    		thisEditor.linkLayer.draw();	
    		}
    	}(link));
    	
    	sourceChannel.on('dragmove', function(line, sChan,sOut, tChan){
    		return function(){
	    		var sourcePos = sChan.getPosition();
	    		sourcePos.x+=sOut.getPosition().x+(sOut.getWidth()/2);
	    		sourcePos.y+=sOut.getPosition().y+(sOut.getHeight()/2);
		    	
	    		line.getPoints()[0].x = sourcePos.x;
	            line.getPoints()[0].y = sourcePos.y;
	            thisEditor.linkLayer.draw();
           }
    	}(newLine, sourceChannel, sourceOutput, targetChannel));
    	
    	targetChannel.on('dragmove', function(line, sChan,sOut, tChan){
    		return function(){
    			
	    		var sourcePos = tChan.getPosition();
	    		sourcePos.x+=20;
	    		sourcePos.y+=10;
		    	
	    		line.getPoints()[1].x = sourcePos.x;
	            line.getPoints()[1].y = sourcePos.y;
	            thisEditor.linkLayer.draw();
           }
    	}(newLine, sourceChannel, sourceOutput, targetChannel));
    	
    	thisEditor.currentLine = false;
    	thisEditor.emit('link_added', link);
	}
	
	mesh_editor.prototype.removeLink = function(link){
		var thisEditor = this;
		for(var i=0;i<thisEditor.links.length;i++){
			if(thisEditor.links[i]==link){
				thisEditor.links[i].line.remove();
				thisEditor.links.splice(i, 1);
			}
		}
		thisEditor.linkLayer.draw();
		thisEditor.emit('link_removed');
	}
	
	mesh_editor.prototype.addAttributeLink = function(sourceChannel, sourceOutput, sourceAttribute, targetChannel, targetAttribute, callback){
		var thisEditor = this;
		if(arguments.length==0){//called from within the editor object
			if(thisEditor.currentLine){
				sourceChannel = thisEditor.currentLine.sourceChannel;
				sourceOutput = thisEditor.currentLine.sourceOutput;
				targetChannel = thisEditor.currentLine.targetChannel;
				targetAttribute = thisEditor.currentLine.targetAttribute;	
			}else{
				sourceChannel = thisEditor.currentAttributeLine.sourceChannel;
				sourceAttribute = thisEditor.currentAttributeLine.sourceAttribute;
				targetChannel = thisEditor.currentAttributeLine.targetChannel;
			}
		}else{
			
			if((typeof sourceChannel)=='string'){
				sourceChannel = this.getChannel(sourceChannel);
			}
			
			if((typeof sourceOutput=='string')){
				sourceOutput = sourceChannel.getOutput(sourceOutput);
			}
			
			if((typeof sourceAttribute=='string')){
				sourceAttribute = sourceChannel.getAttribute(sourceAttribute);
			}
			
			if((typeof targetChannel)=='string'){
				targetChannel = this.getChannel(targetChannel);
			}

			if((typeof targetAttribute=='string')){
				targetAttribute = targetChannel.getAttribute(targetAttribute);
			}
			
		}
		
		
		
		var lineStart = sourceChannel.getPosition();
		var lineEnd = targetChannel.getPosition();
		if(thisEditor.currentLine){
			lineStart.x += sourceOutput.getPosition().x+(sourceOutput.getWidth()/2);
			lineStart.y += sourceOutput.getPosition().y+(sourceOutput.getHeight()/2);
			
			lineEnd.x+=targetAttribute.getPosition().x+(targetAttribute.getWidth()/2);
			lineEnd.y+=targetAttribute.getPosition().y+(targetAttribute.getHeight()/2);	
		}else{
			lineStart.x += sourceAttribute.getPosition().x+(sourceAttribute.getWidth()/2);
			lineStart.y += sourceAttribute.getPosition().y+(sourceAttribute.getHeight()/2);
			
			lineEnd.x+=(targetChannel.getWidth()/2);
			lineEnd.y+=(targetChannel.getHeight()/2);
		}
		
		
		
		if(thisEditor.currentLine){
			thisEditor.currentLine.line.remove();
			thisEditor.currentLine = false;	
		}else{
			//it's a link to another channel or model
			if(thisEditor.currentAttributeLine){
				thisEditor.currentAttributeLine.line.remove();
				thisEditor.currentAttributeLine = false;
			}
		}
		
		var newLine = new Kinetic.Line({
    		stroke: 'black',
		    strokeWidth: 2,
		    lineCap: 'round',
		    lineJoin: 'round',
		    dashArray: [33, 10],
            points: [lineStart.x, lineStart.y, lineEnd.x, lineEnd.y]
    	});
    	
    	thisEditor.linkLayer.add(newLine);
    	thisEditor.linkLayer.draw();
    	
    	var link = {
    		sourceChannel: sourceChannel,
    		sourceOutput: sourceOutput,
    		sourceAttribute: sourceAttribute,
    		targetChannel: targetChannel,
    		targetAttribute: targetAttribute,
    		line: newLine
    	};
    	
    	thisEditor.attribute_links.push(link);
    	
    	sourceChannel.on('dragmove', function(line, sChan, sOut, sAttr, tChan, tAttr){
    		return function(){
	    		var sourcePos = sChan.getPosition();
	    		if(sOut){
	    			sourcePos.x+=sOut.getPosition().x+(sOut.getWidth()/2);
	    			sourcePos.y+=sOut.getPosition().y+(sOut.getHeight()/2);	
	    		}else{
	    			sourcePos.x+=sAttr.getPosition().x+(sAttr.getWidth()/2);
	    			sourcePos.y+=sAttr.getPosition().y+(sAttr.getHeight()/2);
	    		}
	    		
		    	
	    		line.getPoints()[0].x = sourcePos.x;
	            line.getPoints()[0].y = sourcePos.y;
	            thisEditor.linkLayer.draw();
	            
           }
    	}(newLine, sourceChannel, sourceOutput, sourceAttribute, targetChannel, targetAttribute));
    	
    	targetChannel.on('dragmove', function(line, sChan, sOut, sAttr, tChan, tAttr){
    		return function(){
	    		var sourcePos = tChan.getPosition();
	    		if(tAttr){
	    			sourcePos.x+=tAttr.getPosition().x+(tAttr.getWidth()/2);
	    			sourcePos.y+=tAttr.getPosition().y+(tAttr.getHeight()/2);	
	    		}else{
	    			sourcePos.x+=(tChan.getWidth()/2);
	    			sourcePos.y+=(tChan.getHeight()/2);
	    		}
		    	
	    		line.getPoints()[1].x = sourcePos.x;
	            line.getPoints()[1].y = sourcePos.y;
	            thisEditor.linkLayer.draw();
           }
    	}(newLine, sourceChannel, sourceOutput, sourceAttribute, targetChannel, targetAttribute));
    	
    	thisEditor.currentLine = false;
    	thisEditor.emit('link_added', link);
	}
		
	
	mesh_editor.prototype.removeAttributeLink = function(link){
		var thisEditor = this;
		for(var i=0;i<thisEditor.attribute_links.length;i++){
			if(thisEditor.attribute_links[i]==link){
				thisEditor.attribute_links[i].line.remove();
				thisEditor.attribute_links.splice(i, 1);
			}
		}
		thisEditor.linkLayer.draw();
	}
	
	mesh_editor.prototype.removeSelected = function(){
		var thisEditor = this;
		if(thisEditor.selectedLine){
			thisEditor.removeLink(thisEditor.selectedLine);
			thisEditor.selectedLine = false;
		}
	}
	
	mesh_editor.prototype.deselect = function(){
		var thisEditor = this;
		//remove highlighting
		if(thisEditor.selectedLink){
			thisEditor.selectedLink.line.setShadowColor('none');
			thisEditor.linkLayer.draw();
			thisEditor.selectedLink = false;
		}
		
		if(thisEditor.selectedChannel){
			thisEditor.selectedChannel.content.setShadowColor('#000');
			thisEditor.shapesLayer.draw();
			thisEditor.selectedChannel = false
		}
		
		if(thisEditor.currentLine){
			thisEditor.currentLine.line.remove();
			thisEditor.linkLayer.draw();
			thisEditor.currentLine = false;	
		}
		
		if(thisEditor.currentAttributeLine){
			thisEditor.currentAttributeLine.line.remove();
			thisEditor.linkLayer.draw();
			thisEditor.currentAttributeLine = false;	
		}
		
	}
	
	mesh_editor.prototype.setScale = function(scale){
		this.scale = scale;
		this.shapesLayer.setScale(scale);
		this.shapesLayer.draw();
		this.linkLayer.setScale(scale);
		this.linkLayer.draw();
	}
	
	mesh_editor.prototype.getScale = function(){
		return this.scale;
	}
	
	mesh_editor.prototype.getScript = function(){
		var chanConfig = [];
		
		for(var i=0;i<this.channels.length;i++){
			var chan = this.channels[i];
			var chanItem = {};
			chanItem.name = chan.name;
			chanItem.type = chan.typeName;
			var chanParams = chan.getChannelParams();
			
			for(var paramKey in chanParams){
				chanItem[paramKey] = chan[paramKey];
			}
			chanConfig.push(chanItem);
		}
		
		var linkConfig = [];
		for(var i=0;i<this.links.length;i++){
			var link = {};
			
			link.name = this.links[i].sourceChannel.name;
			link.source = this.links[i].sourceOutput.name;
			link.target = this.links[i].targetChannel.name;
			linkConfig.push(link);
		}
		
		var attrLinkConfig = [];
		for(var i=0;i<this.attribute_links.length;i++){
			var link = {};
			
			link.name = this.attribute_links[i].sourceChannel.name;
			
			if(this.attribute_links[i].sourceOutput){
				link.source = this.attribute_links[i].sourceOutput.name;	
			}
			
			if(this.attribute_links[i].sourceAttribute){
				link.attribute = this.attribute_links[i].sourceAttribute.name;
			}
			
			link.target = this.attribute_links[i].targetChannel.name;
			if(this.attribute_links[i].targetAttribute){
				link.targetAttribute = this.attribute_links[i].targetAttribute.name;	
			}
			
			attrLinkConfig.push(link);
		}
		
		var outputObj = {
			name: this.name,
			type: 'mesh',
			channels: chanConfig,
			links: linkConfig,
			attributeLinks: attrLinkConfig
		}
		
		return outputObj;
	}
	
	mesh_editor.prototype.getProject = function(){
		var chanConfig = [];
		
		for(var i=0;i<this.channels.length;i++){
			var chan = this.channels[i];
			var chanItem = {};
			chanItem.name = chan.name;
			chanItem.type = chan.typeName;
			chanItem.position = chan.getPosition();
			var chanParams = chan.getChannelParams();
			
			for(var paramKey in chanParams){
				chanItem[paramKey] = chanParams[paramKey];
			}
			
			chanConfig.push(chanItem);
		}
		
		var linkConfig = [];
		for(var i=0;i<this.links.length;i++){
			var link = {};
			
			link.name = this.links[i].sourceChannel.name;
			link.source = this.links[i].sourceOutput.name;
			link.target = this.links[i].targetChannel.name;
			linkConfig.push(link);
		}
		
		var attrLinkConfig = [];
		for(var i=0;i<this.attribute_links.length;i++){
			var link = {};
			
			link.name = this.attribute_links[i].sourceChannel.name;
			
			if(this.attribute_links[i].sourceOutput){
				link.source = this.attribute_links[i].sourceOutput.name;	
			}
			if(this.attribute_links[i].sourceAttribute){
				link.sourceAttribute = this.attribute_links[i].sourceAttribute.name;
			}
			
			link.target = this.attribute_links[i].targetChannel.name;
			if(this.attribute_links[i].targetAttribute){
				link.attribute = this.attribute_links[i].targetAttribute.name;	
			}
			
			attrLinkConfig.push(link);
		}
		
		var outputObj = {
			name: this.name,
			type: 'mesh',
			channels: chanConfig,
			links: linkConfig,
			attributeLinks: attrLinkConfig
		}
		
		return outputObj;
	}
	
	mesh_editor.prototype.getApp = function(){
		
	}
