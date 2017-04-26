var input = {};
(function(){
    var registerX, registerY;
    var clicking;
    window.addEventListener('mousedown', function(e) {
        registerX = e.offsetX;
        registerY = e.offsetY;
        clicking = true;
        return false;
    });
    window.addEventListener('mousemove', function(e) {
        if (!e.buttons) return;
        if (clicking) {
            input.startdrag2d(registerX, registerY);
            clicking = false;
        }
        input.ondrag2d(e.offsetX - registerX, e.offsetY - registerY);
        registerX = e.offsetX;
        registerY = e.offsetY;
        return false;
    });
    window.addEventListener('mouseup', function(e) {
        if (clicking) {
            input.onclick2d(registerX, registerY);
        } else {
            input.stopdrag2d(e.offsetX, e.offsetY);
        }
        return false;
    });
    
    input.onclick2d = function(x, y) {};
    input.startdrag2d = function(x, y) {};
    input.ondrag2d = function(dx, dy) {};
    input.stopdrag2d = function(x, y) {};
})();