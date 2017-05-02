(function(){

	var vsDisc = `
uniform mat4 worldViewProjection;

attribute vec2 cossin;

void main() {
    gl_Position = worldViewProjection * vec4(cossin, 0., 1.);
}`;

    var piDisc = twgl.createProgramInfo(gfx.gl, [vsDisc, gfx.fs.color], util.msg);
    
    gfx.Disc = function(scene, world) {
    
        var uniforms = {
            color: [0,0,0,1],
            worldViewProjection: twgl.m4.create()
        };
        
        var disc = {
            _update: function() {
                twgl.m4.multiply(scene.viewProjection, this.world, uniforms.worldViewProjection);
            },
            _getDraws: function(gl) {
                return [{
                    programInfo: piDisc,
                    bufferInfo: gfx.bi.cosSinStrip,
                    uniforms: uniforms,
                    type: gfx.gl.TRIANGLE_STRIP
                }];
            },
            world: world,
            color: uniforms.color,
            changed: function() {
                uniforms.color = this.color;
            },
        };
        scene._draw(disc);
        return disc;
    };
})();