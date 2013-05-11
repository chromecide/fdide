function channel(cfg, callback){
	var self = this;
	console.log(cfg);
	this.typeName = 'channel';
	this.type='channel';
	
	this.attributes = [];
	this.inputs = [];
	this.params = {};
	this.outputs = [];
	
	for(var key in cfg){
		this[key] = cfg[key];
	}
	
	this.text = this.name;
	
	if(this.type){
		if((typeof this.type)=='object'){
			this.typeName = this.type.name;
			//this.type = cfg.type;
		}else{
			this.typeName = this.type;
		}
		
		if(this.type.publish===false){
			this.publish = false;
		}
	}
	
	this.publishInput = new Kinetic.Rect({
		x: 10,
		y: 0,
		width: 20,
		height: 20,
		stroke: 'black',
		strokeWidth: 2,
		fill: '#FF7A7A',
    	shadowOffset: 3,
    	shadowOpacity: 0.5
	});
	
	this.publishInput.name = 'publish';
	this.publishInput.label = 'Publish';
	
	
	this.publishInput.on('mousedown', function(ip){
		self.fire('input_mousedown', this, this.publishInput);
	});
	
	this.publishInput.on('mousemove', function(ip){
		return function(){
			self.fire('input_mousemove', this, ip);	
		}
	}(this.publishInput));
	
	this.publishInput.on('mouseover', function(ip){
		return function(){
			self.fire('input_over', this, ip);	
		}
	}(this.publishInput));
	
	this.publishInput.on('mouseout', function(){
		self.fire('input_out', self.publishInput);
	});
	
	var contentWidth=100;
	var contentHeight = 100;
	
	
	if(this.type.params){
		var paramCount=0;
		for(var key in this.type.params){
			paramCount++;
		}
		if(paramCount>3){
			console.log('SETTING HEIGHT');
			contentHeight = paramCount*35;	
		}
	}
	
	this.content = new Kinetic.Rect({
        x: 0,
        y: this.publish===false?0:20,
        width: contentWidth,
        height: contentHeight,
        name: 'inputhandle',
        fill: '#AAA',
        stroke: 'black',
        strokeWidth: 1,
    	shadowOffset: 3,
    	shadowOpacity: 0.5
    });
	
	this.content.on('mousedown', function(){
		self.setDraggable(true);
	});
  
  	this.content.on('mouseup', function(){
  		self.setDraggable(false);
  		self.fire('node_selected', self);
  	});
	
	var fontSize = 18;
	
	this.label = new Kinetic.Text({
	    x: 0,
	    y:this.publish===false?20:40,
	    text: this.text+'\n\n('+this.typeName+')',
	    fontSize: fontSize,
	    fontFamily: 'Calibri',
	    fill: '#000',
	    align: 'center'
  	});
	
	//auto adjust the label font size
	while (this.label.getWidth() > 90){
		this.label.setFontSize(--fontSize);	
	}
	
    this.label.setWidth(100);
	
	this.label.on('mousedown', function(){
		self.setDraggable(true);
	});
  
  	this.label.on('mouseup', function(){
  		self.setDraggable(false);
  		self.fire('node_selected', self);
  	});
	
	this.entityOutput = new Kinetic.Rect({
		width: 20,
		height: 20,
		stroke: 'black',
		strokeWidth: 1,
		x: 10,
	    y: this.publish===false?100:120,
		fill: '#7AFF7A',
    	shadowOffset: 3,
    	shadowOpacity: 0.5
	});
	
	this.entityOutput.name = 'entity';
	this.entityOutput.on('mousedown', function(ev){
		return function(){
			self.fire('output_mousedown', this, ev);
		}
	}(this.entityOutput));
	
	this.entityOutput.on('mousemove', function(ev){
		return function(){
			self.fire('output_mousemove', this, ev);
		}
	}(this.entityOutput));
	
	this.entityOutput.on('mouseout', function(ev){
		return function(){
			self.fire('output_mouseout', this, ev);
		}
	}(this.entityOutput));
	
	Kinetic.Group.call(this, cfg);
	
	if(this.publish!==false){
		this.add(this.publishInput);
		//this.add(this.publishLabel);	
	}
	
	//add the additional input connections
	console.log(this.type);
	if(this.type.inputs && this.type.inputs.length>0){
		
		var x = 35;
		var y = 0;//this.publish===false?100:120;
		
		for(var inIdx=0;inIdx<this.type.inputs.length;inIdx++){
			var input = new Kinetic.Rect({
				x: x,
				y: y,
				width: 20,
				height: 20,
				stroke: 'black',
				strokeWidth: 1,
				fill: '#FF7A7A',
		    	shadowOffset: 3,
		    	shadowOpacity: 0.5
			});
			
			this.add(input);
			
			x+=35;
		}
	}
	
	this.add(this.content);
	this.add(this.label);
	
	if(this.entity!=false){
		this.add(this.entityOutput);	
	}
	
	//add the additional output connections
	if(this.type.outputs && this.type.outputs.length>0){
		var x = 35;
		var y =  this.publish===false && (this.inputs && this.inputs.length==0)?100:120;
		
		for(var inIdx=0;inIdx<this.type.outputs.length;inIdx++){
			var output = new Kinetic.Rect({
				x: x,
				y: y,
				width: 20,
				height: 20,
				stroke: 'black',
				strokeWidth: 1,
				fill: '#7AFF7A',
		    	shadowOffset: 3,
		    	shadowOpacity: 0.5
			});
			
			output.name = this.type.outputs[inIdx].name;
			
			output.on('mousedown', function(ev){
				return function(){
					self.fire('output_mousedown', this, ev);
				}
			}(this.entityOutput));
			
			output.on('mousemove', function(ev){
				return function(){
					self.fire('output_mousemove', this, ev);
				}
			}(this.entityOutput));
			
			output.on('mouseout', function(ev){
				return function(){
					self.fire('output_mouseout', this, ev);
				}
			}(this.entityOutput));
			
			this.outputs.push(output);
			this.add(output);
			
			x+=35;
		}
	}
	
	//add the attribute connections
	if(this.type && this.type.params){
		var attrCount = 0;
		for(var attrKey in this.type.params){
			var attr = new Kinetic.Rect({
				x: 100,
				y: (attrCount*30)+30,
				width: 20,
				height: 20,
		        stroke: 'black',
		        strokeWidth: 1,
		        fill: '#7A7AFF'
			});
			
			attr.name = attrKey;
			
			attr.on('click', function(ev){
				return function(){
					self.fire('attribute_click', this, ev);
				}
			}(attr));
			
			attr.on('dblclick', function(ev){
				return function(){
					self.fire('attribute_dblclick', this, ev);
				}
			}(attr));
			
			attr.on('mousedown', function(ev){
				return function(){
					self.fire('attribute_mousedown', this, ev);
				}
			}(attr));
			
			attr.on('mousemove', function(ev){
				return function(){
					self.fire('attribute_mousemove', this, ev);
				}
			}(attr));
			
			attr.on('mouseout', function(ev){
				return function(){
					self.fire('attribute_mouseout', this, ev);
				}
			}(attr));
			
			attrCount++;
			
			this.attributes.push(attr);
			
			this.add(attr);
		}
		
	}
	
	this.getOutput = function(name){
		if(name=='entity'){
			return this.entityOutput;
		}

		for(var i=0;i<this.outputs.length;i++){
			
			if(this.outputs[i].name==name){
				return this.outputs[i];
			}
		}
	}
	
	this.get = function(name){
		return this[name];
	}
	
	this.set = function(name, value){
		this[name] = value;
		this.fire('attribute_set', this, arguments);
	}
	this.getAttribute = function(name){
		for(var i=0;i<this.attributes.length;i++){
			if(this.attributes[i].name==name){
				return this.attributes[i];
			}
		}
	}
	
	this.getChannelParams = function(){
		return this.type.params;
	}
	
	this.getWidth = function(){
		var children = this.getChildren();
		var width = 0;
		for( var i=0; i< children.length; i++){
			if(children[i].getWidth() > width)
				width = children[i].getWidth(); 
		}
		
		return width;
	}
	
	this.getHeight = function(){
		var children = this.getChildren();
		var height = 0;
		for( var i=0; i< children.length; i++){
			if(children[i].getHeight() > height)
				height = children[i].getHeight(); 
		}
		
		return height;
	}
	
	return this;
}

Kinetic.Global.extend(channel, Kinetic.Group);
