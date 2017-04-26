document.body.onload = function() {
	
	var m4 = twgl.m4;
	var radY = 0;
	var distZ = 10;
	var matY = m4.create();
	var matDist = m4.create();
	
	input.ondrag2d = function(dx, dy) {
		distZ *= (128 + dy) / 128.0;
		m4.translation([0,1,distZ], matDist);
		radY += dx / 256.0;
		m4.rotationY(radY, matY);
		m4.multiply(matY, matDist, gfx.scene.camera);
		gfx.scene.moved();
	};

	var obj1 = gfx.geom.Ellipsoid(gfx.scene, m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1])));
	var obj2 = gfx.geom.Ellipsoid(gfx.scene, m4.translation([1.5,0,1.5]));

	input.ondrag2d(0,0);
	
	util.msg('Loaded.');

	gfx.start();
	
	//net.testLogin();

};
