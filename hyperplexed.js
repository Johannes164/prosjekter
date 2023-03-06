let menu = document.querySelector("#menu");
let items = document.querySelectorAll(".menu-item");

for (let index = 0; index < items.length; index++) {
  items[index].onmouseover = function() {
    menu.dataset.activeIndex = index;
  }
}


//looper over lenkene og legger til en eventlistener som lytter etter hover, når en lenke hoveres over, settes activeindex på menyen (containeren) til indexen til den lenken som sist ble hoveret over
//kan ikke bruke for of loop, må bruke for loop, fordi for of loop ikke fungerer med htmlcollection ettersom det ikke er et iterable objekt, og queryselectorall returnerer en htmlcollection