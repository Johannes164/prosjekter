    // || VARIABLER ||

let selectedRod     = null;                                         //variabel som holder styr på hvilken stolpe som er valgt, null betyr at ingen er valgt
let solveDelay      = 100;                                          //delay mellom flytting av skive, i millisekunder
let solving         = false;                                        //variabel som holder styr på om tårnet holder på å løses
let diskInputMinValue = 0;                                          //minste antall skiver som kan bygges opp
let diskInputMaxValue = 15;                                         //maks antall skiver som kan bygges opp

    //selektorer (DOM-noder/elementer)
let tooltip         = document.querySelector("#tooltip");           //tooltipen (containeren for all tooltip-innhold)
let crossbutt       = document.querySelector("#crossButt");         //knappen for å lukke og vise tooltipen
let diskInput       = document.querySelector("#diskInput");         //inputfeltet for antall skiver
let resetButton     = document.querySelector("#reset");             //resetknappen
let solveButton     = document.querySelector("#solve");             //knappen for å løse tårnet
let solveDelayInput = document.querySelector("#solveDelayInput");   //inputfeltet for delay mellom flytting av skive
let rods            = document.querySelectorAll(".rod");            //alle stolpene



    // || FUNKSJONER ||
    
function delay(ms) {                                                //funksjon som returnerer en promise som blir resolved etter ms millisekunder (pauser kodekjøring)
    return new Promise(function(resolve) {setTimeout(resolve, ms)});
}

//Viser tooltip, legger til listener for å skjule, endrer knappen til et rødt kryss
function showTooltip() {                                            //funksjon som viser tooltipen (display: block)
    tooltip.style.display = "block"; //viser tooltip
    crossbutt.removeEventListener("click",      showTooltip);
    crossbutt.addEventListener   ("click",      hideTooltip);
    crossbutt.style.backgroundColor = "red";
    crossbutt.innerHTML = "X";
}
//Skjuler tooltip, legger til listener for å vise, endrer knappen til et grønt spørsmålstegn
function hideTooltip() {                                            //funksjon som skjuler tooltipen (display: none)
    tooltip.style.display = "none"; //skjuler tooltip
    crossbutt.addEventListener   ("click",      showTooltip);
    crossbutt.removeEventListener("click",      hideTooltip);
    crossbutt.style.backgroundColor = "green";
    crossbutt.innerHTML = "?";
}

function dataDisksOnRods() {                                        //funksjon som oppretter og oppdaterer et datasett på stolpene som holder styr på hvor mange skiver de har
    for (let i = 0; i < rods.length; i++) {
        rods[i].dataset.disks = rods[i].childElementCount;
    }
}

function buildDisks(numberOfDisks) {                                //funksjon som bygger opp tårnet med numberOfDisks skiver
/*looper numberOfDisks ganger med en variabel i, og bruker den for
å lage skive nummer i, som får styling skalert etter i, for eksempel
er bredden til "disk i" satt til 600% minus widthIncrement*i     */
    let widthIncrement = 500 / numberOfDisks; //Hvor mye bredden skal synke for hver skive
    for (let i = 0; i < numberOfDisks; i++) {
        //lager div med klasser og id
        let disk = document.createElement("div");
        disk.classList.add("disk");
        disk.classList.add("clickable");
        disk.id = "disk" + (i + 1);

        let hueShiftInterval = 10; //Hvor mye fargen skal endres for hver skive
        let hueShift = 180 + (i * hueShiftInterval); //Hvor mye fargen skal endres for denne skiven
        let diskColor = "hsl(" + hueShift + ", 85%, 40%)"; //Fargen på skiven, sjekk ut https://www.w3.org/wiki/CSS/Properties/color/HSL viss det er forvirrende. 
        //Første verdi er bevegelse på fargehjulet, andre er hvor mye farge det er, tredje er hvor lys den er
        let shadowColor = "hsl(" + (hueShift + hueShiftInterval/2) + ", 50%, 25%)"; //Fargen på skyggen til skiven, en mørkere og mindre farget versjon av skivens farge
        
        disk.style.width = 600 - widthIncrement * i + "%"; //Setter bredden til skiven
        disk.style.height = "10%"; //Alle skivene har høyde lik 10% av stolpens høyde
        disk.style.backgroundColor = diskColor; //Setter bakgrunnsfargen til skiven
        disk.style.boxShadow = "0 var(--disk-3d-shadow-height) 0 " + shadowColor; //Setter 3d-skyggen til skiven, variabelen er definert i css for å lett kunne endre dens størrelse
        // Løfter skiven oppover med halvparten av base sin skyggehøyde + 10% av stolpens høyde(størrelsen til en skive) + 0.5*skyggehøyde (3d skyggen til skivene) for hver skive
        // Plasserer altså en skive på toppen av sist lagde skive
        disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (i * 10) + "% - " + (i * 0.5) + "*var(--disk-3d-shadow-height))"; 
        disk.style.zIndex = i + 2; //arrangerer skivenes z-indeks i stigende rekkefølge, +2 fordi base og rod1 har z-indeks 1 og 0
        
        rods[0].appendChild(disk); //Legger til skiven i rod1
    }
    dataDisksOnRods(); //oppdaterer data attributtene til stolpene
}

function moveDisk(disk, rod) {                                    //Flyttefunksjon som flytter skive "disk" til stolpe "rod" | brukes når brukeren flytter skiver
    rod.appendChild(disk); //flytter skiven til rod
    /*endrer bottom-verdien til skiven (samme mønster som når skivene lages, 
    men i buildDisks() holder variabelen "i" styr på hvor mange skiver som
    kommer under skiven som skal til toppen, mens her bruker vi datasettet)*/
    disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (rod.dataset.disks * 10) + "% - " + (rod.dataset.disks * 0.5) + "*var(--disk-3d-shadow-height))"; 
    dataDisksOnRods(); //passer på at data attributtene fremdeles stemmer
}
function moveDisk2(rodFrom, rodTo) {                             //Flyttefunksjon som flytter skive fra "rodFrom" til "rodTo" | brukes når solveH() flytter skiver
    //funker likt som moveDisk, ettersom "rodFrom" parameteren konverteres til "disk"
    let disk = rodFrom.lastChild;
    rodTo.appendChild(disk);
    disk.style.bottom = "calc(-0.5*var(--base-3d-shadow-height) + " + (rodTo.dataset.disks * 10) + "% - " + (rodTo.dataset.disks * 0.5) + "*var(--disk-3d-shadow-height))";
    dataDisksOnRods();
}

function checkInput() {                                         //funksjon som viser feilmelding popup viss input er ugyldig
    if (isNaN(diskInput.value) || diskInput.value < diskInputMinValue || diskInput.value > diskInputMaxValue) { //sjekker om input er et tall mellom diskInputMinValue og diskInputMaxValue
        let errorMessage = document.createElement("span"); //lager en span med klasse "error-message" og tekst
        errorMessage.classList.add("error-message");
        errorMessage.innerHTML = "Ugyldig input <br> skriv et tall fra " + diskInputMinValue + " til " + diskInputMaxValue + " <br>";
    
        let count = 5; //teller ned fra count til 0
        let countdown = document.createElement("span"); //lager en span med id "countdown" og tekst som oppdateres hvert sekund
        countdown.id = "countdown";
        countdown.innerHTML = count;
        errorMessage.appendChild(countdown); //legger til countdown i errorMessage
        
        document.body.appendChild(errorMessage); //legger errorMessage til på siden
        
        // Oppdaterer nedtellingen hvert sekund (countdown)
        let countdownInterval = setInterval(function() { //setInterval gjentar en funksjon hvert x millisekund, her gjentas den til count er 0
            count--;
            countdown.innerHTML = count;
          if (count === 0) {
            clearInterval(countdownInterval); //forteller setInterval at den ikke skal gjenta funksjonen lenger
            errorMessage.remove(); //fjerner feilmeldingen
          }
        }, 1000);
        
        // Fjerner det ugyldige tallet
        diskInput.value = diskInput.defaultValue;
        resetDisks(); //tilbakestiller tårnet til opprinnelig tilstand
        return //trengte dette tidligere pga nesting, beholder det for sikkerhets skyld
      }
    }

//Kode som resetter skivene
function resetDisks() {                                         //funksjon som resetter tårnet til opprinnelig tilstand og sjekker om input er gyldig (brukes bl.a til reset knapp)
    if (solving) { //hvis tårnet holder på å løses, lar vi ikke brukeren resette tårnet
        return;
    }
    for (let i = 0; i < rods.length; i++) {
        rods[i].innerHTML = "";
    }
    buildDisks(diskInput.value);
    checkInput(); //resetDisks funksjonen kalles også ved input, så vi sjekker om input er gyldig
    solveButton.addEventListener("click", solveDisks); //legger til eventlisteneren for solve knappen i tilfelle den er fjernet av solve knappen (kode rett under)
    solveButton.innerHTML = "Solve"; //endrer teksten på knappen tilbake til "Solve"
}

function solveDisks() {                                //funksjon som løser tårnet når brukeren trykker på "solve" knappen (brukes til solve knapp)
    resetDisks();
    if (rods[0].dataset.disks > 1) { //hvis antall skiver er over 1, løser den normalt
        solveH(rods[0].dataset.disks, rods[0], rods[2], rods[1]);
        //fjern funksjonen for å legge den til igjen når den er ferdig
        solveButton.removeEventListener("click", solveDisks); //fjerner eventlisteneren for å hindre at brukeren trykker på knappen flere ganger, den legges til igjen når solveH er ferdig
        for (let i = 0; i < rods.length; i++) { //fjerner clickable klassen fra alle stolpene
        rods[i].classList.remove("clickable")
        }
        solveButton.innerHTML = "Solving..."; //endrer teksten på knappen til "Solving..."
        solving = true; //setter solving til true sånn at reset kan stoppe solveH
    } else if (rods[0].dataset.disks == 1) { //hvis antall skiver er 1, flytter den bare skiven til stolpe 3 (av en eller annnen grunn funker ikke solveH med 1 skive)
        moveDisk2(rods[0], rods[2]);
    }
}

function updateSolveDelay() {                                   //funksjon som oppdaterer solveDelay fortløpende
    solveDelay = solveDelayInput.value;
}

async function solveH(n, from, to, extra) {                     //rekursiv funksjon som løser hanoi-tårnet for n skiver, se prototype (i arbeidsprosess mappen) for mer info, eneste
    //forskjeller er at denne funksjonen er asynkron (for delay), at den faktisk flytter på skiver, og at den gir solveButton tilbake eventlistener etter den er ferdig
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

        if (rods[2].dataset.disks === n) { //viss tredje stolpe har n skiver, er tårnet løst, så vi gir solveButton tilbake eventlistener
            solveButton.addEventListener("click", solveDisks);
            rods[2].classList.add("clickable"); //gir tredje stolpe clickable klassen
            solveButton.innerHTML = "Solve";
            solving = false;
        }
    }
}

function clickableRods() {                                      //funksjon som gir stolpene som har skiver clickable og fjerner clickable fra stolpene som ikke har skiver
    for (let i = 0; i < rods.length; i++) {
        if (rods[i].dataset.disks > 0) {
            rods[i].classList.add("clickable");
        }
        else {
            rods[i].classList.remove("clickable");
        }
    }
}

function selectrod(rod) {                                       //funksjon som lar brukeren velge en stolpe som skal flyttes fra og en stolpe som skal flyttes til (selectedRod er den som allerede er valgt, altså forrige valg, rod er den du tryker)
    if (solving === true || (!rod.lastChild && selectedRod == null)) { //viss tårnet holder på å løses, eller viss det er første gang du trykker samt at du trykker på en tom stolpe returner vi tidlig for å hindre feil
        return;
    }
    if (selectedRod === rod) { //viss du trykker på samme stolpe (rod parameteren settes alltid til stolpen du trykker på (se på eventlisteneren))
        selectedRod.dataset.selected = "false"; //setter selected til false
        selectedRod.lastChild.classList.remove("selected-disk"); //fjerner klassen selected-disk fra den øverste skiven (styling som viser at den er valgt)
        selectedRod = null; //setter selectedRod til null
        clickableRods(); //oppdaterer hvilkne stolper som er clickable
    }
    else if (selectedRod === null) { //viss du trykker på en stolpe uten å ha valgt en annen først
        rod.dataset.selected = "true"; //setter selected til true
        selectedRod = rod; //setter selectedRod til stolpen du trykket på for å vise at en stolpe er valgt
        rod.lastChild.classList.add("selected-disk");  //legger til klassen selected-disk på den øverste skiven (styling som viser at den er valgt)
        for (let i = 0; i < rods.length; i++) { // gir alle stolpene clickable (for å vise at de kan flyttes til, og at den som allerede er valgt kan deselectes)
            rods[i].classList.add("clickable");
            //fjerner clickable dersom stolpens øverste skive er mindre enn den valgte skiven
            if (rods[i].lastChild && parseInt(rods[i].lastChild.style.width) < parseInt(rod.lastChild.style.width)) {
                rods[i].classList.remove("clickable");
            }
        }
    }
    else { //viss du trykker på en stolpe etter å ha valgt en annen først
        let selectedDisk = selectedRod.lastChild; //henter ut siste barnet til rod, som er den øverste skiven, husk at selectedRod er den første valgte, siden selectedRod ikke har blitt oppdatert enda
        if (rod.lastChild === null || parseInt(selectedDisk.style.width) < parseInt(rod.lastChild.style.width)) {  //sjekker om trekket er lovlig, viss det er lovlig flyttes skiven og stolpene som kan klikkes får clickable
            selectedRod.lastChild.classList.remove("selected-disk");
            moveDisk(selectedDisk, rod);
            selectedRod.dataset.selected = "false";
            selectedRod = null;
            clickableRods(); //oppdaterer hvilkne stolper som er clickable
         }
    }
}


    
    // || eventlisteners ||

resetButton     .addEventListener("click", resetDisks       );  //legger til eventlistener på reset knappen             som kjører resetDisks       når den blir trykket på
diskInput       .addEventListener("input", resetDisks       );  //legger til eventlistener på diskInput feltet          som kjører resetDisks       når den blir endret
solveDelayInput .addEventListener("input", updateSolveDelay );  //legger til eventlistener på solveDelayInput feltet    som kjører updateSolveDelay når den blir endret
solveButton     .addEventListener("click", solveDisks       );  //legger til eventlistener på solve knappen             som kjører solveDisks når den blir trykket på

for (let i = 0; i < rods.length; i++) {                         //Legger til eventlisteners til rods med løkke (kan ikke bruke for of fordi det teknisk sett ikke er et array men en NodeList)
    rods[i].addEventListener("click", function() { selectrod(rods[i]) }); //selectrod er inni en funksjon for å kunne bruke argument i den, her betyr det at rod parameteren settes til stolpen som klikkes
}



// || Initiering ||

buildDisks(diskInput.value); //bygger opp skivene
hideTooltip(); //skjuler tooltipen og legger til eventlistener på knappen for å vise den igjen