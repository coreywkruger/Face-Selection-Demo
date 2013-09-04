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
	this.selectedObjectList = [];
	this.selectedFaces = [];
	this.selectedFaceHalos = []
	this.selectedFaceIndices = [];
	this.boundingBoxOn = true;
	this.previousObject = undefined;
	
	//Added 9-2-13
	//Group format: { group: [ face1, face2, ... ], material: mat }
	this.faceGroups = [];
	this.faceMode = false;
	this.hud = undefined;
	
	//Added 9-3-13
	this.faceGroupDropDown = document.getElementById( 'group-drop-down' );
	
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

		if ( event.button == 0 ) {
			
			var onHud = _this.hudClick( mouseVec );
			
			if ( !onHud ) {
				
				if ( _this.faceMode ) {//( event.button == 0 && !_this.selectingAnObject && _this.selectedObject != undefined ) {

					if ( _this.shifting ) {

						_this.appending = true;
						_this.getFace( mouseVec );
						
					} else {

						_this.appending = false;
						_this.getFace( mouseVec );
						
					}
					
				} else if ( !_this.faceMode ) {//( event.button == 0 && _this.selectingAnObject ) {
					
					if ( _this.shifting ) {
						
						_this.appending = true;
						_this.getObject( mouseVec );
						
					} else {
						
						_this.appending = false;
						_this.getObject( mouseVec );
					
					}
				
				}
				
			}
		
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

//Added 9-3-13
THREE.faceSelector.prototype.createFaceGroup = function () {
	
	var color =  new THREE.Color( 0xff0000 );
	//console.log( color );
	if ( this.selectedFaces.length === 0 ) return;
	
	//console.log( this.selectedObject.object );
	
	for ( var i = 0 ; i < this.selectedFaces.length ; i++ ) {
		//console.log( this.selectedObject.object.material.materials[ this.selectedObject.object.geometry.faces[ this.selectedFaces[ i ].index ].materialIndex ] );
		this.checkFaceGroupsDuplicates( this.selectedFaces[ i ] );
		//this.selectedObject.object.material.materials[ this.selectedObject.object.geometry.faces[ this.selectedFaces[ i ].index ].materialIndex ].visible = false;
		this.selectedObject.object.material.materials[ this.selectedObject.object.geometry.faces[ this.selectedFaces[ i ].index ].materialIndex ].color = color;
		this.selectedObject.object.geometry.verticesNeedUpdate = true;
		
	}
	
	this.faceGroups.push( {
						 
		group: this.selectedFaces,

		material: color

		} );
	
	//console.log( this.faceGroups );
	
};

//Added 9-3-13
THREE.faceSelector.prototype.changeGroupColor = function () {
	
	var group = this.faceGroupDropDown.selected.id;
	console.log( 'hellooooooo' );
	
};

//Added 9-3-13
THREE.faceSelector.prototype.selectAllInFaceGroup = function () {
	
	if ( this.selectedFaces.length === 0 || this.faceGroups.length === 0 ) return;
	
	var index = [];
	
	for ( var j = 0 ; j < this.selectedFaces.length ; j++ ) {
			
		for ( var i = 0 ; i < this.faceGroups.length ; i++ ) {

			for ( var k = 0 ; k < this.faceGroups[ i ].group.length ; k++ ) {
				
				if ( this.selectedFaces[ j ].index === this.faceGroups[ i ].group[ k ].index ) {
//					console.log( this.selectedFaces[ j ], this.faceGroups[ i ].group[ k ].index );
//					console.log( 'yeah' );
					//this.selectedFaces.push( this.faceGroups[ i ].group );
					index.push( i );
					
				}
						
			}
			
		}
		
	}
	
	if ( index.length > 0 ) {
		
		for ( var i = 0 ; i < index.length ; i++ ) {
			
			for ( var j = 0 ; j < this.faceGroups[ i ].group.length ; j++ ) {
				
				//this.checkFaceGroupsDuplicates( this.faceGroups[ i ].group[ j ] );
				this.selectedFaces.push( this.faceGroups[ i ].group[ j ] );
				
			}
			
		}
		
	}
	
	//this.deleteOldSelectedFaces();
	this.boundingBoxOn = true;
	this.updateRender();
	
};

//Added 9-3-13
THREE.faceSelector.prototype.checkFaceGroupsDuplicates = function ( face ) {
	
	for ( var i = 0 ; i < this.faceGroups.length ; i++ ) {
		
		for ( var j = 0 ; j < this.faceGroups[ i ].group.length ; j++ ) {
			
			if ( face.index === this.faceGroups[ i ].group[ j ].index ) {
				
				this.faceGroups[ i ].group.splice( j, 1 );
				
				if ( this.faceGroups[ i ].group.length === 0 ) {
				
					this.faceGroups.splice( i, 1 );
					
				}
				
			}
			
		}
		
	}
	
};

//Added 9-2-13
THREE.faceSelector.prototype.hudClick = function ( mouseVec ) {
	
	var ray = this.getMouseRay( mouseVec );
	var intersects = ray.intersectObjects( this.camera.hud.getHudObjects() );
	
	if ( intersects.length > 0 ) {

		if ( intersects[ 0 ].object.name === 'select-objects' ) {
				
			console.log( 'object-mode' );
			this.faceMode = false;
				
		} else if ( intersects[ 0 ].object.name === 'select-faces' ) {
			
			console.log( 'face-mode' );
			this.faceMode = true;
			
		} else if ( intersects[ 0 ].object.name === 'select-all' ) {
			
			console.log( 'select-all' );
			if ( !this.faceMode && this.selectedObject != undefined ) {
				
				this.boundingBoxOn = false;
				this.selectedObject == undefined;
				this.updateBoundingBox( true );
				
			} else if ( !this.faceMode && this.selectedObject == undefined ) {
				
				console.log( 'selecting all objects' );
				
			} else if ( this.faceMode && this.selectedFaces.length > 0 ) {
				
				//console.log( this.selectedFaces );
				this.boundingBoxOn = false;
				this.selectedFaces = [];
				this.updateBoundingBox( true );
				this.deleteOldSelectedFaces();
				
			} else if ( this.faceMode && this.selectedFaces.length === 0 ) {
				
				this.boundingBoxOn = true;
				
				for ( var i = 0 ; i < this.selectedObject.object.geometry.faces.length ; i++ ) {
					
					this.selectedFaces.push( { 
											face: this.selectedObject.object.geometry.faces[ i ],
											index: i
											} );
					
				}
				
				//this.renderSelection();
				//this.updateBoundingBox( false );
				this.updateRender();
				
			}
			
		} else if ( intersects[ 0 ].object.name === 'left' ) {
			
			/* do stuff*/
			console.log( 'left' );
			
//			for ( var i = 1 ; i < 10 ; i++ ) {
//				var r = this.camera.parent.rotation;
//				this.camera.parent.rotation.set( interpRot( r.x, 0, 0.1 * i ), interpRot( r.y, Math.PI / 2, 0.1 * i ), interpRot( r.z, 0, 0.1 * i ) ); 
//				
//			}
			this.camera.parent.rotation.set( 0, Math.PI / 2, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'right' ) {
			
			/* do stuff*/
			console.log( 'right' );
			this.camera.parent.rotation.set( 0, - Math.PI / 2, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'top' ) {
			
			/* do stuff*/
			console.log( 'top' );
			this.camera.parent.rotation.set( - Math.PI / 2, 0, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'bottom' ) {
			
			/* do stuff*/
			console.log( 'bottom' );
			this.camera.parent.rotation.set( Math.PI / 2, 0, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'front' ) {
			
			/* do stuff*/
			console.log( 'front' );
			this.camera.parent.rotation.set( 0, 0, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'back' ) {
			
			/* do stuff*/
			console.log( 'back' );
			this.camera.parent.rotation.set( 0, Math.PI, 0 );
			
		} else if ( intersects[ 0 ].object.name === 'color-picker' ) {
		
			/* do stuff */
			console.log( 'color-picker' );
			var colorPicker = window.open( '', 'formpopup', 'width=460, height=400, resizeable=yes, scrollbars=0');
			
			colorPicker.document.body.style.overflow = 'hidden';
			colorPicker.document.body.style.scroll = 'no';
			//console.log( colorPicker.document.body.style );

			colorPicker.document.write('<iframe id="content" src="./js/colorPicker/colorPicker.html" frameBorder="0" style="margin: 0 auto; padding: 0px;" />');
			var ifrm = colorPicker.document.getElementById( 'content' );

			ifrm.width = 440;//ifrm.contentWindow.document.body.width;//scrollWidth;
			ifrm.height = 350;//ifrm.contentWindow.document.body.height;//offsetHeight;
			colorPicker.focus();
			
//			ifrm.onload = function () {
//				
//				console.log( ifrm, '-----' );
//				var applyColor = ifram.document.getElementById( 'applyColor' );
//				var hideFaces = ifram.document.getElementById( 'hideFaces' );
//				var hex = colorPicker.document.getElementById( 'cp1_Hex' );
//				console.log( applyColor );
//				applyColor.onclick = function () {
//					console.log( 'blah' );
//					this.changeGroupColor();
//					
//				}
//				
//			}
			
			//colorPicker.body.syle.overflow = 'hidden';

			
		} else if ( intersects[ 0 ].object.name === 'create-group' ) {
			
			/* do stuff*/
			console.log( 'create-group' );
			this.createFaceGroup();

			for ( var j = this.faceGroupDropDown.length - 1 ; j >= 0 ; j-- ) {
				
				this.faceGroupDropDown.remove( j );
				
			}
			
			for ( var i = 0 ; i < this.faceGroups.length ; i++ ) {
				
				var menuGroup = document.createElement( 'option' );
				menuGroup.value = i;
				menuGroup.innerHTML = 'Group # ' + ( i + 1 );
				menuGroup.id = i;
				this.faceGroupDropDown.appendChild( menuGroup );
				
			}
			
		} else if ( intersects[ 0 ].object.name === 'hide-faces' ) {
			
			console.log( 'hide-faces' );
			
		} else if ( intersects[ 0 ].object.name === 'select-all-in-group' ) {
			
			this.selectAllInFaceGroup();
				
		}
		
		return true;
		
	} else {
		
		return false;
		
	}
	
};

//Added 9-2-13
function interpRot ( val1, val2, portion ) {
	
	var dif = Math.abs( val1 - val2 );
	
	return dif * portion;
	
}


//Added 9-2-13
THREE.faceSelector.prototype.setFaceMode = function ( flag ) {
	
	this.faceMode = flag;
	
};

//Added 9-2-13
THREE.faceSelector.prototype.setInitialGroups = function () {
	
	this.defaultMaterial = new THREE.MeshLambertMaterial( { color: 0x990000, shading: THREE.FlatShading } );
	
//	for ( var i = 0 ; i < this.objectList.length ; i++ ) {
//		
//		this.faceGroups.push( { object: this.objectList[ i ], faces : this.objectList[ i ].geometry.faces, material: this.defaultMaterial } );
//		this.objectList[ i ].material = new THREE.MeshFaceMaterial( [ this.defaultMaterial ] );//this.defaultMaterial;
//		THREE.GeometryUtils.setMaterialIndex( this.objectList[ i ].geometry, 0 );
//	}
//	
//	console.log( this.faceGroups );
	
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
	//var intersects = ray.intersectObject( this.selectedObject.object );
	var intersects = ray.intersectObjects( this.objectList );

	if ( intersects.length > 0 ) {

		this.selectedObject = intersects[ 0 ];
		
		this.selectedFace = { 'face': intersects[ 0 ].face, 'index': intersects[ 0 ].faceIndex };
		
		this.deleteOldSelectedFaces();
		
		this.renderSelection();

		this.updateBoundingBox( false );
		
	}
	
};

THREE.faceSelector.prototype.pushSelectedObjectList = function ( obj ) {
	
	if ( this.selectedObjectList.length > 0 ) {
		
		var present = false;
		
		for ( var i = 0 ; i < this.selectedObjectList.length ; i++ ) {
			
			if ( this.selectedObjectList[ i ].object.name === obj.object.name ) {
				
				present = true;
				
			}
			
		}
		
		if ( !present ) {
			
			this.selectedObjectList.push( obj );
			
		}
		
	} else {
		
		this.selectedObjectList.push( obj );
		
	}
	
};

THREE.faceSelector.prototype.removeSelectedObjectList = function ( obj ) {
	
	if ( this.selectedObjectList.length > 0 ) {
		
		var index = - 1;
		
		for ( var i = 0 ; i < this.selectedObjectList.length ; i++ ) {
			
			if ( this.selectedObjectList[ i ].object.name === obj.object.name ) {
				
				index = i;
				
			}
			
		}
		
		if ( index != - 1 ) {
			
			this.selectedObjectList.splice( index, 1 );
			
		}
		
	} else {
		
		this.selectedObjectList = [];
		
	}
	
};

THREE.faceSelector.prototype.getObject = function ( mouseVec ) {

	var ray = this.getMouseRay( mouseVec );
	
	var intersects; 
	
	this.deleteOldSelectedFaces();
	
	if ( this.objectList.length > 0 ) {

		var intersects = ray.intersectObjects( this.objectList );
		
		if ( intersects.length > 0 ) {

			//this.boundingBoxOn = true;
			
			if ( this.selectedObject != undefined ) {

				if ( this.selectedObject.object != intersects[ 0 ].object ) {

					this.boundingBoxOn = true;
					this.selectedObject = intersects[ 0 ];
					
					if ( this.appending ) {
						
						//this.selectedObjectList.push( intersects[ 0 ] );
						this.pushSelectedObjectList( intersects[ 0 ] );
						
					}
					
				} else if ( this.selectedObject.object == intersects[ 0 ].object ) {

					this.boundingBoxOn = false;
					this.selectedObject = undefined;
					
					if ( this.appending ) {
						
						this.removeSelectedObjectList( intersects[ 0 ] );
						
					} else {
						
						this.selectedObjectList = [];
						
					}
					
				}
				
			} else {
				
				this.boundingBoxOn = true;
				this.selectedObject = intersects[ 0 ];
				this.pushSelectedObjectList( intersects[ 0 ] );
				
			}
			
			this.updateBoundingBox( true );
		
		}
		
		console.log( this.selectedObjectList );
		
		//if ( this.selectedObject != undefined ) console.log( 'Seleced Object : ', this.selectedObject.object.name );
		
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
	//console.log( 'Number of Selected Faces:  ', this.selectedFaces.length );
	//console.log( 'From Object - ', this.selectedObject.object.name );
	
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