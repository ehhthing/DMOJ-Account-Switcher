window.scripts = {
	// this is very hacky, but it works.
	getUser: `
		(function() {
			if (document.querySelector('#user-links span span') == null) {
				return {error: true, message: "Not logged in!"};
			} else {
				return {error: false, user: document.querySelector('#user-links b').innerText};
        	}
		})()
	`,
	reload: "window.location.reload()",
	goToLogin: "window.location.href = '/accounts/login/'"
}