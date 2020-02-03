// set number of notifs
chrome.browserAction.setBadgeText({text: "1"});
document.getElementById('buton').onclick=function(){
    chrome.browserAction.setBadgeText({text: "10+"});
};

//get user login + save data + show data on ext
var tab_title = '';
function display_h1 (results){
  h1=results;
  chrome.storage.sync.set({'user':[h1[0].split('/')[0],h1[0].split('/')[1]]})
  chrome.storage.sync.get(['user'],function(obj){
    document.querySelector("#id1").innerHTML = "<p>dom h1: " + obj.user[0] + "</p>";
  })
  // document.querySelector("#id1").innerHTML = "<p>tab title: " + tab_title + "</p><p>dom h1: " + h1[0].split('/')[0] + "</p>";
}
chrome.tabs.query({active: true}, function(tabs) {
  var tab = tabs[0];
  tab_title = tab.title;
  if(tab.title == 'The SON')
    chrome.tabs.executeScript(tab.id, {
      code: 'document.getElementById("email").value + "/" + document.getElementById("psw").value'
    }, display_h1);
});