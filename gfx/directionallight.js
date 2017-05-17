(function(){
	gfx.DirectionalLight = function(scene, dir, color) {
		const light = {
			dir: dir,
			color: color,
			type: gfx.DirectionalLight.type,
			projectionMat: twgl.m4.create(),
			changed: function() {
				twgl.v3.normalize(this.dir, this.dir);
				util.m4.axisScaling(this.dir, 0.0, this.projectionMat);
			}
		};
		light.changed();
		scene._light(light);
		return light;
	};
	gfx.DirectionalLight.type = gfx.LIGHTING.DIRECTIONAL;
})();
