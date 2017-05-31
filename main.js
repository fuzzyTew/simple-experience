
(function(){
	gfx.Plane = function(scene, normal, point, shading) {
		twgl.v3.normalize(normal, normal);
		const distance = twgl.v3.dot(normal, point);
		const center = twgl.v3.mulScalar(normal, distance);
		const plane = {
			world: twgl.m4.lookAt(center, twgl.v3.add(center, normal), util.v3.perp(normal)),
			distance: distance,
			normal: normal,
			center: center,
			shading: gfx.SHADING.NONE
		};
		plane.worldInverse = twgl.m4.inverse(plane.world);
		return plane; 
	};
})();

(function(){

	gfx.EllipsoidPlaneDirectionalShadow = function(scene, ellipsoid, plane, light) {
		const shadow = gfx.Disc(scene, twgl.m4.create());
		
		shadow.ellipsoid = ellipsoid;
		shadow.plane = plane;
		shadow.light = light;
		shadow.color = [0.45, 0.45, 0.45, 1.0];
		
		var worldInverse = twgl.m4.create();

		var shadowMat = twgl.m4.identity();
		var lightDir = util.m4.axis(shadowMat, 2);
		var axis2 = util.m4.axis(shadowMat, 0);
		var axis3 = util.m4.axis(shadowMat, 1);
		
		var scalingMat = twgl.m4.scaling([0,1,1]);
		var pOrientMat = twgl.m4.identity();
		var pOrientX = util.m4.axis(pOrientMat, 0);
		var pOrientY = util.m4.axis(pOrientMat, 1);
		var pOrientZ = util.m4.axis(pOrientMat, 2);
		var placementMat = twgl.m4.create();
		
		window.scalingMat = scalingMat;
		window.pOrientMat = pOrientMat;

		const updateDisc = shadow._update;
		shadow._update = function() {
		
			// create shadow in object space
			twgl.m4.inverse(this.ellipsoid.world, worldInverse);
			twgl.m4.transformDirection(worldInverse, this.light.dir, lightDir);
			twgl.v3.normalize(lightDir, lightDir);
			
			
			twgl.v3.cross(lightDir, axis2, axis3);
			twgl.v3.normalize(axis3, axis3);
			twgl.v3.cross(axis3, lightDir, axis2);
			
			// transform to world space
			twgl.m4.multiply(this.ellipsoid.world, shadowMat, this.world);
						
			// flatten to be orthogonal to light
			twgl.m4.multiply(this.light.projectionMat, this.world, this.world);
			
			// project to plane by appropriate scaling and translation
			
			twgl.v3.copy(this.plane.normal, pOrientX);
			twgl.v3.cross(pOrientX, this.light.dir, pOrientY);
			twgl.v3.normalize(pOrientY, pOrientY);
			twgl.v3.cross(pOrientX, pOrientY, pOrientZ);
			var dot = twgl.v3.dot(this.plane.normal, this.light.dir);
			scalingMat[10] = 1.0 / (dot * dot);
			
			twgl.m4.multiply(pOrientMat, scalingMat, placementMat);
			twgl.m4.transpose(pOrientMat, pOrientMat);
			twgl.m4.multiply(placementMat, pOrientMat, placementMat);
			
			twgl.m4.multiply(placementMat, this.world, this.world);
			
			twgl.v3.mulScalar(this.light.dir, this.plane.distance / dot, lightDir);
			twgl.m4.translation(lightDir, placementMat);
			twgl.m4.multiply(placementMat, this.world, this.world);
			//*/
			
			
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
		//ms = -0.45 * Math.PI * 10240.0;
		//ms = 0;
		light.dir[0] = Math.sin(ms / 4096.0);
		light.dir[1] = -0.5;
		light.dir[2] = Math.cos(ms / 32768.0) * 0.5;
		//util.status(light.dir);
		light.changed();
	};
	
	var ambient = gfx.AmbientLight(gfx.scene, [0.4, 0.4, 0.4]);
	var light = gfx.DirectionalLight(gfx.scene, v3.copy([0, -1, 0]), [0.6, 0.6, 0.6]);
	var ground = gfx.Plane(gfx.scene, [0,1,0], [0,0,0]);
	window.light = light;
	
	var beziertri = {
		aa: v3.copy([ 0,  1, -1]),
		ab: v3.copy([-1,  0,  0]), ac: v3.copy([0.5, 1.5,  0]),
		bb: v3.copy([-1,  2,  1]), bc: v3.copy([0, 1,  1]), cc: v3.copy([1,  1,  1]),
		point: function(s, t, u, dst) {
			dst = dst || v3.create();
			var p = [this.aa, this.ab, this.bb, this.bc, this.cc, this.ac];
			// 	aa s^2 + 2 ab s t + bb t^2 + 2 ac s u + 2 bc t u + cc u^2
			const ss = s*s, st = 2*s*t, tt = t*t, tu = 2*t*u, uu = u*u, su = 2*s*u;
			dst[0] = p[0][0]*ss + p[1][0]*st + p[2][0]*tt + p[3][0]*tu + p[4][0]*uu + p[5][0]*su;
			dst[1] = p[0][1]*ss + p[1][1]*st + p[2][1]*tt + p[3][1]*tu + p[4][1]*uu + p[5][1]*su;
			dst[2] = p[0][2]*ss + p[1][2]*st + p[2][2]*tt + p[3][2]*tu + p[4][2]*uu + p[5][2]*su;
			return dst;
		}
	};
	let ct = 12.0;
	let surfscale = v3.divScalar([1.0,1.0,1.0], ct);
	var surfsph = [];
	for (let si = 0; si <= ct; ++ si) {
		let row = [];
		surfsph[si] = row;
		let s = si / ct;
		for (let ti = 0; ti <= ct - si; ++ ti) {
			let t = ti / ct;
			let u = (ct - si - ti) / ct;
			let mat = m4.translation(beziertri.point(s, t, u));
			m4.scale(mat, surfscale, mat);
			row[ti] = gfx.Ellipsoid(gfx.scene, mat, 'outline');
		}
	}
	/* 

	var obj1 = gfx.Ellipsoid(gfx.scene, m4.multiply(m4.translation([0,1.6,0]),m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1]))), 'outline');
	var obj2 = gfx.Ellipsoid(gfx.scene, m4.translation([1.5,1,1.5]));


	var shadow1 = gfx.EllipsoidPlaneDirectionalShadow(gfx.scene, obj1, ground, light);
	
	var obj3 = gfx.Ellipsoid(gfx.scene, m4.multiply(m4.translation([1,1.1,-1.8]),m4.multiply(m4.rotationX(0.7), m4.scaling([0.75,0.25,0.5]))));
	var shadow3 = gfx.EllipsoidPlaneDirectionalShadow(gfx.scene, obj3, ground, light);
	
	var shadow2 = gfx.EllipsoidPlaneDirectionalShadow(gfx.scene, obj2, ground, light);

	*/
	input.ondrag2d(0,0);
	
	util.status('Loaded.');

	gfx.start();
	
	//net.testLogin();

};
