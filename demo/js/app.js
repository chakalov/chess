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
    
    PLAYERS: {
        WHITES: 0x0,
        BLACKS: 0x1
    },

	run: function (parent) {
		// load resources
		Application.Loader = new Loader(parent);
		Application.Loader.load(function () {
			// init the application
			Application.init(parent);

			// animate
			Application.animate();
            
            // run the AI
            UINewGame();
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
		Application.camera.position.set(0, 0, -1500);
        //Application.camera.

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
        this.pieces = [];

		// Application.addFigures();
        Application.Chessboard = new Application.Chess();
		/* END INIT OBJECTS */
	},
    
    ClearBoard: function () {
        this.pieces.forEach(function (piece) {
            Application.scene.remove(piece);
        });
        this.pieces = [];
    },
    
    UpdatePieces: function () {
        for (var y = 0; y < 8; y++) {
			for (var x = 0; x < 8; x++) {
                var piece = g_board[MakeSquare(y,x)];
				var pieceColor = (piece & colorWhite) ? 'W' : 'B';
				var pieceName = null;
				switch (piece & 0x7) {
				case piecePawn:
					pieceName = "pawn";
					break;
				case pieceKnight:
					pieceName = "knight";
					break;
				case pieceBishop:
					pieceName = "bishop";
					break;
				case pieceRook:
					pieceName = "rook";
					break;
				case pieceQueen:
					pieceName = "queen";
					break;
				case pieceKing:
					pieceName = "king";
					break;
				}
                
                if (pieceName) {
                    Application.addPiece(x, y, pieceName, pieceColor);
                }
            }
        }
    },
    
    SetFen: function (fen) {
        /* IMPLEMENTATION */
        console.log(fen);
    },
    
    addPiece: function (x, y, pieceType, pieceColor) {
        if (pieceColor == "W") {
            var piece = new Application.ChessPiece(pieceType, Application.COLOR_WHITE, Application.SPECULAR_WHITE);
        } else {
            var piece = new Application.ChessPiece(pieceType, Application.COLOR_BLACK, Application.SPECULAR_BLACK);
        }
        
        var cell = Application.Chessboard.configuration[x][y].cell.position;
        piece.setPositionOnBoard(x, y);
		piece.position.set(cell.x, 0, cell.z);
		Application.scene.add(piece);
		this.pieces.push(piece);
    },
    
    playMove: function (piece, cell) {
		if (piece === undefined || cell === undefined) {
			return false;
		}

		var startSquare = MakeSquare(piece.posY, piece.posX);
		var endSquare   = MakeSquare(cell.chessY, cell.chessX);

		var move = null;
		var testPromotion = false;
		var p = g_board[startSquare];

		if ( ((p & 0x7) === piecePawn) &&
				(((piece.posY === 1) && g_playerWhite) ||
				( (piece.posY === 6) && !g_playerWhite)) &&
				(((p & 0x8) &&  g_playerWhite) ||
				(!(p & 0x8) && !g_playerWhite))
			) {
			testPromotion = true;
		}

		// check if the move is valid
		// validMoves is global and reevaluated after each move
		for (var i = 0; i < validMoves.length; i++) {
			if (testPromotion) {
				// for promotion we one valid move per promotion type
				// so we have to be more specific and create the entire move
				// with its flag go get it back from validMoves.
				// else it's alway a Rook promotion (flag 0x00).
				if(validMoves[i] === GenerateMove(startSquare, endSquare, moveflagPromotion | promotion)) {
					move = validMoves[i];
					break;
				}
			} else {
				// just checking start and end square allows to cover 
				// all other special moves like "en passant" capture and
				// castling
				if ( (validMoves[i] & 0xFF)       == startSquare &&
					((validMoves[i] >> 8) & 0xFF) == endSquare ) {
					move = validMoves[i];
					break;
				}
			}
		}


		if (!(piece.posX === cell.chessX && piece.posY === cell.chessY) && move !== null) {

			// we send the move to our worker
			if (InitializeBackgroundEngine()) {
				g_backgroundEngine.postMessage(FormatMove(move));
			}

			// we play the actual move
			UIPlayMove(move,false);


			// make the engine play (setTimeOut is used probably to wait for the last postMessage to kick in)
			// maybe creating a callback from the worker would be better (more reliable)
			setTimeout(SearchAndRedraw, 0);
			return true;
		}
		return false;
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
            
            Application.selectedCell = null;
            
            // mark all possible moves
            for (var i = 0; i < validMoves.length; i++) {
                if ((validMoves[i] & 0xFF) == MakeSquare(Application.selectedObject.posY, Application.selectedObject.posX)) {
                    for (var y = 0; y < 8; y++) {
                        for (var x = 0; x < 8; x++) {
                            if (((validMoves[i] >> 8) & 0xFF) == MakeSquare(y, x)) {
                                Application.Chessboard.configuration[x][y].cell.material.color.setHex(0x007700);
                            }
                        }
                    }
                }
            }
		}
	},

	onMouseUp: function (event) {
		Application.mouseState &= ~Application.MOUSE_STATES.BUTTON_PRESSED;
		event.preventDefault();

		if (Application.selectedObject) {
			Application.vector.set(Application.mouse.x, Application.mouse.y, 1);
			Application.vector.unproject(Application.camera);
			Application.raycaster.set(Application.camera.position, Application.vector.sub(Application.camera.position).normalize());
			var intersects = Application.raycaster.intersectObjects(Application.Chessboard.dropPoints);

			if (intersects.length > 0) {
				Application.selectedObject.position.copy(intersects[0].object.position);
				Application.selectedObject.position.y = 0;
                
                // play the move
                if (!Application.playMove(Application.selectedObject, Application.selectedCell)) {
                    // restore old coordinates
                    Application.selectedObject.position.copy(Application.oldCoordinates);
                }
			} else {
				// restore old coordinates
				Application.selectedObject.position.copy(Application.oldCoordinates);
			}
		}

		if (Application.selectedCell) {
			Application.selectedCell.material.color.setHex(Application.selectedCell.currentHex);
            for (var i = 0; i < Application.Chessboard.cells.length; i++) {
                Application.Chessboard.cells[i].material.color.setHex(0xFFFFFF);
            }
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

				intersects = Application.raycaster.intersectObjects(Application.Chessboard.dropPoints);
				if (intersects.length > 0) {
					Application.raycaster.set(intersects[0].object.position, new THREE.Vector3(0, -1, 0));

					// mark the cell
					intersects = Application.raycaster.intersectObjects(Application.Chessboard.cells);
					if (intersects.length > 0) {
						if (Application.selectedCell != intersects[0].object) {
							if (Application.selectedCell) {
								Application.selectedCell.material.color.setHex(Application.selectedCell.currentHex);
							}
                            
                            // get the current cell
							Application.selectedCell = intersects[0].object;
							Application.selectedCell.currentHex = Application.selectedCell.material.color.getHex();
                            // mark the cells (valid or unvalid), exclude the start cell
                            if (Application.selectedCell.chessX != Application.selectedObject.posX || Application.selectedCell.chessY != Application.selectedObject.posY) {
                                if (Application.selectedCell.currentHex != 0x007700) {
                                    Application.selectedCell.material.color.setHex(0xFF0000);
                                } else {
                                    Application.selectedCell.material.color.setHex(0x00FF00);
                                }
                            }
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
						Application.selectedObject.material.emissive.setHex(Application.selectedObject.currentHex);
					}

					// mark the object as selected
					Application.selectedObject = intersects[0].object;

					// save the old coordinates
					Application.oldCoordinates = Application.selectedObject.position.clone();

					Application.selectedObject.currentHex = Application.selectedObject.material.emissive.getHex();
					Application.selectedObject.material.emissive.setHex(0x990000);
				}
			} else {
				if (Application.selectedObject) {
					Application.selectedObject.material.emissive.setHex(Application.selectedObject.currentHex);
				}
				Application.selectedObject = null;
			}
		}
	},

	render: function () {
		Application.renderer.render(Application.scene, Application.camera);
	}
};
