fs = require('fs');

module.exports = {
	adduser: function(initialObj, fname, lname, email, phone, psw) {
		for (var user in initialObj.users) {
			if (initialObj.users[user].email === email) return false;
		}
		let obj = {
			email: email,
			fname: fname,
			lname: lname,
			phone: phone,
			pass: psw,
			acquaintances: [],
			friends: [
				{
					sn: 'lastfm',
					friends: []
				},
				{
					sn: 'twitter',
					friends: []
				},
				{
					sn: 'vk',
					friends: []
				}
			],
			lastfm_id: '0',
			lastfm_username: '',
			twitter_username: '',
			vk_username: '',
			lastfm_linked: false,
			twitter_linked: false,
			vk_linked: false,
			date: Date.now()
		};
		console.log(initialObj);
		initialObj.users.push(obj);
		return true;
	},
	putuser: function(initialObj, network, email, name) {
		var x = 0;
		for (var user in initialObj.users) {
			if (initialObj.users[user].email === email) x = user;
		}
		switch (network) {
			case 'lastfm':
				initialObj.users[x].lastfm_username = name;
				break;
			case 'vk':
				initialObj.users[user].vk_username = name;
				initialObj.users[user].vk_linked = true;
				break;
			default:
				break;
		}
		var x = JSON.stringify(initialObj);
		fs.writeFile('database.json', x, (err) => {
			if (err) throw err;
		});
		return true;
	},
	getFriends: function(initialObj, email, network) {
		for (var user in initialObj.users) {
			if (initialObj.users[user].email === email) {
				for (var net in initialObj.users[user].friends) {
					if (initialObj.users[user].friends[net].sn === network)
						return initialObj.users[user].friends[net].friends;
				}
			}
		}
		return null;
	},
	checkUser: function(initialObj, email, pass) {
		for (var user in initialObj.users) {
			if (initialObj.users[user].email === email) {
				if (initialObj.users[user].pass === pass) {
					return true;
				} else return false;
			}
		}
		return false;
	},
	checkAuth: function(req, res, next) {
		if (!req.session.email) {
            res.redirect("/login?link=" + req.originalUrl);
		} else {
			next();
		}
	},
	addAcq: function(jsonData, addToEmail, acqID, sn) {
		let found = false;
		for (var user in jsonData) {
			if (jsonData.users[user].email == addToEmail) {
				for (var acq in jsonData.users[user].acquaintances) {
					if (acq.sn == sn) {
						acq.friends = acq.friends.push((acqID, Date.now()));
						found = true;
						break;
					}
				}
			}
			if (found == true) {
				break;
			}
		}

		fs.writeFile('database.json', JSON.stringify(jsonData), (err) => {
			if (err) throw err;
		});
	},
	addFriend: function(jsonData, addToEmail, friends, sn) {
		let new_friends_list = [];
		let found = false;
		if (sn == 'lastfm') {
			for (var user in jsonData.users) {
				if (jsonData.users[user].email == addToEmail) {
					for (var net in jsonData.users[user].friends) {
						if (jsonData.users[user].friends[net].sn == sn) {
							for (var index in friends.user) {
								var obj = {
									img: friends.user[index].image[1]['#text'],
									name: friends.user[index].name,
									real_name: friends.user[index].realname,
									country: friends.user[index].country,
									from: 'LastFM',
									link: 'https://www.last.fm/user/' + friends.user[index].name
								};
								// console.log(obj);
								new_friends_list.push(obj);
							}
						}
						jsonData.users[user].friends[net].friends = new_friends_list;
						var x = JSON.stringify(jsonData);
						fs.writeFile('database.json', x, (err) => {
							if (err) throw err;
						});
						return true;
					}
				}
			}
		}

		if (sn == 'twitter') {
			for (var user in jsonData.users) {
				if (jsonData.users[user].email == addToEmail) {
					for (var net in jsonData.users[user].friends) {
						if (jsonData.users[user].friends[net].sn == sn) {
							for (var index in friends) {
								var obj = {
									img: '',
									name: friends[index].screen_name,
									real_name: friends[index].name,
									country: friends[index].location,
									from: 'Twitter',
									link: 'https://twitter.com/' + friends[index].screen_name
								};
								// console.log(obj);
								new_friends_list.push(obj);
							}
							jsonData.users[user].friends[net].friends = new_friends_list;
							var x = JSON.stringify(jsonData);
							fs.writeFile('database.json', x, (err) => {
								if (err) throw err;
							});
							return true;
						}
					}
				}
			}
		}
		if (sn == 'vk') {
			for (var user in jsonData.users) {
				if (jsonData.users[user].email == addToEmail) {
					for (var net in jsonData.users[user].friends) {
						if (jsonData.users[user].friends[net].sn == sn) {
							for (var index in friends) {
								if (friends[index].hasOwnProperty('country')) var cnt = friends[index].country.title;
								else var cnt = '';
								var obj = {
									img: friends[index].photo_100.split('?ava')[0],
									name: friends[index].first_name + ' ' + friends[index].last_name,
									real_name: friends[index].first_name + ' ' + friends[index].last_name,
									country: cnt,
									from: 'VK',
									link: 'https://vk.com/id' + friends[index].id
								};
								new_friends_list.push(obj);
							}

							console.log(net, jsonData.users[user].friends);
							jsonData.users[user].friends[net].friends = new_friends_list;
							var x = JSON.stringify(jsonData);
							fs.writeFile('database.json', x, (err) => {
								if (err) throw err;
							});
							return true;
						}
					}
				}
			}
		}
	},

	getAcq(jsonData, email){
		let ret_json = {
			users:[]
		}
		console.log(ret_json);
		for(user in jsonData.users){
			if(jsonData.users[user].email == email){
				for(a in jsonData.users[user].acquaintances){
					let acq = jsonData.users[user].acquaintances[a];
					console.log(acq.alsoOn);
					let sn = acq.alsoOn;
					switch(sn){
						case "twitter":
							var obj = {
								fname : acq.acq.fname,
								lname : acq.acq.lname,
								sn : acq.alsoOn,
								sn_username: acq.acq.twitter_username,
								link : "https://www.twitter.com/" + acq.acq.twitter_username
							}
							ret_json.users.push(obj);
							break;
						case "vk":
							var obj = {
								fname : acq.acq.fname,
								lname : acq.acq.lname,
								sn : acq.alsoOn,
								sn_username: acq.acq.vk_username,
								link : "https://vk.com/id" + acq.acq.vk_username
							}
							ret_json.users.push(obj);
							break;
						case "lastfm":
							var obj = {
								fname : acq.acq.fname,
								lname : acq.acq.lname,
								sn : acq.alsoOn,
								sn_username: acq.acq.lastfm_username,
								link : "https://www.lastfm.com/user/" + acq.acq.twitter_username
							}
							ret_json.users.push(obj);
							break;
					}
				}
			}
		}
		return ret_json;
	},

	// generateFOAF(jsonData, json, sn){
	// 	for(j in json.label)
	// 	for(u in jsonData.users)
	// },

	extractFriendsGraph(jsonData, user, user_id, sn, depth, maxDepth, lastID, data, foaf){
		var username = "";
		let already_added = false;
		switch(sn){
			case "lastfm":
				var username = user.lastfm_username;
				break;
			case "twitter":
				var username = user.twitter_username;
				break;
			case "vk":
				var username = user.vk_username;
				break;
		}

		if(depth == 0){
			data.nodes.push({
				"id": 1,
				"label": username,
				"x" : 250,
				"y" : 250,
				"group": "root"
				// "from" : "",
				// "kinship": 0
			});
			depth += 1;
		}
		if(depth < maxDepth){
			for(i in user.friends){
				if(user.friends[i].sn == sn){
					let friends_list = user.friends[i].friends;
					for(friend in friends_list){
						already_added = false;
						for(node in data.nodes){
							if(data.nodes[node].label == friends_list[friend].name){
								already_added = true;
								data.edges.push({
									from: user_id,
									to: data.nodes[node].id,
									'arrows': 'to'
								});
								// break;
							}
						}
						if(already_added == false){
							lastID += 1;
							data.nodes.push({
								"id": lastID,
								"label": friends_list[friend].name,
								"group": "regular"
								// "from": username,
								// "kinship": depth
							});
							data.edges.push({
								from: user_id,
								to: lastID,
								"arrows": 'to'
							});

							foaf += "<foaf:Person>\n\t<foaf:Person rdf:Name=" + friends_list[friend].real_name + '>\n\t<foaf:name xml:lang="en">' + friends_list[friend].real_name + "</foaf:name>\n";
							foaf += '\t<foaf:img>' + friends_list[friend].img + "</foaf:img>\n";
							foaf += '\t<foaf:OnlineAccount>\n\t\t<foaf:accountName>' + friends_list[friend].name + '</foaf:accountName>\n';
							foaf += '\t\t<foaf:accountLink>' + friends_list[friend].link + "</foaf:accountLink>\n\t</foaf:OnlineAccount>\n";
							foaf += '\t<foaf:knownBy>\n' + '\t\t<foaf:Person>\n' + '\t\t\t<foaf:name>' + username  + '</foaf:name>\n' + '\t\t</foaf:Person>\n' + '\t<foaf:knows>\n';
							foaf += "</foaf:Person>\n";
						}
						
						for(user in jsonData.users){
							var user_snName = "";
							switch(sn){
								case "lastfm":
									var user_snName = jsonData.users[user].lastfm_username;
									break;
								case "twitter":
									var user_snName = jsonData.users[user].twitter_username;
									break;
								case "vk":
									var user_snName = jsonData.users[user].vk_username;
									break;
							}
							if(user_snName == friends_list[friend].name){
								var aux;
								aux = this.extractFriendsGraph(jsonData, jsonData.users[user], lastID, sn, depth+1, maxDepth, lastID, data, foaf);
								foaf = aux[1];
								break;
							}
						}
					}
					break;
				}
			}
		}
		return [data, foaf];
	},

	getRealName: function(real_name) {
		ret_name = real_name;
		ret_name = ret_name.replace(/\s/g, '');
		ret_name = ret_name.toLowerCase();
		return ret_name;
	},

	lookUpUser: function(jsonData, nickname, fromSN, searchInSN) {
		var ret_user = [];
		for (user in jsonData.users) {
			if (fromSN == 'lastfm') {
				if (searchInSN == 'twitter') {
					if (jsonData.users[user].lastfm_username == nickname) {
						if (jsonData.users[user].twitter_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('twitter');
							return ret_user;
						}
					}
				}
				if (searchInSN == 'vk') {
					if (jsonData.users[user].lastfm_username == nickname) {
						if (jsonData.users[user].vk_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('vk');
							return ret_user;
						}
					}
				}
			}
			if (fromSN == 'twitter') {
				if (searchInSN == 'lastfm') {
					if (jsonData.users[user].twitter_username == nickname) {
						if (jsonData.users[user].lastfm_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('lastfm');
							return ret_user;
						}
					}
				}
				if (searchInSN == 'vk') {
					if (jsonData.users[user].twitter_username == nickname) {
						if (jsonData.users[user].vk_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('vk');
							return ret_user;
						}
					}
				}
			}
			if (fromSN == 'vk') {
				if (searchInSN == 'twitter') {
					if (jsonData.users[user].vk_username == nickname) {
						if (jsonData.users[user].twitter_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('twitter');
							return ret_user;
						}
					}
				}
				if (searchInSN == 'lastfm') {
					if (jsonData.users[user].vk_username == nickname) {
						if (jsonData.users[user].lastfm_username) {
							ret_user.push(jsonData.users[user]);
							ret_user.push('lastfm');
							return ret_user;
						}
					}
				}
			}
		}
	}
};
