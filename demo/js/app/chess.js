Application.Chess = function () {


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
        case Application.FIGURES.BISHOP:
            pieceGeometry = Application.Loader.geometries['geometries/bishop.json'];
            break;
        case Application.FIGURES.KING:
            pieceGeometry = Application.Loader.geometries['geometries/king.json'];
            break;
        case Application.FIGURES.KNIGHT:
            pieceGeometry = Application.Loader.geometries['geometries/knight.json'];
            break;
        case Application.FIGURES.PAWN:
            pieceGeometry = Application.Loader.geometries['geometries/pawn.json'];
            break;
        case Application.FIGURES.QUEEN:
            pieceGeometry = Application.Loader.geometries['geometries/queen.json'];
            break;
        case Application.FIGURES.ROOK:
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
        this.rotation.y = -Math.PI / 2;
    } else {
        this.rotation.y = Math.PI / 2;
    }


    //var reflexion = mesh.clone();
    //reflexion.scale.y *= -1;
    //reflexion.material = reflexion.material.clone();
    //reflexion.material.side = THREE.BackSide;
    //
    //this.add(reflexion);
};

Application.ChessPiece.prototype = Object.create(THREE.Mesh.prototype);

Application.Cell = function (texture, specular, shininess) {
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

Application.WhiteCell = function () {
    Application.Cell.call(this, 'textures/cell-1.jpg', Application.SPECULAR_BLACK, 30);
}
Application.WhiteCell.prototype = Object.create(Application.Cell.prototype);

Application.BlackCell = function () {
    Application.Cell.call(this, 'textures/cell-0.jpg', Application.SPECULAR_BLACK, 30);
}
Application.BlackCell.prototype = Object.create(Application.Cell.prototype);