
(function(){
	gfx.Plane = function(scene, normal, point, shading) {
		const plane = {
			world: twgl.m4.lookAt(point, twgl.v3.add(normal, point), util.v3.perp(normal)),
			shading: gfx.SHADING.NONE
		};
		return plane; 
	};
})();

(function(){

	gfx.EllipsoidPlaneShadow = function(scene, ellipsoid, plane, light) {
		const shadow = gfx.Disc(scene, m4.create());
		
		shadow.ellipsoid = ellipsoid;
		shadow.plane = plane;
		shadow.light = light;
		shadow.color = [0.45, 0.45, 0.45];
		
		var worldInverse = twgl.m4.create();

		var shadowMat = twgl.m4.identity();
		var lightDir = util.m4.axis(shadowMat, 2);
		var axis2 = util.m4.axis(shadowMat, 0);
		var axis3 = util.m4.axis(shadowMat, 1);
		
		var scalingMat = twgl.m4.scaling([1,1,0]);
		
		const updateDisc = shadow._update();
		shadow._update = function() {
			updateDisc.call(this);
		
			// create shadow in object space
			twgl.m4.inverse(ellipsoid.world, shadowMat);
			twgl.m4.transformDirection(shadowMat, this.light.dir, lightDir);
			twgl.v3.normalize(lightDir);
			
			twgl.v3.cross(lightDir, axis2, axis3);
			twgl.v3.cross(axis3, lightDir, axis2);
			
			twgl.m4.multiply(ellipsoid.world, shadowMat, shadowMat);
			
			
			// TODO: move code below into here	
		};
		
		shadow.changed();
		
		var m = m4.inverse(obj1.world);
		m4.transformDirection(m, light.dir, lightDir);
		
		v3.normalize(lightDir, lightDir);
		
		var axis2 = v3.cross(lightDir, m4.getAxis(m, 0));
		v3.normalize(axis2, axis2);
		var axis3 = v3.cross(lightDir, axis2);
		
		m4.identity(m);
		m4.setAxis(m, axis2, 0, m);
		m4.setAxis(m, axis3, 1, m);
		m4.setAxis(m, lightDir, 2, m);
		m4.multiply(obj1.world, m, m);
		m4.multiply(m4.scaling([1,0,1]), m, m);
		
		var shadow1 = gfx.Disc(gfx.scene, m);
		shadow1.color = [0.45,0.45,0.45,1.0]
		shadow1.changed();
		
		return shadow;
		
	};
})();

document.body.onload = function() {
	
	var m3 = util.m3;
	var m4 = twgl.m4;
	var v3 = twgl.v3;

	var radY = 0;
	var radX = Math.PI/4;
	var distZ = 6;
	var matY = m4.create();
	var matX = m4.create();
	var matDist = m4.create();

	function updateCam() {
		m4.translation([0,1,distZ], matDist);
		m4.rotationX(-radX, matX);
		m4.rotationY(radY, matY);
		m4.multiply(matX, matDist, gfx.scene.camera);
		m4.multiply(matY, gfx.scene.camera, gfx.scene.camera);
		gfx.scene.moved();
	}
	
	input.ondrag2d = function(dx, dy) {
		//distZ *= (128 + dy) / 128.0;
		radX += dy / 256.0;
		if (radX < 0)
			radX = 0;
		else if (radX > Math.PI / 2)
			radX = Math.PI / 2;
		radY += dx / 256.0;
		updateCam();
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
	
	frameMS = 0;
	frameCount = 0;
	
	gfx.onframe = function(msDelta, ms) {
		frameCount ++;
		frameMS += msDelta;
		if (frameMS >= 125) {
			util.status(Math.round(10000 * frameCount / frameMS) / 10  + ' FPS');
			frameCount = 0;
			frameMS = 0;
		}
		if (dragging) {
			speedY = (radY - lastRadY) / msDelta;
			lastRadY = radY;
		} else if (speedY) {
			radY += speedY * msDelta;
			updateCam();
		}
		light.dir[0] = Math.cos(ms / 1024.0);
		light.dir[1] = Math.sin(ms / 1024.0);
		//light.changed();
	};
	
	var light = gfx.DirectionalLight(gfx.scene, v3.copy([0, -1, 0]), [1, 1, 1]);
	var ground = gfx.Plane(gfx.scene, [0,1,0], [0,0,0]);
	

	var obj1 = gfx.Ellipsoid(gfx.scene, m4.multiply(m4.tr7anslation([0,1.6,0]),m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1]))));
	var obj2 = gfx.Ellipsoid(gfx.scene, m4.translation([1.5,1,1.5]), 'outline');


	var shadow1 = gfx.EllipsoidPlaneShadow(gfx.scene, gfx.obj1, ground, light);
	
	var shadow2 = gfx.Disc(gfx.scene, m4.copy([1,0,0,0,0,0,1,0,0,1,0,0,1.5,0,1.5,1]));
	shadow2.color = [0.45,0.45,0.45,1.0];
	shadow2.changed();

	input.ondrag2d(0,0);
	
	util.status('Loaded.');

	gfx.start();
	
	//net.testLogin();

};
