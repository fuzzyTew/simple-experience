var net = {
	testLogin: function() {
		var pusher = new Pusher('8999c2b708a9a3152cb7', {encrypted:true});
		//var pusherWorldChannel = pusher.subscribe('private-world');
	
		var auth0lock = new Auth0Lock('yxH-gFdeeRbVBH1C7oYqnCIrzvmgUci0', 'fuzzytew.auth0.com', {
				languageDictionary:{title:'Simple Experience'},
				theme:{/*logo:'',*/primaryColor:'#808080'},
				auth:{scope:'openid pusherAuth',params:{socket:'3',channels:['private-world','private-extra']}}
			});
			
		function onAuthenticated() {
			auth0lock.getUserInfo(localStorage.getItem('accessToken'), function(error, profile) {
				if (error) {
					auth0lock.show({flashMessage:{type:'error',text:error}});
					return;
				}
				util.msg('nickname: ' + profile.nickname);
				util.msg('signatures (add key: prior): ' + JSON.stringify(profile.pusherSignatures));
			});
		}
		
		auth0lock.on('authenticated', function(result) {
			auth0lock.hide();
			localStorage.setItem('accessToken', result.accessToken);
			onAuthenticated();
		});
		
		if (localStorage.getItem('accessToken'))
			onAuthenticated();
		else
			auth0lock.show();
	}
};
