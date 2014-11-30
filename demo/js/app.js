var Application = {
	WIDTH: window.innerWidth,
	HEIGHT: window.innerHeight,
	VIEW_ANGLE: 45,
	NEAR: 1,
	FAR: 20000,

	COLOR_BLACK: 0x1F1F1F,
	COLOR_WHITE: 0xF1F1F1,
	SPECULAR_BLACK: 0x001122,
	SPECULAR_WHITE: 0x667788,

	SQUARE_SIZE: 128,

	APPLICATION_STATES: {
		RUNNING: 		0x0001,
		WHITES_MOVE:	0x0010
	},

	MOUSE_STATES: {
		NOTHING_PRESSED:	0x00,
		BUTTON_PRESSED:		0x01
	},

	FIGURES: {
		BISHOP: 1,
		KING: 	2,
		KNIGHT:	3,
		PAWN:	4,
		QUEEN:	5,
		ROOK:	6
	},

	run: function (parent) {
		// load resources
		Application.Loader = new Loader(parent);
		Application.Loader.load(function () {
			// init the application
			Application.init(parent);

			// animate
			Application.animate();
		});
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
		Application.scene.fog = new THREE.Fog(0x000000, 1500, 45000);

		// add lights
		//Application.scene.add(new THREE.AmbientLight(0x555522));
		var spotlight = new THREE.SpotLight(0xFFFFFF, 0.5);
		spotlight.position.set(0, 3000, 0);
		spotlight.angle =  Math.PI / 2;
		spotlight.exponent = 50.0;
		spotlight.target.position.set(0, 0, 0);

		spotlight.castShadow = true;
		spotlight.shadowDarkness = 0.5;
		spotlight.shadowBias = -0.001;

		Application.scene.add(spotlight);

		var whiteLight = new THREE.PointLight(0xFFEEDD, 0.35);
		whiteLight.position.set(0, 1000, 512);
		Application.scene.add(whiteLight);
		var blackLight = new THREE.PointLight(0xFFEEDD, 0.35);
		blackLight.position.set(0, 1000, -512);
		Application.scene.add(blackLight);

		// add invisible plane for intersections
		Application.plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(4096, 4096, 8, 8),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				opacity: 0.25,
				transparent: true
			})
		);
		Application.plane.visible = false;
		Application.plane.position.y = 120;
		Application.plane.rotation.x = -Math.PI / 2;
		Application.scene.add(Application.plane);

		var floorGeometry = new THREE.PlaneBufferGeometry(20000, 20000);
		floorGeometry.computeVertexNormals();

		var floor = new THREE.Mesh(
			floorGeometry,
			new THREE.MeshNormalMaterial({
				color: 0x006600,
				side: THREE.DoubleSide
				//emissive: 0x003300,
				//vertexColors: THREE.FaceColors
			})
		);

		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -20
		//Application.scene.add(floor);

		//var geometry = new THREE.BoxGeometry(1152, 32, 64);
		//var material = new THREE.MeshBasicMaterial({
		//	color: 0x00ff00
		//});
		//var cube = new THREE.Mesh(geometry, material);
		//Application.scene.add(cube);
		//cube.position.y = -16;
		//cube.position.z = 512 + 32;

		var rectShape = new THREE.Shape();
		rectShape.moveTo(0, 0);
		rectShape.lineTo(-64, 64);
		rectShape.lineTo(1024 + 64, 64);
		rectShape.lineTo(1024, 0);
		rectShape.lineTo(0, 0);

		var customGeometry = new THREE.ExtrudeGeometry(rectShape, {
			amount: 32,
			bevelEnabled: false,
			steps: 2
		});
		var wood = Application.Loader.textures['textures/wood-0.jpg'];
		var spec = Application.Loader.textures['textures/wood_S.jpg'];
		var norm = Application.Loader.textures['textures/wood_N.jpg'];
		wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
		wood.repeat.set(0.01, 0.01);
		spec.wrapS = spec.wrapT = THREE.RepeatWrapping;
		spec.repeat.set(0.01, 0.01);
		norm.wrapS = norm.wrapT = THREE.RepeatWrapping;
		norm.repeat.set(0.01, 0.01);



		var customMaterial = new THREE.MeshPhongMaterial({
			color:0xffffff,
			map: wood,
			specular: 0xffffff,
			specularMap: spec,
			normalMap: norm,
			shininess: 60,
			normalScale: new THREE.Vector2(0.2,0.2)
		});
		var mesh = new THREE.Mesh(customGeometry, customMaterial);

		mesh.rotation.x = Math.PI / 2;
		mesh.position.set(-512, 5, 512);
		Application.scene.add(mesh);

		var mesh2 = mesh.clone();
		mesh2.rotation.z = Math.PI / 2;
		mesh2.position.z = -512;
		Application.scene.add(mesh2);

		var mesh3 = mesh.clone();
		mesh3.rotation.z = -Math.PI / 2;
		mesh3.position.x = 512;
		mesh3.position.z = 512;
		Application.scene.add(mesh3);

		var mesh4 = mesh.clone();
		mesh4.rotation.x = -Math.PI / 2;
		mesh4.position.y += -32;
		mesh4.position.z = -512;
		Application.scene.add(mesh4);

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

		Application.controls.minPolarAngle = 0;
		Application.controls.maxPolarAngle = 85 * Math.PI/180;
		Application.controls.minDistance   = 500;
		Application.controls.maxDistance   = 2150;
		Application.controls.userZoomSpeed = 1.0;
		Application.controls.noPan = true;
		Application.goodPolarAngle = 60 * Math.PI/180;

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
		Application.oldCoordinates = null;
		Application.selectedCell = null;

		// initialize raycaster for mouse coordinates
		Application.vector = new THREE.Vector3();
		Application.raycaster = new THREE.Raycaster();

		/* START INIT OBJECTS */

		Application.addFigures();

		// add droppoints
		this.dropPoints = [];
		this.cells = [];
		var n = 0;
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var dropPoint = new Application.DropPoint();
				dropPoint.position.set(-512 + 64 + i * 128, 50, 512 - 64 - j * 128);
				Application.scene.add(dropPoint);
				dropPoint.visible = false;
				this.dropPoints.push(dropPoint);

				var cell;
				if (n % 2 == 1) {
					cell = new Application.BlackCell();
				} else {
					cell = new Application.WhiteCell();
				}
				n++;

				cell.position.set(-512 + 64 + i * 128, 0, 512 - 64 - j * 128);
				Application.scene.add(cell);
				this.cells.push(cell);
			}
			n++;
		}
		/* END INIT OBJECTS */
	},

	addFigures: function () {
		this.pieces = [];

		var piece = new Application.ChessPiece(Application.FIGURES.ROOK, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KNIGHT, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.BISHOP, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 2 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.QUEEN, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 3 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KING, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 4 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.BISHOP, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 5 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KNIGHT, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 6 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.ROOK, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
		piece.position.set(-512 + 64 + 7 * 128, 0, 512 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);


		piece = new Application.ChessPiece(Application.FIGURES.ROOK, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KNIGHT, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.BISHOP, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 2 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KING, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 3 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.QUEEN, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 4 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.BISHOP, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 5 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.KNIGHT, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 6 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);

		piece = new Application.ChessPiece(Application.FIGURES.ROOK, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
		piece.position.set(384 + 64 - 7 * 128, 0, -384 - 64);
		Application.scene.add(piece);
		this.pieces.push(piece);



		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.FIGURES.PAWN, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
			piece.position.set(-512 + 64 + i * 128, 0, 384 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}

		for (var i = 0; i < 8; i++) {
			var piece = new Application.ChessPiece(Application.FIGURES.PAWN, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
			piece.position.set(384 + 64 - i * 128, 0, -256 - 64);
			Application.scene.add(piece);
			this.pieces.push(piece);
		}
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

		if (Application.selectedObject) {
			Application.vector.set(Application.mouse.x, Application.mouse.y, 1);
			Application.vector.unproject(Application.camera);
			Application.raycaster.set(Application.camera.position, Application.vector.sub(Application.camera.position).normalize());
			var intersects = Application.raycaster.intersectObjects(Application.dropPoints);

			if (intersects.length > 0) {
				Application.selectedObject.position.copy(intersects[0].object.position);
				Application.selectedObject.position.y = 0;
			} else {
				// restore old coordinates
				Application.selectedObject.position.copy(Application.oldCoordinates);
			}
		}

		if (Application.selectedCell) {
			Application.selectedCell.material.color.setHex(Application.selectedCell.currentHex);
		}

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
					// restore old coordinates
					Application.selectedObject.position.copy(Application.oldCoordinates);
				}

				intersects = Application.raycaster.intersectObjects(Application.dropPoints);
				if (intersects.length > 0) {
					Application.raycaster.set(intersects[0].object.position, new THREE.Vector3(0, -1, 0));

					// mark the cell
					intersects = Application.raycaster.intersectObjects(Application.cells);
					if (intersects.length > 0) {
						if (Application.selectedCell != intersects[0].object) {
							if (Application.selectedCell) {
								Application.selectedCell.material.color.setHex(Application.selectedCell.currentHex);
							}
							// mark the cell as selected
							Application.selectedCell = intersects[0].object;
							Application.selectedCell.currentHex = Application.selectedCell.material.color.getHex();
							Application.selectedCell.material.color.setHex(0x4FCC55);
						}
					} else {
						Application.selectedCell.material.color.setHex(Application.selectedCell.currentHex);
					}
				}
			}
		} else {
			if (Application.controls.getPolarAngle() > Application.goodPolarAngle) {
				Application.controls.rotateUp((Application.controls.getPolarAngle() - Application.goodPolarAngle) / 20 + 0.001);
				return;
			}

			var intersects = Application.raycaster.intersectObjects(this.pieces);

			if (intersects.length > 0) {
				if (intersects[0].object != Application.selectedObject) {
					if (Application.selectedObject) {
						Application.selectedObject.material.color.setHex(Application.selectedObject.currentHex);
					}

					// mark the object as selected
					Application.selectedObject = intersects[0].object;

					// save the old coordinates
					Application.oldCoordinates = Application.selectedObject.position.clone();

					Application.selectedObject.currentHex = Application.selectedObject.material.color.getHex();
					Application.selectedObject.material.color.setHex(0x330000);
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

Application.DropPoint = function () {
	this.width = 128;
	this.height = 128;

	var squareGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);

	var squareMaterial = new THREE.LineBasicMaterial({
		color: 0xE0F0FF
	});

	THREE.Mesh.call(this, squareGeometry, squareMaterial);

	this.position.y = 5;
	this.rotation.x = -Math.PI / 2;
}

Application.DropPoint.prototype = Object.create(THREE.Mesh.prototype);
