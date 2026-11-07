// Menu-button script 
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");

function menuOpen(open) {
    nav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "✕" : "☰" ;
}

// Open menu
menuButton.addEventListener("click", () => {
    menuOpen(!nav.classList.contains("is-open"));
});
