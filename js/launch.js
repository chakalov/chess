var Application = {
	WIDTH: window.innerWidth,
	HEIGHT: window.innerHeight,
	VIEW_ANGLE: 45,
	NEAR: 0.1,
	FAR: 20000,
	
	COLOR_BLACK: 0x1F1F1F,
	COLOR_WHITE: 0xF1F1F1,
	
	SQUARE_SIZE: 128,
	
	init: function (parent) {
		// initialize the clock
		Application.clock = new THREE.Clock();
		
		// use the provided container
		Application.container = document.createElement('div');
		parent.appendChild(Application.container);
		
		// initialize the camera
		Application.camera = new THREE.PerspectiveCamera(Application.VIEW_ANGLE, Application.WIDTH / Application.HEIGHT, Application.NEAR, Application.FAR);
		Application.camera.position.set(0, 800, 1600);
		
		// add controls
		Application.controls = new THREE.OrbitControls(Application.camera);
		
		// create the scene
		Application.scene = new THREE.Scene();
		Application.scene.fog = new THREE.FogExp2(0x556677, 0.00000025);
		
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
		
		// add listeners
		window.addEventListener('resize', Application.onWindowResize, false);
		document.addEventListener('mousemove', Application.onMouseMove, false);
		
		// initialize mouse coordinates
		Application.mouse = {
			x: 0,
			y: 0
		};
		Application.INTERSECTED;
		
		/* START INIT OBJECTS */
		this.chessBoard = new Application.ChessBoard();
		this.chessBoard.init();
		
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
	
	animate: function () {
		requestAnimationFrame(Application.animate);
		
		Application.render();
		Application.update();
	},
	
	update: function () {
		var delta = Application.clock.getDelta();
		//var time = Application.clock.getElapsedTime();
		
		var vector = new THREE.Vector3(Application.mouse.x, Application.mouse.y, 1);
		vector.unproject(Application.camera);
		var ray = new THREE.Raycaster(Application.camera.position, vector.sub(Application.camera.position).normalize());

		var intersects = ray.intersectObjects(Application.scene.children);
		
		if (intersects.length > 0) {
			if (intersects[0].object != Application.INTERSECTED) {
				if (Application.INTERSECTED) {
					Application.INTERSECTED.material.color.setHex(Application.INTERSECTED.currentHex);
				}
				Application.INTERSECTED = intersects[0].object;
				Application.INTERSECTED.currentHex = Application.INTERSECTED.material.color.getHex();
				Application.INTERSECTED.material.color.setHex(0xffff00);
			}
		} else {
			if (Application.INTERSECTED) { 
				Application.INTERSECTED.material.color.setHex(Application.INTERSECTED.currentHex);
			}
			Application.INTERSECTED = null;
		}
		
		Application.controls.update(delta);
		Application.stats.update(delta);
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
};

Application.ChessBoard.prototype = {
	constructor: Application.ChessBoard,
	
	init: function () {
		var floorTexture = new THREE.ImageUtils.loadTexture(this.texture);
		
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
		floorTexture.repeat.set(this.repeatX, this.repeatY);
		
		var floorMaterial = new THREE.MeshBasicMaterial({
			map: floorTexture,
			side: THREE.DoubleSide
		});
		
		var floorGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);
		
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		
		floor.position.y = -1;
		floor.rotation.x = Math.PI / 2;
		Application.scene.add(floor);
	},
	
	update: function () {
	},
	
	render: function () {
	}
};

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
