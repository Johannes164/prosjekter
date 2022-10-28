const navbar = document.querySelector(".nav");
const hamburger = document.querySelector(".burgerContainer");

hamburger.addEventListener("click", () => {
  navbar.classList.toggle("change");
  hamburger.classList.toggle("change");
});

//window.addEventListener("resize", () => {
//  if(navbar.classList.contains("change"))
//    navbar.classList.remove("change");
//  if(hamburger.classList.contains("change"))
//    hamburger.classList.remove("change");
//});