(function(){
	gfx.DirectionalLight = function(scene, dir, color) {
		const light = {
			dir: dir,
			color: color,
			type: gfx.DirectionalLight.type
		};
		return light;
	}
	gfx.DirectionalLight.type = gfx.LIGHTING.DIRECTIONAL;
})();