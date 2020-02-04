// set number of notifs
chrome.browserAction.setBadgeText({text: "1"});
function getFaces(){
	chrome.storage.sync.get("acqs", function (obj) {
		var li = JSON.parse(obj.acqs);
		document.querySelector("#scrolls").innerHTML = '';
		for (i in li.users){
			document.querySelector("#scrolls").innerHTML += '<div id="face"><h3>Name: ' + li.users[i].fname + ' ' + li.users[i].lname + '</h3><h4>Known as: <a href="'+li.users[i].link+'" target="_blank">'+ li.users[i].sn_username +' </a><h4></div>';
		}
	})
};
document.getElementById('buton').onclick=function(){
	chrome.storage.sync.get("user", function (obj) {
		document.querySelector("#main").innerHTML = "<H2>Hello " + obj.user[0].split('@')[0] + ", here are your recommendations</H2>";
		if (obj.user){
			var url = 'http://localhost:3000/api';
			var data = {
				'name': obj.user[0],
				'pass': obj.user[1]
			}
			var otherParam ={
				headers:{
				"content-type":"text/plain"
				},
				body:JSON.stringify(data),
				method:"POST",
				mode:'no-cors'
			};
			fetch(url,otherParam)
			.then(data=>{return data.json()})
			.then(res=>{
				chrome.storage.sync.set({'acqs':res})
			})
			.catch((error) => {
				console.error('Error:', error);
			  })
		}
		else{
			// SET BADGE
			chrome.browserAction.setBadgeText({text: "10+"});

			//get user login + save data + show data on ext
			function display_h1 (results){
				h1=results;
				chrome.storage.sync.set({'user':[h1[0].split('/')[0],h1[0].split('/')[1]]})
				document.querySelector("#main").innerHTML = "<p>Hello," + h1[0].split('/')[0].split('@')[0] + "</p>";
				var url = 'http://localhost:3000/api';
				var data = {
					'name': h1[0].split('/')[0],
					'pass': h1[0].split('/')[1]
				}
				var otherParam ={
					headers:{
					"content-type":"application/json"
					},
					body:JSON.stringify(data),
					method:"POST"
				};
				fetch(url,otherParam)
				.then(data=>{return data.json()})
				.then(res=>{
					chrome.storage.sync.set({'acqs':res})
				})
				// document.querySelector("#main").innerHTML = "<p>tab title: " + tab_title + "</p><p>dom h1: " + h1[0].split('/')[0] + "</p>";
				}
			chrome.tabs.query({active: true}, function(tabs) {
				var tab_title = '';
				var tab = tabs[0];
				tab_title = tab.title;
				if(tab.title == 'The SON')
					chrome.tabs.executeScript(tab.id, {
					code: 'document.getElementById("email").value + "/" + document.getElementById("psw").value'
				}, display_h1);
			});
		}
	})
	getFaces();
};