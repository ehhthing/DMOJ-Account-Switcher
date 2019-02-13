function promisify(api) {
	return function(param) {
		return new Promise(function(resolve, reject) {
			if (param) {
				api(param, function(res) {
					if (res instanceof Error) {
						return reject(res);
					}
					return resolve(res);
				})
			} else {
				api(function(res) {
					if (res instanceof Error) {
						return reject(res);
					}
					return resolve(res);
				})
			}
		})
	}
}
window.api = {
	executeScript: async function(code) {
		let res = await promisify(chrome.tabs.executeScript)({
			code: code
		})
		return res[0];
	},
	getCurrentSite: async function() {
		let tabs = await promisify(chrome.tabs.query)({
			active: true,
			currentWindow: true
		})
		return tabs[0].url;
	},
	getCookie: async function(url, name) {
		return promisify(chrome.cookies.get)({
			url: url,
			name: name
		})
	},
	setCookie: async function(url, name, value) {
		return promisify(chrome.cookies.set)({
			url: url,
			name: name,
			value: value
		})
	},
	getStorage: promisify(chrome.storage.local.get),
	setStorage: promisify(chrome.storage.local.set),
	clearStorage: promisify(chrome.storage.local.clear)
}