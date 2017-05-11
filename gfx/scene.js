/****
The scene wraps a camera and connects it to a set of objects.
It will notify the objects to update their rendering data when informed that the camera has moved.
****/
gfx.Scene = function(camera, projection)
{
	var objects = new Set();
	var draws = [];
	var movingObjects = new Set();
	var turningObjects = new Set();
	
	var m4 = twgl.m4;
	var gl = gfx.gl;
	
	camera = camera || m4.identity();
	projection = projection || m4.identity();
	
	var view = m4.inverse(camera);

	return {
		projection: projection,
		camera: camera,
		view: view,
		viewProjection: m4.multiply(projection, view),
		turned: function() {
			this.changed();
			for (let object of turningObjects)
				object._sceneTurned(this);
		},
		moved: function() {
			this.changed();
			for (let object of movingObjects)
				object._sceneMoved(this);
		},
		changed: function() {
			m4.inverse(this.camera, this.view);
			m4.multiply(this.projection, this.view, this.viewProjection);
		},
		draw: function() {
			gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT);

			for (let object of objects)
				object._update();
			
			twgl.drawObjectList(gl, draws);
		},
		_notifyMoved: function(object) { movingObjects.add(object); },
		_ignoreMoved: function(object) { movingObjects.delete(object); },
		_notifyTurned: function(object) { turningObjects.add(object); },
		_ignoreTurned: function(object) { turningObjects.delete(object); },
		_draw: function(object) {
			objects.add(object);
			for (let draw of object._getDraws(gl))
				draws.push(draw);
		}
	};
};
gfx.scene = gfx.Scene();
	
window.addEventListener("resize", function() {
	twgl.resizeCanvasToDisplaySize(gfx.canvas);
	gfx.gl.viewport(0, 0, gfx.canvas.width, gfx.canvas.height);

	twgl.m4.perspective(Math.PI / 4, gfx.canvas.clientWidth / gfx.canvas.clientHeight, 0.5, 1024, gfx.scene.projection);
	gfx.scene.changed();
});
window.dispatchEvent(new UIEvent("resize"));