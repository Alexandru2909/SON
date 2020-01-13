window.onhashchange = function(){
    render(window.location.hash)
}

function render(hashKey){
    let pages = document.querySelectorAll(".page");
    
    // disable all
    for(let i = 0; i< pages.length; ++i) {
        pages[i].style.display = 'none';
    }

    // enable the right one
    switch(hashKey){
        case "":
            pages[0].style.display = 'block';
            break;
        case "#acquaintances":
            pages[0].style.display = 'block';
            break;
        case "#friends":
            pages[1].style.display = 'block';
            break;
        case "#links":
            pages[2].style.display = 'block';
            break;
        default:
            pages[0].style.display = 'block';
    }

}