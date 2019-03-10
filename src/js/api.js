function promisify(api) {
	return function(param) {
		return new Promise(function(resolve, reject) {
			let cb = function(res) {
				if (res instanceof Error) {
					return reject(res);
				}
				return resolve(res);
			}
			if (param) {
				api(param, cb)
			} else {
				api(cb)
			}
		})
	}
}

// must have custom promisify for storage object or chrome will complain about "must be on an instance of..."
function storagePromisify(action) {
	return function(key) {
		return new Promise(function(resolve) {
			let cb = function(data) {
				if (data) return resolve(data);
				return resolve();
			}
			if (key) {
				chrome.storage.local[action](key, cb)
			} else {
				chrome.storage.local[action](cb)
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
	getStorage: storagePromisify("get"),
	setStorage: storagePromisify("set"),
	clearStorage: storagePromisify("clear")
}