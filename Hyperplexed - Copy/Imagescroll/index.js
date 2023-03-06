let trackEl = document.querySelector("#image-track");

//htmlElement.dataset setter data-attributt, her setter vi mouseDownAt til musens x-posisjon
//Her har vi det i en funksjon som kjøres når musen trykkes ned, verdien oppdateres altså hver gang musen trykkes ned
function handleOnDown(e) {
    trackEl.dataset.mouseDownAt = e.clientX; 
}

function handleOnUp() {
    trackEl.dataset.mouseDownAt = "0"; //når musen slippes, settes mouseDownAt til 0, sånn at onmousemove funksjonen utløser return før den beveger track
    trackEl.dataset.prevPercentage = trackEl.dataset.percentage; //når musen slippes, lagrer vi prosenten tracken skal beveges til i prevPercentage
    //I onmousemove skjer dette konstant, vi setter derfor den faktiske verdien på onmouseup
}

function handleOnMove(e) {
    if (trackEl.dataset.mouseDownAt === "0") return;

    let mouseDelta = parseFloat(trackEl.dataset.mouseDownAt) - e.clientX; //delta musebevegelse etter/under bevegelsen vil være posisjonen den ble trykket ned på minus x-koordinat den er på nå
    let maxDelta = window.innerWidth / 2; //etter å ha dratt over halve skjermens bredde er vi på andre side

    let percentage = (mouseDelta / maxDelta) * -100; //avstanden vi har dratt delt på maxDelta fordi da skaleres avstanden til gitt sensitivitet, ganger med 100 for å få prosent i stedet for desimal
    let nextPercentageUnconstrained = parseFloat(trackEl.dataset.prevPercentage) + percentage; //neste prosent er forrige prosent + prosenten vi har dratt (ubegrenset drag, settes til mousdown prosent + prosenten vi har dratt)
    let nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100); 
    //velger minsteverdi av 100 og nextPercentageUnconstrained, så velger den den største av denne verdien og 0, altså, nextPercentage settes kun til nextPercentageUnconstrained hvis den er mellom 0 og 100

    trackEl.dataset.percentage = nextPercentage; //lagrer prosenten tracken skal beveges til for å bruke den i onmouseup listeneren (tracker progressen til slideren)

    //lager basically slider som flytter over hele tracken, sliderens bredde er halve skjermen, og percentage lagrer hvor mange prosent av slideren som er flyttet
    trackEl.animate({
        transform: "translate(" + nextPercentage + "%, -50%)"
    }, { duration: 1200, fill: "forwards" });

    for (let image of trackEl.querySelectorAll(".image")) {
        image.animate({
            objectPosition: nextPercentage+100 + "% center" //nextPercentage går fra -100 til 0, så vi må legge til 100 for å få det til å gå fra 0 til 100
        }, { duration: 1200, fill: "forwards" });
    }
}

/* Brukte funksjoner i stedet for window.onmousedown etc (listeners) for å kunne calle de via touch i tilleg til mus */

window.onmousedown = function(e) { //når musen trykkes ned
    handleOnDown(e);
}

window.ontouchstart = function(e) { //når fingeren trykkes ned
    handleOnDown(e.touches[0]); //event.touches er en liste med alle fingrene som er på skjermen, vi bruker bare den første
}

window.onmouseup = function() { //når musen slippes
    handleOnUp();
}

window.ontouchend = function() { //når fingeren slippes
    handleOnUp();
}

window.onmousemove = function(e) { //når musen beveges
    handleOnMove(e);
}

window.ontouchmove = function(e) { //når fingeren beveges
    handleOnMove(e.touches[0]); //event.touches er en liste med alle fingrene som er på skjermen, vi bruker bare den første
}