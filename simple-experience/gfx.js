var gfx = {};
(function(){
    
    var m4 = twgl.m4;
    var v3 = twgl.v3;
    var gl = twgl.getContext(document.createElement('canvas'));
    gfxgeom._init(gl);
    
    var projection = m4.create();
    var camera = m4.lookAt([0,0,-10],[0,0,0],[0,1,0]);
    var scene = gfxgeom.Scene(camera, projection);
    
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.left = '0';
    gl.canvas.style.top = '0';
    gl.canvas.style.width = '100vw';
    gl.canvas.style.height = '100vh';
    
    document.body.style.margin = 0;
    document.body.appendChild(gl.canvas);

    var stillRender;
    
    window.onresize = function() {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        m4.perspective(Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.0, 1024, projection);
        scene.changed();
        
        if (stillRender) requestAnimationFrame(stillRender);
    };
    
    

    
    gfx.testGL = function() {
        var obj = gfxgeom.Ellipsoid(scene, m4.multiply(m4.rotationZ(0.8), m4.scaling([2,1,1])));
        obj.changed();
        function render(ms) {
            obj.draw(gl);
            //requestAnimationFrame(render);
        }
        window.onresize();
        requestAnimationFrame(render);
        stillRender = render;
    };
})();
