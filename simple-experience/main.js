function message(msg) {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(msg));
    document.body.appendChild(p);
}

window.onerror = function(msg, url, line) {
    message(url + ':' + line + ': ' + msg);
};
message('Loading ...')


document.body.onload = function() {
    
    var m4 = twgl.m4;
    var radY = 0;
    var distZ = 10;
    var matY = m4.create();
    var matDist = m4.create();
    
    input.ondrag2d = function(dx, dy) {
        distZ *= (128 + dy) / 128.0;
        m4.translation([0,1,distZ], matDist);
        radY += dx / 256.0;
        m4.rotationY(radY, matY);
        m4.multiply(matY, matDist, gfx.scene.camera);
        gfx.scene.moved();
    };
    
    util.msg('Loaded.');

    gfx.testGL();
    input.ondrag2d(0,0);
    //net.testLogin();

};
