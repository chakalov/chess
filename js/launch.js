var Application = {
	WIDTH: window.innerWidth,
	HEIGHT: window.innerHeight,
	VIEW_ANGLE: 45,
	NEAR: 0.1,
	FAR: 20000,
	
	COLOR_BLACK: 0x1F1F1F,
	COLOR_WHITE: 0xF1F1F1,
	
	SQUARE_SIZE: 128,
	
	APPLICATION_STATES: {
		RUNNING: 1,
		PAUSED: 0
	},
	
	MOUSE_STATES: {
		NOTHING_PRESSED:	0x00,
		BUTTON_PRESSED:		0x01
	},
	
	init: function (parent) {
		Application.mouseState = Application.MOUSE_STATES.NOTHING_PRESSED;
	
		// initialize the clock
		Application.clock = new THREE.Clock();
		
		// use the provided container
		Application.container = document.createElement('div');
		parent.appendChild(Application.container);
		
		// initialize the camera
		Application.camera = new THREE.PerspectiveCamera(Application.VIEW_ANGLE, Application.WIDTH / Application.HEIGHT, Application.NEAR, Application.FAR);
		Application.camera.position.set(0, 1000, 1000);
		
		// create the scene
		Application.scene = new THREE.Scene();
		Application.scene.fog = new THREE.FogExp2(0x556677, 0.00000025);
		
		// add invisible plane for intersections
		Application.plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2048, 2048, 8, 8),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				opacity: 0.25,
				transparent: true,
			})
		);
		Application.plane.visible = false;
		Application.plane.position.y = 150;
		Application.plane.rotation.x = -Math.PI / 2;
		Application.scene.add(Application.plane);
		
		// initialize the renderer
		Application.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		Application.renderer.setSize(Application.WIDTH, Application.HEIGHT);
		Application.renderer.setClearColor(Application.scene.fog.color, 1);
		
		// add the renderer in the container
		Application.container.appendChild(Application.renderer.domElement);
		
		// add stats
		Application.stats = new Stats();
		Application.stats.domElement.style.position = 'absolute';
		Application.stats.domElement.style.top = '0px';
		Application.stats.domElement.style.zIndex = 100;
			
		// add the stats in the container
		Application.container.appendChild(Application.stats.domElement);
		
		// add controls
		Application.controls = new THREE.OrbitControls(Application.camera);
		
		// add listeners
		window.addEventListener('resize', Application.onWindowResize, false);
		document.addEventListener('mousemove', Application.onMouseMove, false);
		document.addEventListener('mousedown', Application.onMouseDown, false );
		document.addEventListener('mouseup', Application.onMouseUp, false );
		
		// initialize mouse coordinates
		Application.mouse = {
			x: 0,
			y: 0
		};
		Application.selectedObject = null;
		
		// initialize raycaster for mouse coordinates
		Application.vector = new THREE.Vector3();
		Application.raycaster = new THREE.Raycaster();
		
		/* START INIT OBJECTS */
		this.chessBoard = new Application.ChessBoard();
		Application.scene.add(this.chessBoard);
		
		this.pieces = [];
		
		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.COLOR_WHITE);
			piece.position.set(-512 + 64 + i * 128, 50, 512 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}
		
		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.COLOR_WHITE);
			piece.position.set(-512 + 64 + i * 128, 50, 384 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}
		
		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.COLOR_BLACK);
			piece.position.set(384 + 64 - i * 128, 50, -384 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}
		
		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.COLOR_BLACK);
			piece.position.set(384 + 64 - i * 128, 50, -256 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}
		
		var spriteMaterial = new THREE.SpriteMaterial({ 
			map: new THREE.ImageUtils.loadTexture('textures/arrow.png'),
			color: 0xFF0000,
			transparent: false,
			blending: THREE.AdditiveBlending
		});
		Application.sprite = new THREE.Sprite(spriteMaterial);
		Application.sprite.scale.set(200, 200, 1.0);
		Application.sprite.visible = false;
		Application.scene.add(Application.sprite);
		
		// add droppoints
		this.dropPoints = [];
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var dropPoint = new Application.DropPoint();
				dropPoint.position.set(-512 + 64 + i * 128, 50, 512 - 64 - j * 128);
				Application.scene.add(dropPoint);
				dropPoint.visible = false;
				this.dropPoints.push(dropPoint);
			}
		}
		/* END INIT OBJECTS */
	},
	
	onWindowResize: function () {
		Application.WIDTH = window.innerWidth;
		Application.HEIGHT = window.innerHeight;
		
		Application.renderer.setSize(Application.WIDTH, Application.HEIGHT);

		// update the camera
		Application.camera.aspect = Application.WIDTH / Application.HEIGHT;
		Application.camera.updateProjectionMatrix();
	},
	
	onMouseMove: function (event) {
		Application.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		Application.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	},
	
	onMouseDown: function (event) {
		Application.mouseState |= Application.MOUSE_STATES.BUTTON_PRESSED;
		if (Application.selectedObject) {
			event.preventDefault();
			Application.controls.enabled = false;
		}
	},
	
	onMouseUp: function (event) {
		Application.mouseState &= ~Application.MOUSE_STATES.BUTTON_PRESSED;
		event.preventDefault();
		
		Application.vector.set(Application.mouse.x, Application.mouse.y, 1);
		Application.vector.unproject(Application.camera);
		Application.raycaster.set(Application.camera.position, Application.vector.sub(Application.camera.position).normalize());
		var intersects = Application.raycaster.intersectObjects(Application.dropPoints);
		
		if (intersects.length > 0) {
			Application.selectedObject.position.copy(intersects[0].object.position);
		} else {
			// return old coordinates
		}
		Application.sprite.visible = false;
		
		Application.controls.enabled = true;
	},
	
	animate: function () {
		requestAnimationFrame(Application.animate);
		
		Application.render();
		Application.update();
	},
	
	update: function () {
		var delta = Application.clock.getDelta();
		//var time = Application.clock.getElapsedTime();
		
		Application.controls.update(delta);
		Application.stats.update(delta);
		
		Application.vector.set(Application.mouse.x, Application.mouse.y, 1);
		Application.vector.unproject(Application.camera);
		Application.raycaster.set(Application.camera.position, Application.vector.sub(Application.camera.position).normalize());
		
		if (Application.mouseState & Application.MOUSE_STATES.BUTTON_PRESSED) {
			// if we have selected object
			if (Application.selectedObject) {
				var intersects = Application.raycaster.intersectObject(Application.plane);
				if (intersects.length > 0) {
					Application.selectedObject.position.copy(intersects[0].point);
				} else {
					// return old coordinates...
				}
				
				intersects = Application.raycaster.intersectObjects(Application.dropPoints);
				if (intersects.length > 0) {
					Application.sprite.position.copy(intersects[0].object.position);
					Application.sprite.visible = true;
				} else {
					Application.sprite.visible = false;
				}
			}
		} else {
			// TODO: fix camera position
			if (Application.camera.position.y < 1000) {
				Application.camera.position.y += Math.abs(1000 - Application.camera.position.y) / 20 + 1;
				return;
			}
			
			var intersects = Application.raycaster.intersectObjects(this.pieces);
		
			if (intersects.length > 0) {
				if (intersects[0].object != Application.selectedObject) {
					if (Application.selectedObject) {
						Application.selectedObject.material.color.setHex(Application.selectedObject.currentHex);
					}
					Application.selectedObject = intersects[0].object;
					Application.selectedObject.currentHex = Application.selectedObject.material.color.getHex();
					Application.selectedObject.material.color.setHex(0xffff00);
				}
			} else {
				if (Application.selectedObject) { 
					Application.selectedObject.material.color.setHex(Application.selectedObject.currentHex);
				}
				Application.selectedObject = null;
			}
		}
	},
	
	render: function () {
		Application.renderer.render(Application.scene, Application.camera);
	}
};

Application.ChessBoard = function () {
	this.texture = 'textures/chessboard.jpg';
	this.repeatX = 2;
	this.repeatY = 2;
	
	this.width = 1024;
	this.height = 1024;
	
	var floorTexture = new THREE.ImageUtils.loadTexture(this.texture);
	
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set(this.repeatX, this.repeatY);
	
	var floorMaterial = new THREE.MeshBasicMaterial({
		map: floorTexture
	});
	
	var floorGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);
	
	THREE.Mesh.call(this, floorGeometry, floorMaterial);
	
	this.position.y = -1;
	this.rotation.x = -Math.PI / 2;
};

Application.ChessBoard.prototype = Object.create(THREE.Mesh.prototype);

Application.ChessPiece = function (color) {
	this.width = 100;
	this.height = 100;
	this.depth = 100;
	
	this.color = color;
	
	var cubeGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
	var cubeMaterial = new THREE.MeshBasicMaterial({
		color: this.color
	});
	
	THREE.Mesh.call(this, cubeGeometry, cubeMaterial);
};

Application.ChessPiece.prototype = Object.create(THREE.Mesh.prototype);

Application.DropPoint = function () {
	this.width = 128;
	this.height = 128;
	
	var circleGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);
	
	var circleMaterial = new THREE.LineBasicMaterial({
		color: 0xE0F0FF
	});
					
	THREE.Mesh.call(this, circleGeometry, circleMaterial);
	
	this.position.y = 5;
	this.rotation.x = -Math.PI / 2;
}

Application.DropPoint.prototype = Object.create(THREE.Mesh.prototype);
