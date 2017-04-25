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

    var auth0lock = new Auth0Lock('yxH-gFdeeRbVBH1C7oYqnCIrzvmgUci0', 'fuzzytew.auth0.com', {
            
        });
    
    auth0lock.on('authenticated', function(result) {
        localStorage.setItem('accessToken', result.accessToken);
        auth0.getUserInfo(result.accessToken, function(error, info) {
            if (error) {
                auth0lock.show({flashMessage:{type:'error',text:error}});
                return;
            }
            message(JSON.stringify(info));
        });
    });
    
    auth0lock.show({
        flashMessage: {
            type: 'success',
            text: 'Simple Experience needs a way to identify you'
        }
    });
   
    
};