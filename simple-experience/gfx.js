var gfx = {};
(function(){
    
    var m4 = twgl.m4;
    var v3 = twgl.v3;
    var gl = twgl.getContext(document.createElement('canvas'));
    gfxgeom._init(gl);
    
    var scene = gfxgeom.Scene(m4.create(), m4.create());
    
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.left = '0';
    gl.canvas.style.top = '0';
    gl.canvas.style.width = '100vw';
    gl.canvas.style.height = '100vh';
    gl.canvas.style.zIndex = '-1';
    
    document.body.style.margin = 0;
    document.body.appendChild(gl.canvas);
    
    window.onresize = function() {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        m4.perspective(Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.0, 1024, scene.projection);
        scene.changed();
    };
    
    
    gfx.canvas = gl.canvas;
    
    gfx.scene = scene;
    
    gfx.testGL = function() {
        gl.clearColor(0.9, 0.9, 0.9, 1.0);
        m4.lookAt([0,0,10], [0,0,0], [0,1,0], scene.camera);
        var obj1 = gfxgeom.Ellipsoid(scene, m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1])));
        var obj2 = gfxgeom.Ellipsoid(scene, m4.translation([1.5,0,1.5]));
        function render(ms) {
            gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT);
            obj1.draw(gl);
            obj2.draw(gl);
            requestAnimationFrame(render);
        }
        window.onresize();
        requestAnimationFrame(render);
    };
})();
