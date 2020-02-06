// THIS to be copied and associated with matches;
chrome.storage.sync.get("acqs", function (obj) {
    var li = JSON.parse(obj.acqs);
    var count=0;
    for (i in li.users){
        if(li.users[i].sn=='twitter')
            count++;
    }
    if (count>0)
        alert("Welcome to Twitter!,you have " + count + " new possible contacts!\nCheck them out in the extension!")
});
chrome.runtime.sendMessage({sn: "twitter"}, function(response) {
});