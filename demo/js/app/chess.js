Application.Chess = function () {
    // Init the chessboard
    this.configuration = [];
    
    this.dropPoints = [];
    this.cells = [];
    var n = 0;
    for (var i = 0; i < 8; i++) {
        var col = [];
        for (var j = 0; j < 8; j++) {
            var dropPoint = new Application.DropPoint(i, j);
            dropPoint.position.set(-512 + 64 + i * 128, 50, 512 - 64 - j * 128);
            Application.scene.add(dropPoint);
            dropPoint.visible = false;
            this.dropPoints.push(dropPoint);

            var cell;
            if (n % 2 == 1) {
                cell = new Application.WhiteCell(i, j);
            } else {
                cell = new Application.BlackCell(i, j);
            }
            n++;

            cell.position.set(-512 + 64 + i * 128, 0, 512 - 64 - j * 128);
            Application.scene.add(cell);
            this.cells.push(cell);
            
            col.push({'cell': cell});
        }
        n++;
        
        this.configuration.push(col);
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

    if (color == Application.COLOR_BLACK) {
        this.rotation.y = Math.PI / 2;
    } else {
        this.rotation.y = -Math.PI / 2;
    }

    this.setPositionOnBoard = function (x, y) {
        this.posX = x;
        this.posY = y;
    };

    //var reflexion = mesh.clone();
    //reflexion.scale.y *= -1;
    //reflexion.material = reflexion.material.clone();
    //reflexion.material.side = THREE.BackSide;
    //
    //this.add(reflexion);
};

Application.ChessPiece.prototype = Object.create(THREE.Mesh.prototype);

Application.Cell = function (texture, specular, shininess, x, y) {
    this.chessX = x;
    this.chessY = y;
    
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

Application.WhiteCell = function (x, y) {
    Application.Cell.call(this, 'textures/cell-1.jpg', Application.SPECULAR_BLACK, 60, x, y);
}
Application.WhiteCell.prototype = Object.create(Application.Cell.prototype);

Application.BlackCell = function (x, y) {
    Application.Cell.call(this, 'textures/cell-0.jpg', Application.SPECULAR_BLACK, 60, x, y);
}
Application.BlackCell.prototype = Object.create(Application.Cell.prototype);

Application.DropPoint = function (x, y) {
    this.chessX = x;
    this.chessY = y;
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