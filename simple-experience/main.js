document.body.onload = function() {
	
	var m4 = twgl.m4;
	var radY = 0;
	var distZ = 10;
	var matY = m4.create();
	var matDist = m4.create();
	
	input.ondrag2d = function(dx, dy) {
		distZ *= (128 + dy) / 128.0;
		m4.translation([0,1.5,distZ], matDist);
		radY += dx / 256.0;
		m4.rotationY(radY, matY);
		m4.multiply(matY, matDist, gfx.scene.camera);
		gfx.scene.moved();
	};


	var lastRadY;
	var speedY = 0;
	var dragging = false;

	input.startdrag2d = function() {
		dragging = true;
		lastRadY = radY;
	};
	input.stopdrag2d = function() {
		dragging = false;
	};
	gfx.onframe = function(msDelta) {
		if (dragging) {
			speedY = (radY - lastRadY) / msDelta;
			lastRadY = radY;
		} else if (speedY) {
			radY += speedY * msDelta;
			m4.rotationY(radY, matY);
			m4.multiply(matY, matDist, gfx.scene.camera);
			gfx.scene.moved();
		}
	};

	var obj1 = gfx.Ellipsoid(gfx.scene, m4.multiply(m4.translation([0,1.5,0]),m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1]))));
	var obj2 = gfx.Ellipsoid(gfx.scene, m4.translation([1.5,1,1.5]));
	
	var shadow2 = gfx.Disc(gfx.scene, m4.copy([1,0,0,0,0,0,1,0,0,1,0,0,1.5,0,1.5,1]));
	shadow2.color = [0.5,0.5,0.5,1.0];
	shadow2.changed();

	input.ondrag2d(0,0);
	
	util.msg('Loaded.');

	gfx.start();
	
	//net.testLogin();

};
