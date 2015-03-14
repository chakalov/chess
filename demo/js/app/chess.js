Application.Chess = function () {
    // Init the chessboard
    this.configuration = [];
    
    this.dropPoints = [];
    this.cells = [];
    var n = 0;
    for (var r = 0; r < 8; r++) {
        var row = [];
        for (var c = 0; c < 8; c++) {
            var dropPoint = new Application.DropPoint(r, c);
            dropPoint.position.set(-512 + 64 + r * 128, 50, 512 - 64 - c * 128);
            Application.scene.add(dropPoint);
            dropPoint.visible = false;
            this.dropPoints.push(dropPoint);

            var cell;
            if (n % 2 == 0) {
                cell = new Application.WhiteCell(r, c);
            } else {
                cell = new Application.BlackCell(r, c);
            }
            n++;

            cell.position.set(-512 + 64 + r * 128, 0, 512 - 64 - c * 128);
            Application.scene.add(cell);
            this.cells.push(cell);
            
            row.push({'cell': cell});
        }
        n++;
        
        this.configuration.push(row);
    }
}

Application.Chess.prototype = {
    constructor: Application.Chess,

    init: function () {
    }
}

Application.ChessPiece = function (type, color, specular) {
    this.width = 100;
    this.height = 100;
    this.depth = 100;

    this.color = color;
    this.specular = specular;

    this.type = type;

    var pieceGeometry;
    switch (type) {
        case "bishop":
            pieceGeometry = Application.Loader.geometries['geometries/bishop.json'];
            break;
        case "king":
            pieceGeometry = Application.Loader.geometries['geometries/king.json'];
            break;
        case "knight":
            pieceGeometry = Application.Loader.geometries['geometries/knight.json'];
            break;
        case "pawn":
            pieceGeometry = Application.Loader.geometries['geometries/pawn.json'];
            break;
        case "queen":
            pieceGeometry = Application.Loader.geometries['geometries/queen.json'];
            break;
        case "rook":
            pieceGeometry = Application.Loader.geometries['geometries/rook.json'];
            break;
        default:
            console.log("ERROR: No such figure!");
    }

    var pieceMaterial = new THREE.MeshPhongMaterial({
        color: this.color,
        specular: this.specular,
        shininess: 30
    });

    THREE.Mesh.call(this, pieceGeometry, pieceMaterial);
    this.scale.x = 40;
    this.scale.y = 40;
    this.scale.z = 40;

    if (color == Application.COLOR_WHITE) {
        this.rotation.y = Math.PI;
    }
    
    if (type == 'bishop' || type == 'king') {
        this.rotation.y = Math.PI / 2;
    }

    this.setPositionOnBoard = function (r, c) {
        this.row = r;
        this.col = c;
    };

    //var reflexion = mesh.clone();
    //reflexion.scale.y *= -1;
    //reflexion.material = reflexion.material.clone();
    //reflexion.material.side = THREE.BackSide;
    //
    //this.add(reflexion);
};

Application.ChessPiece.prototype = Object.create(THREE.Mesh.prototype);

Application.Cell = function (texture, specular, shininess, r, c) {
    this.row = r;
    this.col = c;
    
    this.width = 128;
    this.height = 128;
    this.texture = texture;
    this.specular = specular;
    this.shininess = shininess;

    var cellGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);

    var diff = Application.Loader.textures[this.texture];
    var spec = Application.Loader.textures['textures/cell_S.jpg'];
    var norm = Application.Loader.textures['textures/cell_N.jpg'];

    var cellMaterial = new THREE.MeshPhongMaterial({
        map:            diff,
        specular:       this.specular,
        shininess:      this.shininess,
        //transparent:    true,
        //opacity:        0.5,
        specularMap:    spec,
        normalMap:      norm
    });

    THREE.Mesh.call(this, cellGeometry, cellMaterial);

    this.position.y = 5;
    this.rotation.x = -Math.PI / 2;
}
Application.Cell.prototype = Object.create(THREE.Mesh.prototype);

Application.WhiteCell = function (r, c) {
    Application.Cell.call(this, 'textures/cell-1.jpg', Application.SPECULAR_BLACK, 60, r, c);
}
Application.WhiteCell.prototype = Object.create(Application.Cell.prototype);

Application.BlackCell = function (r, c) {
    Application.Cell.call(this, 'textures/cell-0.jpg', Application.SPECULAR_BLACK, 60, r, c);
}
Application.BlackCell.prototype = Object.create(Application.Cell.prototype);

Application.DropPoint = function (r, c) {
    this.row = r;
    this.col = c;
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