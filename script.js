
const playBtns = document.querySelectorAll('.playPauseBtn');
const navBtns = document.querySelectorAll('.navItem, .navItem2');


playBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
        id = this.querySelectorAll("Img")[0].id;
        togglePPIcon(id);
    });
});

navBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
        
        var current = document.getElementsByClassName("sideBarActive");
        current[0].className = current[0].className.replace(" sideBarActive", "");
        this.className += " sideBarActive";

        route(this.id);
    });
});


function togglePPIcon(id) {
    var img = document.getElementById(id).src;
    if (img.indexOf('assets/ic_play.svg') != -1) {
        document.getElementById(id).src = 'assets/ic_pause.svg';
    }
    else {
        document.getElementById(id).src = 'assets/ic_play.svg';
    }
}

function route(id) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("content").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "pages/" + id + ".txt", true);
    xhttp.send();
}