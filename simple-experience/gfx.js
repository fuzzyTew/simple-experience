var gfx = {};
(function(){
    
    var m4 = twgl.m4;
    var v3 = twgl.v3;
    var gl = twgl.getContext(document.createElement('canvas'));
    
    var projection = m4.create();
    
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.left = '0';
    gl.canvas.style.top = '0';
    gl.canvas.style.width = '100vw';
    gl.canvas.style.height = '100vh';
    
    document.body.style.margin = 0;
    document.body.appendChild(gl.canvas);
    
    window.onresize = function() {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        m4.perspective(Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clienHeight, 0.0, 1024, projection);
    };
    
    var vsCircle = `
attribute float t;

const float pi = 3.14159265358979323846264338327950288;

void main() {
    gl_Position = vec4( vec2(cos(t * pi * 2.), sin(t * pi * 2.)) * 0.5, 1.0, 1.0 );
}
`;
    var fsBlack = `
void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;
    
    gfx.testGL = function() {
        var piCircle = twgl.createProgramInfo(gl, [vsCircle, fsBlack]);
        var bi1d = twgl.createBufferInfoFromArrays(gl, {t:{numComponents:1,data:util.range(0.0,1.0,32)}});
        
        function render(ms) {
            gl.useProgram(piCircle.program);
            twgl.setBuffersAndAttributes(gl, piCircle, bi1d);
            twgl.drawBufferInfo(gl, bi1d, gl.LINE_LOOP);
            //requestAnimationFrame(render);
        }
        window.onresize();
        requestAnimationFrame(render);
    };
})();
