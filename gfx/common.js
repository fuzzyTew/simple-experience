gfx.fs = {};

gfx.fs.black = `
void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

gfx.fs.color = `
precision lowp float;

uniform vec4 color;

void main() {
	gl_FragColor = color;
}
`;

gfx.bi = {};
(function(){
	var count = 64;

	gfx.bi.radianOutline = twgl.createBufferInfoFromArrays(gfx.gl, {radians:{numComponents:1,data:util.range(0.0,2*Math.PI, count)}});
	
	var aCosSinOutline = [];
	var aCosSinStrip = [];
	for (var i = 0; i < count; ++ i) {
		var radian = i * 2 * Math.PI / count;
		aCosSinOutline[i * 2] = Math.cos(radian);
		aCosSinOutline[i * 2 + 1] = Math.sin(radian);
	}
	aCosSinStrip[0] = aCosSinOutline[0];
	aCosSinStrip[1] = aCosSinOutline[1];
	for (var i = 1; i < count; ++ i) {
		if (i & 1) {
			aCosSinStrip[i * 2] = aCosSinOutline[i + 1];
			aCosSinStrip[i * 2 + 1] = aCosSinOutline[i + 2];
		} else {
			aCosSinStrip[i * 2] = aCosSinOutline[count * 2 - i];
			aCosSinStrip[i * 2 + 1] = aCosSinOutline[count * 2 - i + 1];
		}
	}

	gfx.bi.cosSinOutline = twgl.createBufferInfoFromArrays(gfx.gl, {cossin:{numComponents:2,data:aCosSinOutline}});
	gfx.bi.cosSinStrip = twgl.createBufferInfoFromArrays(gfx.gl, {cossin:{numComponents:2,data:aCosSinStrip}});
})();