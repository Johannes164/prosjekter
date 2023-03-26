//Selektorer
let rods = document.querySelectorAll(".rod");
let diskInput = document.querySelector("#diskInput");
let resetButton = document.querySelector("#reset");
let solveButton = document.querySelector("#solve");
let solveDelayInput = document.querySelector("#solveDelayInput");
    
let solveDelay = 100; //hvor lang tid det skal være mellom hver flytting av skiven, i millisekunder

function delay(ms) { //funksjon som returnerer en promise som blir resolved etter ms millisekunder (brukes i async funksjoner for å vente med å fortsette kodekjøringen)
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function solveH(n, from, to, extra) { //rekursiv funksjon som løser hanoi-tårnet for n skiver
    if (n === 1) {
        await delay(solveDelay);
        moveDisk2(from, to); //avslutter rekursjonen, flytter første skive, funksjonen moveDisk er defineret lenger ned
    } else {
        //viss vi ikke har brytt det ned til lovlig trekk med 1 skive, flytter vi alle utenom den siste til ekstrastolpen
        await solveH(n - 1, from, extra, to); 
        await delay(solveDelay);
        moveDisk2(from, to); //flytter ned nederste skiven etter n-1 skiver er flyttet til ekstrastolpen
        //nå er alle utenom den siste flyttet til ekstrastolpen, (den siste er flyttet til målstolpen), her flytter vi skivene
        //fra ekstrastolpen til målstolpen:
        await solveH(n - 1, extra, to, from); 
    }
}
    

// Kode for å bygge disker

function buildDisks(numberOfDisks) {
  // Vis errormelding dersom input ikke er et tall fra 0 til 9, stylingen er i css
  if (isNaN(numberOfDisks) || numberOfDisks < 0 || numberOfDisks > 9) {
    let errorMessage = document.createElement("span");
    errorMessage.classList.add("error-message");
    errorMessage.innerHTML = "Ugyldig input <br> skriv et tall fra 0 til 9 <br>";

    let count = 5;
    let countdown = document.createElement("span");
    countdown.id = "countdown";
    countdown.innerHTML = count;
    errorMessage.appendChild(countdown);
    
    diskInput.parentElement.appendChild(errorMessage);
    
    // Oppdaterer nedtellingen hvert sekund (countdown)
    let countdownInterval = setInterval(() => { //setInterval gjentar en funksjon hvert x millisekund, her gjentas den til count er 0
        count--;
        countdown.innerHTML = count;
      if (count === 0) {
        clearInterval(countdownInterval); //forteller setInterval at den ikke skal gjenta funksjonen lenger
        errorMessage.remove(); //fjerner feilmeldingen
      }
    }, 1000);
    
    // Fjerner det ugyldige tallet
    diskInput.value = diskInput.defaultValue;
    resetDisks();
    return
  }
    else {
    let widthIncrement = 500 / numberOfDisks; //Hvor mye bredden skal synke for hver skive
    for (let i = 0; i < numberOfDisks; i++) {
        let disk = document.createElement("div");
        disk.classList.add("disk");
        disk.id = "disk" + (i + 1);

        let hueShiftInterval = 10; //Hvor mye fargen skal endres for hver skive
        let hueShift = 180 + (i * hueShiftInterval); //Hvor mye fargen skal endres for denne skiven
        let diskColor = "hsl(" + hueShift + ", 85%, 40%)"; //Fargen på skiven, sjekk ut https://www.w3.org/wiki/CSS/Properties/color/HSL viss det er forvirrende. Første verdi er bevegelse på fargehjulet, andre er hvor mye farge det er, tredje er hvor lys den er
        let shadowColor = "hsl(" + (hueShift + hueShiftInterval/2) + ", 50%, 25%)"; //Fargen på skyggen til skiven
        
        disk.style.width = 600 - widthIncrement * i + "%";
        disk.style.height = "10%";
        disk.style.backgroundColor = diskColor;
        disk.style.boxShadow = "0 var(--disk-3d-shadow-height) 0 " + shadowColor;
        disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (i * 10) + "% - " + (i * 0.5) + "*var(--disk-3d-shadow-height))";
        disk.style.zIndex = i + 2;
        
        document.querySelector("#rod1").appendChild(disk);
    }
    updateDisksOnRods();

}
}

buildDisks(4);

function updateDisksOnRods() { //data-attributt som holder styr på hvor mange skiver som er på hver stolpe
    for (let i = 0; i < rods.length; i++) {
        rods[i].dataset.disks = rods[i].childElementCount;
    }
}
//kode som holder styr på hvilken stolpe som er valgt, trykker du på valgt stolpe deselectes den, trykker du på en annen stolpe flyttes den valgte skiven dit, bruk av dataset selected
let selectedRod = null;
function selectrod(rod) {
    if (selectedRod === rod) { //viss du trykker på samme stolpe
        selectedRod.dataset.selected = "false";
        selectedRod.lastChild.classList.remove("selected-disk");
        selectedRod = null;
    }
    else if (selectedRod === null) { //viss du trykker på en stolpe uten å ha valgt en annen først
        rod.dataset.selected = "true";
        selectedRod = rod;
        rod.lastChild.classList.add("selected-disk");
    }
    else { //viss du trykker på en stolpe etter å ha valgt en annen først
        let selectedDisk = selectedRod.lastChild; //henter ut siste barnet til rod, som er den øverste skiven, husk at selectedRod er den første valgte, siden selectedRod ikke har blitt oppdatert enda
        if (rod.lastChild === null || parseInt(selectedDisk.id.slice(4)) > parseInt(rod.lastChild.id.slice(4))) { 
            selectedRod.lastChild.classList.remove("selected-disk");
            moveDisk(selectedDisk, rod);
            selectedRod.dataset.selected = "false";
            selectedRod = null;
         }
    }
}

function moveDisk(disk, rod) {
    rod.appendChild(disk); //flytter skiven til rod
    //endrer bottom-verdien til skiven (samme mønster som når skivene lages, men datasettet holder styr på antallet i stedet for i)
    disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (rod.dataset.disks * 10) + "% - " + (rod.dataset.disks * 0.5) + "*var(--disk-3d-shadow-height))"; 
    updateDisksOnRods();
}
function moveDisk2(rodFrom, rodTo) { //solveH tar inn stolper som argumenter, så dette er en versjon som bruker det i stedet for en skive og en stolpe som argument
    let disk = rodFrom.lastChild;
    rodTo.appendChild(disk);
    disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (rodTo.dataset.disks * 10) + "% - " + (rodTo.dataset.disks * 0.5) + "*var(--disk-3d-shadow-height))";
    updateDisksOnRods();
}
    

//Legger til eventlisteners med løkke (kan ikke bruke for of fordi det teknisk sett ikke er et array men en NodeList)

for (let i = 0; i < rods.length; i++) {
    rods[i].addEventListener("click", function() { selectrod(rods[i]) }); //selectrod er inni en funksjon for å kunne bruke argument i den
}


//Kode som resetter skivene
function resetDisks() {
    for (let i = 0; i < rods.length; i++) {
        rods[i].innerHTML = "";
    }
    buildDisks(diskInput.value);
}

resetButton.addEventListener("click", resetDisks);

diskInput.addEventListener("input", resetDisks);

solveButton.addEventListener("click", function() { //løser tårnet med 3 stolper
    resetDisks();
    solveH(rods[0].dataset.disks, rods[0], rods[2], rods[1]);
    //fjern funksjonen for å legge den til igjen når den er ferdig
    solveButton.removeEventListener();
});

//funksjon som oppdaterer solveDelay
function updateSolveDelay() {
    solveDelay = solveDelayInput.value;
}

solveDelayInput.addEventListener("input", updateSolveDelay);


let tooltip = document.querySelector("#tooltip");
crossbutt = document.querySelector("#crossButt");

function showTooltip() {
    tooltip.style.display = "block";
    crossbutt.removeEventListener("click", showTooltip);
    crossbutt.removeEventListener("touchstart", showTooltip);
    crossbutt.addEventListener("click", hideTooltip);
    crossbutt.addEventListener("touchstart", hideTooltip);
    crossbutt.style.backgroundColor = "red";
    crossbutt.innerHTML = "X";
}
function hideTooltip() {
    tooltip.style.display = "none";
    crossbutt.addEventListener("click", showTooltip);
    crossbutt.addEventListener("touchstart", showTooltip);
    crossbutt.removeEventListener("click", hideTooltip);
    crossbutt.removeEventListener("touchstart", hideTooltip);
    crossbutt.style.backgroundColor = "green";
    crossbutt.innerHTML = "?";
}

crossbutt.addEventListener("click", hideTooltip);
hideTooltip();