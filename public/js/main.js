import { initAboutPage } from "./about.js";
import { initProjectsPage } from "./projects.js";

const page = document.body.dataset.page;
console.log("page:", page)

if (page === "about") {
  initAboutPage();
}

if (page === "projects") {
  initProjectsPage();
}

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

