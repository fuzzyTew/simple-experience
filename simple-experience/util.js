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
