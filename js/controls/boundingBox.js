THREE.boundingBox = function( scene, domElement, camera ) {
	
	var _this = this;
	this.domElement = domElement;
	this.scene = scene;
	this.camera = camera;
	
	this.boundingBoxGeo = undefined;
	this.boundingBoxMesh = undefined;
	this.anchor = new THREE.Object3D();
	this.scene.add( this.anchor );
	
	this.matBoundingBox = new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 1 } );
	
	this.width = 1;
	this.height = 1;
	this.depth = 1;
	
	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	this.arrowX = undefined;
	this.arrowY = undefined;
	this.arrowZ = undefined;
	
	this.scales = this.camera.getViewScales();
	
};

THREE.boundingBox.prototype.setVisibility = function ( flag ) {
	
	this.anchor.visible = flag;
	
	function visibility ( obj, flag ) {
		
		obj.visible = flag;
		
		if ( obj.children.length > 0 ) {
		
			for ( var i = 0 ; i < obj.children.length ; i++ ) {

				visibility( obj.children[ i ], flag );
				
			}
			
		}
		
	}
	
	visibility( this.anchor, flag );
	
};

THREE.boundingBox.prototype.setSize = function ( x, y, z ) {
	
	this.width = x;
	this.height = y;
	this.depth = z;
	
};

THREE.boundingBox.prototype.setPosition = function ( x, y, z ) {
	
	this.x = x;
	this.y = y;
	this.z = z;
	
};

THREE.boundingBox.prototype.createBox = function () {
	
	this.boundingBoxGeo = new THREE.Geometry();
	this.boundingBoxGeo.verticesNeedUpdate = true;
	this.boundingBoxGeo.lineCube();
	
	this.boundingBoxMesh = new THREE.Line( this.boundingBoxGeo, this.matBoundingBox );
	
	this.boundingBoxMesh.scale.x = this.width;
	this.boundingBoxMesh.scale.y = this.height;
	this.boundingBoxMesh.scale.z = this.depth;
	
	this.anchor.add( this.boundingBoxMesh );
	this.createArrows();
	
};

THREE.boundingBox.prototype.updateBoxWidth = function ( x ) {
	
	this.width = x;
	
};

THREE.boundingBox.prototype.updateBoxHeight = function ( y ) {
	
	this.height = y;
	
};

THREE.boundingBox.prototype.updateBoxDepth = function ( z ) {
	
	this.depth = z;
	
};

THREE.boundingBox.prototype.updateBoxAttributes = function () {
	
	this.boundingBoxMesh.scale.x = this.width;
	this.boundingBoxMesh.scale.y = this.height;
	this.boundingBoxMesh.scale.z = this.depth;
	
	this.anchor.position.x = this.x;
	this.anchor.position.y = this.y;
	this.anchor.position.z = this.z;
	
};

THREE.boundingBox.prototype.createArrows = function () {
	
	this.arrowX = new THREE.ArrowHelper(new THREE.Vector3( 1, 0, 0), new THREE.Vector3( 0, 0, 0), 2, 0xFF0000);
	this.arrowY = new THREE.ArrowHelper(new THREE.Vector3( 0, 1, 0), new THREE.Vector3( 0, 0, 0), 2, 0x00FF00);
	this.arrowZ = new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 1), new THREE.Vector3( 0, 0, 0), 2, 0x0000FF);
	
	var HandleMaterial = function ( color, opacity ) {
		var material = new THREE.MeshBasicMaterial();
		material.color = color;
		material.side = THREE.DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;
		material.opacity = opacity !== undefined ? opacity : 1;
		material.transparent = true;
		return material;
	}
	
	var LineMaterial = function ( color, opacity ) {
		var material = new THREE.LineBasicMaterial();
		material.color = color;
		material.depthTest = false;
		material.depthWrite = false;
		material.opacity = opacity !== undefined ? opacity : 1;
		material.transparent = true;
		return material;
	}

	this.arrowX.cone.material = HandleMaterial( new THREE.Color( 0xFF0000 ), 1 );
	this.arrowY.cone.material = HandleMaterial( new THREE.Color( 0x00FF00 ), 1 );
	this.arrowZ.cone.material = HandleMaterial( new THREE.Color( 0x0000FF ), 1 );
	this.arrowX.line.material = LineMaterial( new THREE.Color( 0xFF0000 ), 1 );
	this.arrowY.line.material = LineMaterial( new THREE.Color( 0x00FF00 ), 1 );
	this.arrowZ.line.material = LineMaterial( new THREE.Color( 0x0000FF ), 1 );
	
	this.anchor.add( this.arrowX );
	this.anchor.add( this.arrowY );
	this.anchor.add( this.arrowZ );

	//this.gr1 = new THREE.grabber( this.arrowX, this.camera, this.scales.width, this.scales.height, this.domElement );
	
};

THREE.Geometry.prototype.lineCube = function () {

	this.vertices.push( new THREE.Vector3( 0, 0, 0 ), 
			  new THREE.Vector3( 0, 1, 0 ), 
			  new THREE.Vector3( 1, 1, 0 ), 
			  new THREE.Vector3( 1, 0, 0 ),
			  new THREE.Vector3( 0, 0, 0 ),
			  new THREE.Vector3( 0, 0, 1 ),
			  new THREE.Vector3( 0, 1, 1 ),
			  new THREE.Vector3( 1, 1, 1 ),
			  new THREE.Vector3( 1, 0, 1 ),
			  new THREE.Vector3( 0, 0, 1 ),
			  new THREE.Vector3( 1, 0, 1 ),
			  new THREE.Vector3( 1, 0, 0 ),
			  new THREE.Vector3( 1, 1, 0 ),
			  new THREE.Vector3( 1, 1, 1 ),
			  new THREE.Vector3( 0, 1, 1 ),
			  new THREE.Vector3( 0, 1, 0 ) );
	
};

THREE.Geometry.prototype.lineFace = function ( v0, v1, v2 ) {
	
	this.vertices.push( v0, v1, v2, v0 );
	
};