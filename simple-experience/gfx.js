var gfx = {};
(function(){

	//----
	gfx.onframe = function(msDelta, ms) {}
	//----
	
	var m4 = twgl.m4;
	var v3 = twgl.v3;
	var gl = twgl.getContext(document.createElement('canvas'));
	gfxgeom._init(gl);
	
	var scene = gfxgeom.Scene(m4.create(), m4.create());
	
	gl.canvas.style.position = 'absolute';
	gl.canvas.style.left = '0';
	gl.canvas.style.top = '0';
	gl.canvas.style.width = '100vw';
	gl.canvas.style.height = '100vh';
	gl.canvas.style.zIndex = '-1';
	
	document.body.style.margin = 0;
	document.body.appendChild(gl.canvas);
	
	window.onresize = function() {
		twgl.resizeCanvasToDisplaySize(gfx.canvas);
		gl.viewport(0, 0, gfx.canvas.width, gfx.canvas.height);

		m4.perspective(Math.PI / 4, gfx.canvas.clientWidth / gfx.canvas.clientHeight, 0.0, 1024, gfx.scene.projection);
		gfx.scene.changed();
	};
	
	
	gfx.canvas = gl.canvas;
	
	gfx.scene = scene;

	gfx.geom = gfxgeom;

	gfx.draw = function() {
		scene.draw(gl);
	};

	function render(ms) {
		gfx.onframe(ms - gfx.msLastFrame, ms);
		gfx.msLastFrame = ms;
		gfx.draw();
		if (gfx.animating)
			requestAnimationFrame(render);
	}

	gfx.start = function() {
		window.onresize();
		gfx.animating = true;
		gfx.msLastFrame = performance.now();
		requestAnimationFrame(render);
	};

	gfx.stop = function() {
		gfx.animating = false;
	};

	window.onresize();
})();
