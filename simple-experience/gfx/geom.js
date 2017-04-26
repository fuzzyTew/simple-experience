var gfxgeom  = {};
(function () {
    var v3 = twgl.v3;
    var m4 = twgl.m4;
    var geom = gfxgeom;
    
    geom._init = function(gl) {
        _Circle(gl);
        _Ellipsoid(gl);
    };
    
    var fsBlack = `
void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

    
    /****
    The scene wraps a camera and connects it to a set of objects.
    It will notify the objects to update their rendering data when informed that the camera has moved.
    ****/
    geom.Scene = function(camera, projection)
    {
        var movingObjects = new Set();
        var turningObjects = new Set();
        
        var view = m4.inverse(camera);

        return {
            projection: projection,
            camera: camera,
            view: view,
            viewProjection: m4.multiply(projection, view),
            turned: function() {
                this.changed();
                for (let object of turningObjects)
                    object._sceneTurned(this);
            },
            moved: function() {
                this.changed();
                for (let object of movingObjects)
                    object._sceneMoved(this);
            },
            changed: function() {
                m4.inverse(this.camera, this.view);
                m4.multiply(this.projection, this.view, this.viewProjection);
            },
            _notifyMoved: function(object) { movingObjects.add(object); },
            _ignoreMoved: function(object) { movingObjects.delete(object); },
            _notifyTurned: function(object) { turningObjects.add(object); },
            _ignoreTurned: function(object) { turningObjects.delete(object); }
        };
    };
    

    /****
    The Circle is just a test.
    ****/
    
    var vsCircle = `
uniform vec3 depth;
uniform vec3 u;
uniform vec3 v;
uniform mat4 world;
uniform mat4 viewProjection;

attribute float radians;

varying vec4 position;

void main() {
    position = world * vec4( depth + u * cos(radians) + v * sin(radians), 1.0 );

    gl_Position = viewProjection * position;
}
`;
    
    function _Circle(gl) {
        gl.biRadianOutline = twgl.createBufferInfoFromArrays(gl, {radians:{numComponents:1,data:util.range(0.0,2*3.141592653589793238, 64)}});
        gl.piCircleOutline = twgl.createProgramInfo(gl, [vsCircle, fsBlack], util.msg);
    }
    geom.Circle = function(scene, world) {
        var uniforms = {
            depth: [0,0,1],
            u: [0.5,0,0],
            v: [0,0.5,0],
            world: m4.identity(),
            viewProjection: m4.identity(),
        };
        
        return {
            world: world,
            draw: function(gl) {
                gl.useProgram(gl.piCircleOutline.program);
                twgl.setBuffersAndAttributes(gl, gl.piCircleOutline, gl.biRadianOutline);
                twgl.setUniforms(gl.piCircleOutline, uniforms);
                twgl.drawBufferInfo(gl, gl.biRadianOutline, gl.LINE_LOOP);
            }
        };
    };
    
    
    
    
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
    
    In order to draw this circle we must decide upon axes.  We may take the cross product of the cylindrical axis
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
    var vsEllipsoidOutline = `
uniform vec3 depth;
uniform vec3 u;
uniform vec3 v;
uniform mat4 world;
uniform mat4 viewProjection;

attribute float radians;

varying vec4 position;

void main() {
    position = world * vec4(depth + cos(radians) * u + sin(radians) * v, 1.);

    gl_Position = viewProjection * position;
}
`;
    function _Ellipsoid(gl) {
        gl.piEllipsoidOutline = twgl.createProgramInfo(gl, [vsEllipsoidOutline, fsBlack], util.msg);
    }
        
    geom.Ellipsoid = function(scene, world)
    {
        if (!world) world = m4.create();
        
        var worldViewInverse = m4.create();
        var camPos = v3.create();
        
        var uniforms = {
            depth: v3.create(),
            u: v3.create(),
            v: v3.create(),
            world: world,
            viewProjection: scene.viewProjection
        };

        function updateWorldView() {
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
        }
        
        var ellipsoid = {
            draw: function(gl) {
                gl.useProgram(gl.piEllipsoidOutline.program);
                twgl.setBuffersAndAttributes(gl, gl.piEllipsoidOutline, gl.biRadianOutline);
                twgl.setUniforms(gl.piEllipsoidOutline, uniforms);
                twgl.drawBufferInfo(gl, gl.biRadianOutline, gl.LINE_LOOP);
            },
            world: world,
            changed: updateWorldView,
            _sceneMoved: updateWorldView
        };
        
        ellipsoid.changed();
        scene._notifyMoved(ellipsoid);
        
        return ellipsoid;
    };
})();