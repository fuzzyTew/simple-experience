(function(){
	gfx.AmbientLight = function(scene, color) {
		const light = {
			color: color,
			type: gfx.AmbientLight.type
		};
		scene._light(light);
		return light;
	};
	gfx.AmbientLight.type = gfx.LIGHTING.AMBIENT;
})();