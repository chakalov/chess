function Loader(parent) {
	var me = this;
	// private:
	var _resources = [
		'geometries/knight.json',
		'geometries/king.json',
		'geometries/queen.json',
		'geometries/bishop.json',
		'geometries/rook.json',
		'geometries/pawn.json',
		'textures/cell-0.jpg',
		'textures/cell-1.jpg',
		'textures/cell_N.jpg',
		'textures/cell_S.jpg',
		'textures/wood-0.jpg',
		'textures/wood-1.jpg',
		'textures/wood_N.jpg',
		'textures/wood_S.jpg',
		'textures/knight-ao.jpg',
		'textures/rook-ao.jpg',
		'textures/king-ao.jpg',
		'textures/bishop-ao.jpg',
		'textures/queen-ao.jpg',
		'textures/pawn-ao.jpg',
		'textures/floor.jpg',
		'textures/floor_N.jpg',
		'textures/floor_S.jpg',
		'textures/fakeShadow.jpg'
	];
	var _loaded = 0;
	var _callback = null;

	// public:
	this.geometries = {};
	this.textures = {};

	this.loadJson = function (url) {
		var loader = new THREE.JSONLoader();
		loader.load(url, function(geometry) {
			me.geometries[url] = geometry;
			_loaded++;
			me.checkLoaded();
		});
	};

	this.loadTexture = function (url) {
		THREE.ImageUtils.loadTexture(url, THREE.UVMapping(), function(texture) {
			me.textures[url] = texture;
			_loaded++;
			me.checkLoaded();
		});
	};

	this.load = function (callback) {
		_callback = callback;
		_resources.forEach(function (url) {
			switch (url.split('.').pop()) {
				case 'json':
					me.loadJson(url);
					break;
				case 'png':
				case 'jpg':
					me.loadTexture(url);
					break;
				default:
					throw 'invalid resource';
			}
		});
	};

	this.checkLoaded = function () {
		if (_loaded == _resources.length) {
			_callback();
		} else {
			// show progress
		}
	}
}
