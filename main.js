
(function(){
	gfx.Plane = function(scene, normal, point, shading) {
		twgl.v3.normalize(normal, normal);
		const displacement = twgl.v3.dot(normal, point);
		const center = twgl.v3.mulScalar(normal, displacement);
		const plane = {
			world: twgl.m4.lookAt(center, twgl.v3.add(center, normal), util.v3.perp(normal)),
			displacement: displacement,
			normal: normal,
			center: center,
			shading: gfx.SHADING.NONE
		};
		plane.worldInverse = twgl.m4.inverse(plane.world);
		return plane; 
	};
})();

(function(){

	gfx.EllipsoidPlaneShadow = function(scene, ellipsoid, plane, light) {
		const shadow = gfx.Disc(scene, twgl.m4.create());
		
		shadow.ellipsoid = ellipsoid;
		shadow.plane = plane;
		shadow.light = light;
		shadow.color = [0.45, 0.45, 0.45];
		
		var worldInverse = twgl.m4.create();

		var shadowMat = twgl.m4.identity();
		var lightDir = util.m4.axis(shadowMat, 2);
		var axis2 = util.m4.axis(shadowMat, 0);
		var axis3 = util.m4.axis(shadowMat, 1);
		
		var scalingMat = twgl.m4.scaling([1,0,1]);
		var pOrientMat = twgl.m4.identity();
		var pOrientX = util.m4.axis(pOrientMat, 0);
		var pOrientY = util.m4.axis(pOrientMat, 1);
		var pOrientZ = util.m4.axis(pOrientMat, 2);

		const updateDisc = shadow._update;
		shadow._update = function() {
		
			// create shadow in object space
			twgl.m4.inverse(this.ellipsoid.world, worldInverse);
			twgl.m4.transformDirection(worldInverse, this.light.dir, lightDir);
			twgl.v3.normalize(lightDir, lightDir);
			
			
			twgl.v3.cross(lightDir, axis2, axis3);
			twgl.v3.normalize(axis3, axis3);
			twgl.v3.cross(axis3, lightDir, axis2);
			
			// flatten to plane in world space
			twgl.m4.multiply(this.ellipsoid.world, shadowMat, this.world);
			twgl.m4.multiply(scalingMat, this.world, this.world);
			
			// TODO: instead project to plane in world space by appropriate scaling and translation
			
			
			updateDisc.call(this);
		};
		
		shadow.changed();
		/*
		So, the first attempt is all well and good when the light is perpendicular to the ground
		plane, but fails when it's not.
		
		We're forming the disc the light makes around the object and projecting that
		disc perpendicularly onto the ground by simply flattening it.
		For non-peroendicular light, we need to project this elliptical disc properly.
		Its projection will be another ellipse, and it will be the intersection of an
		elliptical cylinder and the ground plane.
		
		One option is to project every single vertex in a vertex shader.
		An option I've worked with in the past is to project only the extrema of the
		ellipse.  I haven't verified this produces a correct result.
		A final way might be to consider the transformation upon the ellipse as the
		portion of intuitin used to determine that it is indeed an ellipse.
		
		Consider this last option, we have the intersection of an elliptical cylinder
		with a flat plane.  The angle at which the plane is not perpendicular with
		the cylinder will be the direction and amount in which the cylinder is evenly,
		linearly scaled in its projection.  This scaling is the only transformation
		it undergoes (roughly), but it is extreme at extreme angles.
		
		We can use geometry to do this.
		
		Since the scaling is linear, the extrema approach will also work if the extrema
		taken are those in line with the angle at which the plane is tilted relative to
		the light.
		
		Thinking about it, the scale goes to infinity at 90deg, and goes to 1.0 at 0deg,
		so it's probably the inverse of the dot product.  The projection is the hypotenuse
		and the the projectee the adjacent of a right triangle, so that checks out.
		
		What direction is this scale in?  The direction of the light, projected on the plane.
		
		So we need to construct a transformation matrix that:
		- moves the ellipsoid to the intersection of the light dir and the plane
		- adjusts it such that is coplanar
		- scales it to 1/dot its lenght in direction of the light projected on plane
		
		can we consider both these adjustments a scale?  yes - but then 1/dot is not
		the correct scale.  can we use dotproducts to precalculate the needed orientation
		matrix?  I believe so; the cross product to acquire the axis will give part.
		
		let's try with an orientation matrix.  it seems promising.
		
		got distracted by scaling matrix.  Much simpler.  If we scale by zero in direction of
		plane normal, then we scale by 1/dot^2 in direction of light projected onto plane.
		*/

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
		light.dir[0] = Math.sin(ms / 1024.0);
		light.dir[1] = -Math.abs(Math.cos(ms / 1024.0));
		//light.changed();
	};
	
	var light = gfx.DirectionalLight(gfx.scene, v3.copy([0, -1, 0]), [1, 1, 1]);
	var ground = gfx.Plane(gfx.scene, [0,1,0], [0,0,0]);
	

	var obj1 = gfx.Ellipsoid(gfx.scene, m4.multiply(m4.translation([0,1.6,0]),m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1]))));
	var obj2 = gfx.Ellipsoid(gfx.scene, m4.translation([1.5,1,1.5]), 'outline');


	var shadow1 = gfx.EllipsoidPlaneShadow(gfx.scene, obj1, ground, light);
	
	var shadow2 = gfx.Disc(gfx.scene, m4.copy([1,0,0,0,0,0,1,0,0,1,0,0,1.5,0,1.5,1]));
	shadow2.color = [0.45,0.45,0.45,1.0];
	shadow2.changed();

	input.ondrag2d(0,0);
	
	util.status('Loaded.');

	gfx.start();
	
	//net.testLogin();

};
