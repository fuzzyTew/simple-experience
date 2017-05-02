var gfx = {};
(function(){

	//----
	gfx.onframe = function(msDelta, ms) {}
	//----
		
	gfx.canvas = document.createElement('canvas');
	gfx.gl = twgl.getContext(gfx.canvas);

	if (! gfx.gl) {
		util.msg("ERROR: no webgl");
	} else {
		gfx.gl.clearColor(0.9, 0.9, 0.9, 1.0);
		gfx.gl.enable(gfx.gl.DEPTH_TEST);
	}
	
	gfx.canvas.style.position = 'absolute';
	gfx.canvas.style.left = '0';
	gfx.canvas.style.top = '0';
	gfx.canvas.style.width = '100vw';
	gfx.canvas.style.height = '100vh';
	gfx.canvas.style.zIndex = '-1';
	
	document.body.style.margin = 0;
	document.body.appendChild(gfx.canvas);

	gfx.draw = function() {
		gfx.scene.draw(gfx.gl);
	};

	function render(ms) {
		gfx.onframe(ms - gfx.msLastFrame, ms);
		gfx.msLastFrame = ms;
		gfx.draw();
		if (gfx.animating)
			requestAnimationFrame(render);
	}

	gfx.start = function() {
		gfx.animating = true;
		gfx.msLastFrame = performance.now();
		requestAnimationFrame(render);
	};

	gfx.stop = function() {
		gfx.animating = false;
	};
})();
