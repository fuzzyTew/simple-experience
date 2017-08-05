var input = {};
(function(){
	
	// ---- override these functions elsewhere to handle events
	input.onclick2d = function(x, y) {};
	input.startdrag2d = function(x, y) {};
	input.ondrag2d = function(dx, dy) {};
	input.stopdrag2d = function(x, y) {};
	// ----


	var registerX, registerY;
	var clicking, down = false;

	function down(x, y) {
		registerX = x;
		registerY = y;
		clicking = true;
		down = true;
	}

	function move(x, y) {
		if (clicking) {
			input.startdrag2d(x, y);
			clicking = false;
		}
		input.ondrag2d(x - registerX, y - registerY);
		registerX = x;
		registerY = y;
	}

	function up(x, y) {
		down = false;
		if (clicking) {
			input.onclick2d(registerX, registerY);
		} else {
			input.stopdrag2d(x, y);
		}
	}

	window.addEventListener('mousedown', function(e) {
		down(e.pageX, e.pageY);
	});

	window.addEventListener('mousemove', function(e) {
		if (!down) return;

		e.preventDefault();
		e.stopPropagation();

		move(e.pageX, e.pageY);
	});

	window.addEventListener('mouseup', function(e) {
		up(e.pageX, e.pageY);
	});

	window.addEventListener('touchstart', function(e) {
		if (e.touches.length > 1)
			return;

		down(e.touches[0].pageX, e.touches[0].pageY);
	});

	window.addEventListener('touchmove', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if (e.touches.length > 1)
			return;

		move(e.touches[0].pageX, e.touches[0].pageY);
	});

	window.addEventListener('touchend', function(e) {
		if (e.touches.length > 1)
			return;

		up(registerX, registerY);
	});

	window.addEventListener('touchcancel', function(e) {
		if (e.touches.length > 1)
			return;

		up(registerX, registerY);
	});


})();
