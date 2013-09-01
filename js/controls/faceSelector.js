THREE.faceSelector = function( scene, camera, scalex, scaley, domElement ) {
	
	var _this = this;
	this.camera = camera;
	
	this.object = undefined;
	this.objectList = [];
	
	this.pivot =  ( this.camera.parent !== undefined ) ? this.camera.parent : this.camera;//this.camera.parent;
	this.scene = scene;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	this.globalPosition = new THREE.Vector3().copy( ( this.pivot ).localToWorld( this.camera.position.clone() ) );
	this.pivotPosition = new THREE.Vector3().copy( this.pivot.position );
	//this.prevPosition = new THREE.Vector3().copy( this.object.position );
	this.direction = new THREE.Vector3(0,0,0);
	this.zInitOffset = _this.camera.position.sub(_this.pivot.position).length();
	this.zOffset = 0;
    this.scaleW = scalex;
    this.scaleH = scaley;
	this.dragStart = new THREE.Vector3(0,0,0);
	this.dragEnd = new THREE.Vector3(0,0,0);
	this.clicked = false;
	this.moving = false;
	
	this.shifting = false;
	this.selectingAnObject = false;
	this.multiSelectionKey = 16;
	this.objectSelectionKey = 18;
	this.appending = false;
	
	//Selection stuff
	this.boundingBoxObject = new THREE.boundingBox( this.scene, this.domElement, this.camera );
	this.boundingBoxObject.createBox();
	this.boundingBoxObject.setVisibility( false );
	////////
	
	this.selectedObject = undefined;
	this.selectedFaces = [];
	this.selectedFaceHalos = []
	this.selectedFaceIndices = [];
	this.boundingBoxOn = true;
	this.previousObject = undefined;
	
	
	this.verts = [];
	this.minVec = undefined;
	this.maxVec = undefined;
	this.selectedFace = undefined;
	
	function getMouseVector (element, clientX, clientY, zOffset) {
		return {
		x:   _this.scaleW * ( clientX - element.offsetLeft - element.style.width.slice(0, -2) / 2 ),
		y: - _this.scaleH * ( clientY - element.offsetTop - element.style.height.slice(0, -2) / 2 ),
		z: zOffset
		};
	}
	
	function mousedown ( event ) {
		
		event.stopPropagation();
		event.preventDefault();

		var mouseVec = getMouseVector( _this.domElement, event.pageX, event.pageY, _this.zOffset );

		if ( event.button == 0 && !_this.selectingAnObject && _this.selectedObject != undefined ) {
			
			if ( _this.shifting ) {

				_this.appending = true;
				_this.getFace( mouseVec );
				
			} else {

				_this.appending = false;
				_this.getFace( mouseVec );
				
			}
			
		} else if ( event.button == 0 && _this.selectingAnObject ) {
			
			_this.getObject( mouseVec );
		
		}
		
	}
	
	function keydown ( event ) {

		event.stopPropagation();
		event.preventDefault();
		
		if ( event.keyCode == _this.multiSelectionKey ) _this.shifting = true, _this.appending = true;
		if ( event.keyCode == _this.objectSelectionKey ) _this.selectingAnObject = true;
	}
	
	function keyup ( event ) {
		
		if ( event.keyCode == _this.multiSelectionKey ) _this.shifting = false, _this.appending = false;
		if ( event.keyCode == _this.objectSelectionKey ) _this.selectingAnObject = false;
		
	}
	
	function mousemove ( event ) {
		
		if ( !this.clicked ) return;
		event.stopPropagation();
		this.moving = true;
		
	}
	
	function mouseup ( event ) {
		
		event.stopPropagation();
		this.clicked = false;
		
	}
	
	_this.domElement.addEventListener( 'mousedown', mousedown, false );
	document.addEventListener( 'keydown', keydown, false );
	document.addEventListener( 'keyup', keyup, false );
	document.addEventListener( 'mousemove', mousemove, false );
	document.addEventListener( 'mouseup', mouseup, false );
	
};

THREE.faceSelector.prototype.updateBoundingBox = function ( wholeMesh ) {
	
	if ( this.boundingBoxOn ) {

		this.boundingBoxObject.setVisibility( true );
		this.updateBoundaries( wholeMesh );
		
		this.boundingBoxObject.setSize( this.boundaryWidth, this.boundaryHeight, this.boundaryDepth );
		
		var pos = this.minVec.add( this.selectedObject.object.position );
		this.boundingBoxObject.setPosition( pos.x, pos.y, pos.z );
		
		this.boundingBoxObject.updateBoxAttributes();
		
	} else  {

		this.boundingBoxObject.setVisibility( false );
		
	}
	
};

THREE.faceSelector.prototype.updateRender = function () {
	
	this.appending = true;
	
	this.renderSelection();
	
	this.updateBoundingBox( false );
	
	this.appending = false;
	
};

THREE.faceSelector.prototype.getMouseRay = function ( mouseVec ) {

	this.globalPosition = this.pivot.localToWorld( this.camera.position.clone() );
	this.zOffset = this.globalPosition.clone().sub( this.pivot.position ).length() - this.zInitOffset;
	this.dragStart = new THREE.Vector3( mouseVec.x, mouseVec.y, mouseVec.z ).applyEuler( this.pivot.rotation, this.pivot.rotation.order ).add( this.pivot.position );
	
	return new THREE.Raycaster( this.globalPosition, this.dragStart.sub( this.globalPosition ).normalize(), 0, 500 );
	
};

THREE.faceSelector.prototype.getFace = function ( mouseVec ) {

	var ray = this.getMouseRay( mouseVec );
	var intersects = ray.intersectObject( this.selectedObject.object );

	if ( intersects.length > 0 ) {

		clicked = true;
		
		this.selectedFace = { 'face': intersects[ 0 ].face, 'index': intersects[ 0 ].faceIndex };
		
		this.deleteOldSelectedFaces();
		
		this.renderSelection();

		this.updateBoundingBox( false );
		
	}
	
};

THREE.faceSelector.prototype.getObject = function ( mouseVec ) {

	var ray = this.getMouseRay( mouseVec );
	
	var intersects; 
	
	this.deleteOldSelectedFaces();
	
	if ( this.objectList.length > 0 ) {

		var intersects = ray.intersectObjects( this.objectList );
		
		if ( intersects.length > 0 ) {
		
			clicked = true;

			this.boundingBoxOn = true;
			
			if ( this.selectedObject != undefined ) {

				if ( this.selectedObject.object != intersects[ 0 ].object ) {

					this.boundingBoxOn = true;
					this.selectedObject = intersects[ 0 ];
					this.updateBoundingBox( true );
					
				} else if ( this.selectedObject.object == intersects[ 0 ].object ) {

					this.boundingBoxOn = false;
					this.selectedObject = undefined;
					this.updateBoundingBox( true );
					
				}
				
				this.updateBoundingBox( true );
				
			} else {
				
				this.boundingBoxOn = true;
				this.selectedObject = intersects[ 0 ];
				this.updateBoundingBox( true );
				
			}
		
		}
		
		if ( this.selectedObject != undefined ) console.log( 'Seleced Object : ', this.selectedObject.object.name );
		
	}
	
};

THREE.faceSelector.prototype.renderSelection = function () {
	
	if ( this.appending ) {
		
		var present = false;
		
		for ( var i = 0 ; i < this.selectedFaces.length ; i++ ) {
			
			if ( this.selectedFace.face == this.selectedFaces[ i ].face ) {

				present = true;
				
				this.selectedFaces.splice( i, 1 );
				
				if ( this.selectedFaces.length == 0 ) this.boundingBoxOn = false;
				
			}
			
		}
		
		if ( !present ) {
			
			this.selectedFaces.push( this.selectedFace );
			this.boundingBoxOn = true;

		}
		
	} else {
		
		if ( this.selectedFaces.length == 1 && this.selectedFaces[ 0 ].face == this.selectedFace.face ) {
			
			this.boundingBoxOn = false;
			this.selectedFaces = [];
			
		} else {
		
			this.boundingBoxOn = true;
			this.selectedFaces = [];
			this.selectedFaces[ 0 ] = this.selectedFace;
			
		}
		
	}
	
	//Print faces
	console.log( 'Number of Selected Faces:  ', this.selectedFaces.length );
	console.log( 'From Object - ', this.selectedObject.object.name );
	
	this.verts = [];
	var obj = this.selectedObject.object;
	
	for ( j = 0 ; j < this.selectedFaces.length ; j++ ) {
		
		this.verts.push( obj.geometry.vertices[ this.selectedFaces[ j ].face.a ].clone().applyEuler( obj.rotation, obj.rotation.order ),
				   obj.geometry.vertices[ this.selectedFaces[ j ].face.b ].clone().applyEuler( obj.rotation, obj.rotation.order ),
				   obj.geometry.vertices[ this.selectedFaces[ j ].face.c ].clone().applyEuler( obj.rotation, obj.rotation.order ) );
		
	}
	
	var bbVec = new THREE.Vector3().copy( this.selectedObject.object.position.clone().add( this.selectedFace.face.centroid ) );
	
	var matSelectedFace = new THREE.LineBasicMaterial( { color: 0x00ee00, linewidth: 2 } );
	
//	this.deleteOldSelectedFaces();
	
	this.selectedFaceHalos = [];
	
	for ( j = 0, i = 0 ; j < this.selectedFaces.length ; j++, i +=3 ) {
		
		var haloFace = new THREE.Geometry();
		haloFace.lineFace( this.verts[ i ], this.verts[ i + 1 ], this.verts[ i + 2 ] );
		var faceHalo = new THREE.Line( haloFace, matSelectedFace );
		
		faceHalo.position = this.selectedObject.object.position.clone();
		
		this.selectedFaceHalos.push( faceHalo );
		this.scene.add( faceHalo );
		
	}
	
};

THREE.faceSelector.prototype.deleteOldSelectedFaces = function () {
	
	for ( var k = 0 ; k < this.selectedFaceHalos.length ; k++ ) {
		
		this.scene.remove( this.selectedFaceHalos[ k ] );
		
	}
	
};

THREE.faceSelector.prototype.updateBoundaries = function ( wholeMesh ) {
	
	if ( this.selectedObject.object != undefined ) this.selectedObject.object.geometry.computeBoundingSphere();
	
	if ( wholeMesh ) { 
		
		if ( this.selectedObject != undefined ) {
			
			this.verts = [];
			
			for ( var i = 0 ; i < this.selectedObject.object.geometry.vertices.length ; i++ ) {
			
				this.verts.push( this.selectedObject.object.geometry.vertices[ i ].clone().applyEuler( this.selectedObject.object.rotation, this.selectedObject.object.rotation.order ) );
				
			}
			
		}
		
	}
		
	this.minVec = new THREE.Vector3( this.verts[ 0 ].x, this.verts[ 0 ].y, this.verts[ 0 ].z );
	this.maxVec = new THREE.Vector3( this.verts[ 0 ].x, this.verts[ 0 ].y, this.verts[ 0 ].z );
	
	for ( i = 1 ; i < this.verts.length ; i++ ) {
		
		if ( this.verts[ i ].x < this.minVec.x  ) this.minVec.x = this.verts[ i ].x;
		if ( this.verts[ i ].y < this.minVec.y  ) this.minVec.y = this.verts[ i ].y;
		if ( this.verts[ i ].z < this.minVec.z  ) this.minVec.z = this.verts[ i ].z;
		
		if ( this.verts[ i ].x > this.maxVec.x  ) this.maxVec.x = this.verts[ i ].x;
		if ( this.verts[ i ].y > this.maxVec.y  ) this.maxVec.y = this.verts[ i ].y;
		if ( this.verts[ i ].z > this.maxVec.z  ) this.maxVec.z = this.verts[ i ].z;
		
	}

	this.boundaryWidth = Math.abs( this.minVec.x - this.maxVec.x );
	this.boundaryHeight = Math.abs( this.minVec.y - this.maxVec.y );
	this.boundaryDepth = Math.abs( this.minVec.z - this.maxVec.z );
		
	
};

THREE.faceSelector.prototype.useBoundingBox = function ( flag ) {
	
	this.boundingBoxOn = flag;
	
};

THREE.faceSelector.prototype.addObject = function ( mesh ) {

	if ( mesh instanceof Array) {
		
		for ( var i = 0 ; i < mesh.length ; i++ ) {
			
			var meshPresent = false;
			
			for ( var j = 0 ; j < this.objectList.length ; j++ ) {
				
				if ( mesh[ i ] == this.objectList[ j ] ) meshPresent = true;
				
			}
			
			if ( !meshPresent ) this.objectList.push( mesh[ i ] );
			
		}
		
	} else {
		
		this.objectList.push( mesh );
		
	}
	
};

THREE.faceSelector.prototype.getActiveInfo = function () {
	
	if ( this.selectedObject == undefined ) {
		
		return undefined;
		
	} else  {
	
		return {
		
		object: this.selectedObject.object,
			
		faces: this.selectedFaces
			
		};
		
	}
	
};