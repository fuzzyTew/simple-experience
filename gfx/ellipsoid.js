/****
The ellipsoid will be rendered as a single, flat ellipse, and then shaded to appear 3D.
The ellipse will be precisely calculated to correctly surround the projected ellipsoid.

The vertex shader will generate the ellipse in model space and then project it to the screen.
In model space, the ellipsoid will be a sphere, as the uneven axes of the ellipsoid are generated by
a world transformation.
Hence, the vertex shader will generate a circle.

The circle generated by the vertex shader is the intersection of a cone extending from the camera
position and intersecting with a unit sphere (at the origin in model space) tangentially.
I wrote it out on paper, and believe I've determined the geometry of this circle.
Consider a cylindrical coordinate system, the axis of the cylinder directed towards the camera.
The distance of the circle along this axis will be equal to the inverse of the distance twoards the camera.
If we call this distance "w", then the radius of the circle is the other side of a symmetrical right triangle,
and is equal to sqrt(1 - w*w).

In order to draw this circle we must decide upon axes.We may take the cross product of the cylindrical axis
with some non-Z axis of the camera to determine them.
****/

/**** This scratch script calculates the 3 coords in the shader and they can be precalculated.
var vsEllipsoidOutline1 = `
uniform mat4 worldViewInverse;
uniform mat4 world;
uniform mat4 viewProjection;

attribute float t;

varying vec4 position;

const float pi = 3.14159265358979323846264338327950288;

void main() {
	vec3 camPos = worldViewInverse[3].xyz;
	float w = 1 / length(camPos);
	vec3 coord3 = camPos * w;
	vec3 coord1 = normalize(cross(worldViewInverse[0].xyz, coord3));
	vec3 coord2 = cross(coord1, coord3);
	coord3 *= w;
	float r = sqrt(1 - w * w);
	coord1 *= r;
	coord2 *= r;

	position = world * vec4(coord3 + cos(t * pi * 2.) * coord1 + sin(t * pi * 2.) * coord2);

	gl_Position = viewProjection * position;
}
`;
****/
(function(){

	var vsEllipsoidOutline = `
precision mediump float;

uniform vec3 depth;
uniform float offset;
uniform vec3 u;
uniform vec3 v;
uniform mat4 worldViewProjection;
uniform highp vec3 cameraModel;

attribute vec2 cossin;

varying highp vec3 ray;

void main() {
	highp vec3 position = depth + cossin.x * u + cossin.y * v;

	gl_Position = worldViewProjection * vec4(position, 1.0) + vec4(0,0,offset,0);
	ray = position - cameraModel;
}
`;
	
	/****
	We have camera location and position in space
	ray = position - camera
	res dot res = 1
	res = camera + ray * t
	    = camera + position t - camera t
	camera.w^2 + 2 * ray.w camera.w t + ray.w^2 t^2 ... = 1
	camera . camera - 1 + 2 * (ray . camera) t + (ray . ray) t^2 = 0
	t = (-b - sqrt(b^2 - 4 a c) / (2 a)
	  = (-b - 2 * sqrt((b/2)^2 - a c) / (2 a)
	  = (-(b/2) - sqrt((b/2)^2 - a c) / a
	
	we can precalc c
	****/
	var fsEllipsoidTest = `
precision mediump float;

uniform float c;
uniform mat4 worldViewProjection;
uniform highp vec3 cameraModel;
uniform mat3 worldNormal;

uniform vec3 lightDir;
uniform vec3 lightColor;
uniform vec3 ambientColor;

varying highp vec3 ray;

void main() {
	float a = dot(ray, ray);
	float b_2 = dot(ray, cameraModel);
	float disc = max(0.0, b_2 * b_2 - a * c);
	float t = (-b_2 - sqrt(disc)) / a;
	vec3 norm = normalize(worldNormal * (t * ray + cameraModel));
	float lit = max(0.0, -dot(norm, lightDir));
	
	gl_FragColor = vec4(ambientColor + lightColor * lit, 1.0);
}
`;
	
	var piEllipsoidFlat = twgl.createProgramInfo(gfx.gl, [vsEllipsoidOutline, gfx.fs.color], util.msg);
	var piEllipsoidTest = twgl.createProgramInfo(gfx.gl, [vsEllipsoidOutline, fsEllipsoidTest], util.msg);
	var piEllipsoidOutline = twgl.createProgramInfo(gfx.gl, [vsEllipsoidOutline, gfx.fs.black], util.msg);
	
	var m4 = twgl.m4;
	var v3 = twgl.v3;
		
	gfx.Ellipsoid = function(scene, world, shading)
	{
		if (!world) world = m4.create();
		
		var worldViewInverse = m4.create();
		var camPos = v3.create();
		
		for (var light of scene.directionalLights) break;
		
		var uniforms = {
			color: [1,1,1,1],
			depth: v3.create(),
			u: v3.create(),
			v: v3.create(),
			worldViewProjection: m4.create(),
			cameraModel: camPos,
			c: 0,
			worldNormal: util.m3.identity(),
			lightDir: light.dir,
			lightColor: light.color,
			ambientColor: scene.ambientLight
		};
		
		function updateWorldView() {
            uniforms.color = this.color;
			uniforms.world = this.world;
			m4.multiply(scene.view, this.world, worldViewInverse);
			m4.inverse(worldViewInverse, worldViewInverse);
			
			m4.getTranslation(worldViewInverse, camPos);
			//console.log(camPos);
			
			var d2 = 1 / v3.lengthSq(camPos);
			m4.getAxis(worldViewInverse, 1, uniforms.u);
			v3.cross(uniforms.u, camPos, uniforms.u);
			v3.normalize(uniforms.u, uniforms.u);
			
			v3.mulScalar(uniforms.u, Math.sqrt(1 - d2), uniforms.u);
			
			var d = Math.sqrt(d2);
			//console.log('l = ' + (1/d) + ' d = ' + d + ' r = ' + Math.sqrt(1 - d2));
			v3.mulScalar(camPos, d, uniforms.depth);
			
			v3.cross(uniforms.depth, uniforms.u, uniforms.v);

			v3.mulScalar(uniforms.depth, d, uniforms.depth);
			
			//console.log('|u| = ' + v3.length(uniforms.u) + ' |v| = ' + v3.length(uniforms.v) + ' |depth| = ' + v3.length(uniforms.depth));
			
			uniforms.c = v3.dot(camPos, camPos) - 1.0;

			util.m3.from4(world, uniforms.worldNormal);
			util.m3.transpose(uniforms.worldNormal, uniforms.worldNormal);
			util.m3.inverse(uniforms.worldNormal, uniforms.worldNormal);
		}
		
		var ellipsoid = {
            _update: function() {
                m4.multiply(scene.viewProjection, this.world, uniforms.worldViewProjection);                
            },
            shading: gfx.SHADING.get(shading),
			_getDraws: function() {
				if (this.shading === gfx.SHADING.OUTLINE)
					return [{
						uniforms: [uniforms, {offset: 0.0}],
                    	programInfo: piEllipsoidFlat,
                    	bufferInfo: gfx.bi.cosSinStrip,
                    	type: gfx.gl.TRIANGLE_STRIP
                    }, {
                    	uniforms: [uniforms, {offset: -1.0 / 1024}],
                    	programInfo: piEllipsoidOutline,
                    	bufferInfo: gfx.bi.cosSinOutline,
                    	type: gfx.gl.LINE_LOOP
					}];
                return [{
                	uniforms: [uniforms, {offset: 0.0}],
                    programInfo: piEllipsoidTest,
                    bufferInfo: gfx.bi.cosSinStrip,
                    type: gfx.gl.TRIANGLE_STRIP
                }];
			},
			color: uniforms.color,
			world: world,
			changed: updateWorldView,
			_sceneMoved: updateWorldView
		};
		
		ellipsoid.changed();
		scene._notifyMoved(ellipsoid);
		scene._draw(ellipsoid);
		
		return ellipsoid;
	};
})();
