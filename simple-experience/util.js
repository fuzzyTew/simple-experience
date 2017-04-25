var util = {
    msg: function(msg) {
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(msg));
        document.body.appendChild(p);
    }
};

window.onerror = function(msg, url, line) {
    util.msg(url + ':' + line + ': ' + msg);
};

util.msg('Loading ...');
