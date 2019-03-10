const ui = {
	users: $("#users"),
	clear: $("#clear"),
	add: $("#add")
}
async function getCurrentUser() {
	if (!(await api.getCurrentSite())) { // not allowed to access domain
		throw new Error("You are not on DMOJ!");
	}
	let user = await api.executeScript(scripts.getUser)
	if (user.error === true) {
		throw new Error(user.message);
	}
	return user.user;
}

async function getToken() {
	return (await api.getCookie(config.oj, config.cookieName)).value;
}

async function getUsers() {
	let users = await api.getStorage({"users": {}});
	return users.users;
}

async function addUser(name, token) {
	let users = await getUsers();
	if (typeof users[name] !== "undefined") {
		throw new Error("User already exists!");
	}
	users[name] = token;
	return await api.setStorage({
		users: users
	});
}

async function removeUser(name) {
	let users = await getUsers();
	if (typeof users[name] === "undefined") {
		throw new Error("User does not exist!");
	}
	return await api.setStorage({
		users: users
	});
}

async function updateUser(name, value) {
	let users = await getUsers();
	if (typeof users[name] === "undefined") {
		throw new Error("User does not exist!");
	}
	users[name] = value;
	return await api.setStorage({
		users: users
	});
}

async function displayUsers() {
	ui.users.html(""); // clear current users
	let users = Object.keys(await getUsers());
	if (users.length === 0) {
		ui.users.html("No users added.");
		return;
	}
	for (let user of users) {
		ui.users.append(`<div class="user" data-user="${user}">${user}</div>`);
	}

}

async function switchUser(user) {
	let users = await getUsers();
	let token = users[user];
	await api.setCookie(config.oj, config.cookieName, token); // switch cookie to new account
	await api.executeScript(scripts.reload); // refresh page
}

// add user
ui.add.on("click", async function() {
	let currentUser;
	try {
		currentUser = await getCurrentUser();
	} catch (e) { // failed to get user (not logged in)
		return alert(e.message);
	}
	let currentToken = await getToken(); // get current token
	try {
		await addUser(currentUser, currentToken);
	} catch (e) { // adding a new user while stilled logged in.
		await api.setCookie(config.oj, config.cookieName, ""); // clear token to prevent invalidation
		await api.executeScript(scripts.goToLogin); // go to login page
		return;
	}
	await displayUsers(); // update users
})

// clear all users
ui.clear.on("click", async function() {
	await api.clearStorage();
	await displayUsers(); // update display
})

// user clicks the account that they want to switch to
$(document).on("click", ".user", async function(e) {
	await switchUser($(this).attr("data-user"))
})

// user updates the cookie of an account
$(document).on("contextmenu", ".user", async function(e) {
	let currentUser;
	try {
		currentUser = await getCurrentUser();
	} catch (e) {
		return alert(e.message);
	}
	if (currentUser !== $(this).attr("data-user")) {
		return alert("You must be logged in to the same account to update the token!");
	}
	updateUser(currentUser, await getToken());
	alert("Updated!");
	return false;
})

// display users on load
$(document).ready(async function() {
	await displayUsers();
})

// detect current site
api.getCurrentSite().then(function(res) {
	if (!res) {
		$("html").html("<center style='width: 300px;'><h1>You are not on DMOJ!</h1></center>")
	}
})