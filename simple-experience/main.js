window.onerror = function(msg, url, line) {
    alert(url + ':' + line + ': ');
};

alert('hello!');

document.body.onload = function() {

    alert('loaded!');

    var auth0lock = new Auth0Lock('yxH-gFdeeRbVBH1C7oYqnCIrzvmgUci0', 'fuzzytew.auth0.com', {
            
        });
    
    auth0lock.show({
            flashMessage: {
                type: 'success',
                text: 'Simple Experience needs a way to identify you.'
            }
        });
   
    
};