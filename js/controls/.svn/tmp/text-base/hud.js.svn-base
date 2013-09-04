THREE.hud = function( scene ) {
	
	var _this = this;
	
	this.buttons = [];
	this.buttonWidth = 1; 
	this.buttonHeight = 1;
	this.padding = 0.1;
	this.scene = scene;
	
};

THREE.hud.prototype.addButton = function ( object ) {
	
	if ( object instanceof Array ) {
		
		for ( var i = 0 ; i < object.length ; i++ ) {
			
			object[ i ].scale.x = this.buttonWidth;
			object[ i ].scale.y = this.buttonHeight;
			
			this.buttons.push( object[ i ] );
			this.scene.add( object[ i ] );
			
		}
		
	} else {
		
		object.scale.x = this.buttonWidth;
		object.scale.y = this.buttonHeight;
		
		this.buttons.push( object );
		this.scene.add( object );
		
	}
	
};

THREE.hud.prototype.spaceButtons = function () {
	
	var collectiveWidth = - this.padding;
	
	for ( var i = 0 ; i < this.buttons.length ; i++ ) {
		
		this.buttons[ i ].geometry.computeBoundingBox();
		
		var obWidth = this.buttonWidth;//Math.abs( this.buttons[ i ].geometry.boundingBox.min.x - this.buttons[ i ].geometry.boundingBox.max.x );
		this.buttons[ i ].position.x = collectiveWidth - ( i ) * this.padding - obWidth / 2;
		this.buttons[ i ].position.y = - obWidth / 2 - this.padding;
		collectiveWidth -= obWidth;

	}
		
};

THREE.hud.prototype.offsetButtons = function ( x, y, z ) {
	
	for ( var i = 0 ; i < this.buttons.length ; i++ ) {
		
		this.buttons[ i ].position.x += x;
		this.buttons[ i ].position.y += y;
		this.buttons[ i ].position.z -= z;
		
	}
	
};

THREE.hud.prototype.setButtonWidth = function ( width ) {

	this.buttonWidth = width;
	
};

THREE.hud.prototype.setButtonHeight = function ( height ) {
	
	this.buttonHeight = height;
	
};

THREE.hud.prototype.setPadding = function ( padding ) {
	
	this.padding = padding;
	
};

THREE.hud.prototype.getHudObjects = function () {

	return this.buttons;

};