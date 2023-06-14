const toggle = document.getElementById("toggleDark&Light_Mode");
const list = toggle.querySelectorAll("svg");
const toggleButton = document.getElementById("toggleDark&Light_Mode");
theme(sessionStorage.getItem("theme"));
toggleButton.addEventListener("click", changeTheme);
function changeTheme() {
    theme(toggleButton.getAttribute('data-toggle-dark'));
}

function theme(val) {
    if (val == "dark") {
        toggle.setAttribute("data-toggle-dark", "light");
        list[0].classList.remove("hidden");
        list[1].classList.add("hidden");
        document.documentElement.classList.remove('dark');
        sessionStorage.setItem("theme", "dark");
    } else {
        toggle.setAttribute("data-toggle-dark", "dark");
        list[0].classList.add("hidden");
        list[1].classList.remove("hidden");
        document.documentElement.classList.add('dark');
        sessionStorage.setItem("theme", "light");
    }
}
