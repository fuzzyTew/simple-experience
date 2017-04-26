// TODO: remove when obsolete
// this is a workaround for issue #46 in twgl
twgl.v3.cross = function(a, b, dst) {
    dst = dst || new VecType(3);

    var t1 = a[2] * b[0] - a[0] * b[2];
    var t2 = a[0] * b[1] - a[1] * b[0];
    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = t1;
    dst[2] = t2;

    return dst;
};

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
    }
};

window.onerror = function(msg, url, line) {
    util.msg(url + ':' + line + ': ' + msg);
};

util.msg('Loading ...');
