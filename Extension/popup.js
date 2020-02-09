document.getElementById("faces").addEventListener("click", function(){getFaces('');});
document.getElementById("sync").addEventListener("click", function(){sync();});
//ADDED NOW
function getFaces(option){
	console.log('face',option)
	chrome.storage.sync.get("acqs", function (obj) {
		var li = JSON.parse(obj.acqs);
		var cnt=0;
		document.querySelector("#scrolls").innerHTML = '';
		if(option == ''){
			var e = document.getElementById("select_id");
			var sn = e.options[e.selectedIndex].value;
		}
		else
			sn=option;
		for (i in li.users){
			if (sn == li.users[i].sn){
				cnt++;
				document.querySelector("#scrolls").innerHTML += '<div id="face"><h3>Name: ' + li.users[i].fname + ' ' + li.users[i].lname + '</h3><h4>Known as: <a href="'+li.users[i].link+'" target="_blank">'+ li.users[i].sn_username +' </a><h4></div>';
			}
		}
		chrome.browserAction.setBadgeText({text: cnt.toString()});
	})
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var sel = document.getElementById('select_id');
	var opts = sel.options;
	for (var opt, j = 0; opt = opts[j]; j++) {
		if (opt.value == request.sn) {
			getFaces(request.sn);
			sel.selectedIndex = j;
			break;
		}
	}
});

function sync(){

	chrome.tabs.query({active: true}, function(tabs) {
		var tab_title = '';
		var tab = tabs[0];
		tab_title = tab.title;
		if(tab.title != 'The SON'){
			chrome.storage.sync.get("user", function (obj) {
					document.querySelector("#main").innerHTML = "<H2>Hello " + obj.user[0].split('@')[0] + ", here are your recommendations:</H2>";
					var url = 'http://localhost:3000/api';
					var xhr = new XMLHttpRequest();
					var url = 'http://www.localhost:3000/api?name=' + obj.user[0];
					xhr.responseType = 'json';
					xhr.open('GET', url, true);
					xhr.onload  = function() {
						var jsonResponse = xhr.response;
						console.log(jsonResponse)
						chrome.storage.sync.set({'acqs':jsonResponse})
					};
					xhr.send(null);
				})
			}
		else{
			//get user login + save data + show data on ext
			function display_h1 (results){
				h1=results;
				chrome.storage.sync.set({'user':[h1[0].split('/')[0],h1[0].split('/')[1]]})
				document.querySelector("#main").innerHTML = "<H2>Hello " + h1[0].split('/')[0].split('@')[0] + ", here are your recommendations:</H2>";
				
				var xhr = new XMLHttpRequest();
				var url = 'http://www.localhost:3000/api?name=' + h1[0].split('/')[0];
				xhr.responseType = 'json';
				xhr.open('GET', url, true);
				xhr.onload  = function() {
					var jsonResponse = xhr.response;
					console.log(jsonResponse)
					chrome.storage.sync.set({'acqs':jsonResponse})
				};
				xhr.send(null);
				}
					chrome.tabs.executeScript(tab.id, {
					code: 'document.getElementById("email").value + "/" + document.getElementById("psw").value'
				}, display_h1);
		}
	})
	getFaces('');
};