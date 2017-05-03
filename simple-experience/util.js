var util = {
	
	msg: function(msg) {
	
		var p = document.createElement('p');
		p.appendChild(document.createTextNode(msg));
		document.body.appendChild(p);
	},
	
	range: function(low, high, count, inclusive) {
	
		var ret = [], i;
		if (! high) {
			high = low;
			low = 0;
		}
		
		if (! count) {
			count = high - low;
			if (inclusive) ++ count;
			for (i = 0; i < count; ++ i)
				ret[i] = low + i;
		} else {
			var max = count;
			if (inclusive) ++ max;
			for (i = 0; i < max; ++ i)
				ret[i] = low + (high - low) * i / count;
		}
		return ret;
	},

	m3: {
		identity: function(dst) {
			dst = dst || new Float32Array(9);

			dst[0] = 1;
			dst[1] = 0;
			dst[2] = 0;
			dst[3] = 0;
			dst[4] = 1;
			dst[5] = 0;
			dst[6] = 0;
			dst[7] = 0;
			dst[8] = 1;

			return dst;
		},
		from4: function(m4, dst) {
			dst = dst || new Float32Array(9);

			dst[0] = m4[ 0];
			dst[1] = m4[ 1];
			dst[2] = m4[ 2];
			dst[3] = m4[ 4];
			dst[4] = m4[ 5];
			dst[5] = m4[ 6];
			dst[6] = m4[ 8];
			dst[7] = m4[ 9];
			dst[8] = m4[10];

			return dst;
		},
		inverse: function(m, dst) {
			dst = dst || new Float32Array(9);

			var m00 = m[0];
			var m01 = m[1];
			var m02 = m[2];
			var m10 = m[3];
			var m11 = m[4];
			var m12 = m[5];
			var m20 = m[6];
			var m21 = m[7];
			var m22 = m[8];
		
			var i00 = m11 * m22 - m12 * m21;
			var i10 = m12 * m20 - m10 * m22;
			var i20 = m10 * m21 - m11 * m20;

			var d = 1.0 / (m00 * i00 + m01 * i10 + m02 * i20);

			dst[0] = d * i00;
			dst[1] = d * (m02 * m21 - m01 * m22);
			dst[2] = d * (m01 * m12 - m02 * m11);
			dst[3] = d * i10;
			dst[4] = d * (m00 * m22 - m02 * m20);
			dst[5] = d * (m02 * m10 - m00 * m12);
			dst[6] = d * i20;
			dst[7] = d * (m01 * m20 - m00 * m21);
			dst[8] = d * (m00 * m11 - m01 * m10);

			return dst;
		},
		multiply: function(a, b, dst) {
			dst = dst || new Float32Array(9);

			var a00 = a[0];
			var a01 = a[1];
			var a02 = a[2];
			var a10 = a[3];
			var a11 = a[4];
			var a12 = a[5];
			var a20 = a[6];
			var a21 = a[7];
			var a22 = a[8];

			var b00 = b[0];
			var b01 = b[1];
			var b02 = b[2];
			var b10 = b[3];
			var b11 = b[4];
			var b12 = b[5];
			var b20 = b[6];
			var b21 = b[7];
			var b22 = b[8];

			dst[0] = a00 * b00 + a10 * b01 + a20 * b02;
			dst[1] = a01 * b00 + a11 * b01 + a21 * b02;
			dst[2] = a02 * b00 + a12 * b01 + a22 * b02;
			dst[3] = a00 * b10 + a10 * b11 + a20 * b12;
			dst[4] = a01 * b10 + a11 * b11 + a21 * b12;
			dst[5] = a02 * b10 + a12 * b11 + a22 * b12;
			dst[6] = a00 * b20 + a10 * b21 + a20 * b22;
			dst[7] = a01 * b20 + a11 * b21 + a21 * b22;
			dst[8] = a02 * b20 + a12 * b21 + a22 * b22;

			return dst;
		},
		transpose: function(m, dst) {
			dst = dst || new Float32Array(9);

			if (dst === m) {
				var t;

				t = m[1];
				m[1] = m[3];
				m[3] = t;

				t = m[2];
				m[2] = m[6];
				m[6] = t;

				t = m[5];
				m[5] = m[7];
				m[7] = t;
				return dst;
			}

			var m00 = m[0];
			var m01 = m[1];
			var m02 = m[2];
			var m10 = m[3];
			var m11 = m[4];
			var m12 = m[5];
			var m20 = m[6];
			var m21 = m[7];
			var m22 = m[8];

			dst[0] = m00;
			dst[1] = m10;
			dst[2] = m20;
			dst[3] = m01;
			dst[4] = m11;
			dst[5] = m21;
			dst[6] = m02;
			dst[7] = m12;
			dst[8] = m22;
		}
	}
};

window.onerror = function(msg, url, line, col, err) {
	util.msg(url + ':' + line + ': ' + msg);
	if (err)
	   util.msg(err.stack);
};

util.msg('Loading ...');
