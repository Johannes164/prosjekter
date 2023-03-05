function spillIgjen() {
    document.querySelector("#buttonContainer").innerHTML = "";

// -------------------- //
    // Kode for dører under //
    // -------------------- //
let dør1El = document.querySelector("#dør1");
let dør2El = document.querySelector("#dør2");
let dør3El = document.querySelector("#dør3");
let dører = [dør1El, dør2El, dør3El];


let vinnerIndex = Math.floor(Math.random() * 3); //random tall mellom 0 og 2
let dorer = document.querySelectorAll(".bakDør");
let helperHeaderEl = document.querySelector("#helperHeader");
helperHeaderEl.innerHTML = "Velg en dør";

for (let i = 0; i < dorer.length; i++) {
    if (i === vinnerIndex) {
        dorer[i].style.backgroundImage = "url('bil.jpg')";
        dorer[i].style.backgroundSize = "cover";
    } else {
        dorer[i].style.backgroundImage = "url('geit.jpg')";
        dorer[i].style.backgroundSize = "cover";
    }
}

    //lukker dører
    skjulDører()

function åpneDør(element) {
    element.classList.remove("lukket");
    element.classList.add("åpen");
    element.addEventListener("click", lukkeDør);
    element.removeEventListener("click", åpneDør);
}
function lukkeDør(element) {
    element.classList.remove("åpen");
    element.classList.add("lukket");
    element.addEventListener("click", åpneDør);
    element.removeEventListener("click", lukkeDør);
}

function skjulDører() {
    // setter bakgrunnene til svart midlertidig, før det settes til det det var før
    let tidligereBakgrunner = [];
    for (let dor of dorer) {
        tidligereBakgrunner.push(dor.style.backgroundImage);
        dor.style.backgroundImage = "url('svart.jpg')";
        for (let dør of dører) {
            lukkeDør(dør);
        }
        //vent 1 sekund
        setTimeout(function() {
            dor.style.backgroundImage = tidligereBakgrunner[dor.id.replace(/[^0-9]/g, "") - 1];
        }, 1000);
    }
}

      //---------------------//
      //Typewriter kode under
      //---------------------//

//promise("funksjon(resolve)") venter med å kjøre videre kode til argumentet resolve har blitt brukt i "funksjon", 
//setTimeout(resolve, ms) er en funksjon som kjører resolve etter ms millisekunder
//Dette betyr at vi har et løfte, og når vi kjører funksjonen "resolve" vil løftet bli oppfylt, her skjer dette etter "ms" millisekunder

let string = "Velkommen! To av dørene har en geit bak seg, og en har en bil. Velg en dør da vel!";
let isTyping = false;
let timeoutId;

//function that takes a string as an argument and writes it to the typewriter element one letter at a time with a delay
function typeWriter(string) {
    if (isTyping) { //setTimeout starter en funksjon om gitt antall millisekunder, men returnerer også en ID som kan brukes til å stoppe funksjonen, altså, dersom den allerede skriver, stoppes den
        clearTimeout(timeoutId);
    }
    isTyping = true;

    let i = 0;
    let typewriterEl = document.querySelector("#typewriter");
    typewriterEl.innerHTML = "";
    
    let helperEl = document.querySelector(".helper");
    let cursorEl = document.querySelector("#cursor");
    
    if (!cursorEl) {
        cursorEl = document.createElement("span");
        cursorEl.id = "cursor";
        cursorEl.innerHTML = "|";
        helperEl.appendChild(cursorEl);
    }

    
//koden under er i en funksjon sånn at setTimeout kan bruke den
    function skrivNesteBokstav() {
        if (i < string.length) { //brukte while først, men dette starter setTimeout ekstremt fort så lenge i er mindre enn string.length, som betyr at etter 100ms vil alle bokstavene skrives ut, nå skjer det bare en om gangen
            typewriterEl.innerHTML += string[i];
            i++;
            timeoutId = setTimeout(skrivNesteBokstav, 15);
        } else {
            isTyping = false;
        }
    }
    skrivNesteBokstav();
}
typeWriter(string);




// ------------------ //
// selecting av dører //
// ------------------ //

let valgtDør = null;
let dørSomErValgt


function velgDør() {
    if (valgtDør !== null) {
        valgtDør.style.opacity = "1";
    }
    valgtDør = this;
    valgtDør.style.opacity = "0.5";
    for (let dor of dorer) {
        if (dor !== this) {
          dor.removeEventListener("click", fjernValgt);
          dor.addEventListener("click", velgDør);
        }
      }
    this.removeEventListener("click", velgDør);
    this.addEventListener("click", fjernValgt);
    dørSomErValgt = valgtDør.id.replace(/[^0-9]/g, ""); 
    //dørSomErValgt = valgtDør.id gir dør1, dør2, eller dør3, .replace() tar inn en ting a, som vil bli byttet med en ting b, /[^0-9]/g betyr alt som ikke er et tall 0-9, "" er en tom streng
    string = "Du har valgt dør " + dørSomErValgt + ". Bekrefte valg?"
    helperHeaderEl.innerHTML = "Bekreft valg";
    createButton("Bekreft", buttonClicked);
    typeWriter(string);
}

function fjernValgt() {
    valgtDør.style.opacity = "1";
    valgtDør.removeEventListener("click", fjernValgt);
    valgtDør.addEventListener("click", velgDør);
    valgtDør = null;
    dørSomErValgt = null;
    string = "Du ikke lenger valgt en dør. Velg en dør.";
    helperHeaderEl.innerHTML = "Velg en dør";
    typeWriter(string);

    buttonContainerEl.innerHTML = ""; //fjerner knappen
}

for (let dor of dorer) {
    dor.addEventListener("click", velgDør);
}


      let buttonContainerEl = document.querySelector("#buttonContainer");

//For loop som finner døren som ikke er valgt, og ikke har bilen bak seg, og lagrer den i en variabel
        function finnDørMedGeit() {
            let dørMedGeit;
            for (let dor of dorer) {
                if (dor !== valgtDør && dor.style.backgroundImage !== "url(\"bil.jpg\")") {
                    dørMedGeit = dor;
                }
            }
            return dørMedGeit;
        }

        function sisteDør() {
            let sisteDør;
            for (let dor of dorer) {
                if (dor !== valgtDør && dor !== finnDørMedGeit()) {
                    sisteDør = dor;
                }
            }
            return sisteDør;
        }


      function buttonClicked() {
        string = "Du valgte dør " + dørSomErValgt + ". Dør " + finnDørMedGeit().id.replace(/[^0-9]/g, "") + " har en geit bak seg. Vil du bytte til dør " + sisteDør().id.replace(/[^0-9]/g, "") + "?";
        helperHeaderEl.innerHTML = "Bytte dør?";
        //setter opacities til 1
        for (let dor of dorer) {
            dor.style.opacity = "1";
        }
        åpneDør(dører[(finnDørMedGeit().id.replace(/[^0-9]/g, ""))-1]) //dører har bakDørene (0-2), finnDørMedGeit.id... gir 1-3, så må trekke fra 1 for å få 0-2


        typeWriter(string);
        buttonContainerEl.innerHTML = "";
        for (let dor of dorer) {
            dor.removeEventListener("click", velgDør);
            dor.removeEventListener("click", fjernValgt);
        }
        createButton("Ja", byttFunc);
        createButton("Nei", beholdFunc);
      }
      function byttFunc() {
        if (sisteDør().style.backgroundImage === "url(\"bil.jpg\")") {
            string = "Du vant! ";
            helperHeaderEl.innerHTML = "Gratulerer!";
        } else {
            string = "Du tapte. ";
            helperHeaderEl.innerHTML = "Bedre lykke neste gang.";
        }
        åpneDør(dører[(sisteDør().id.replace(/[^0-9]/g, ""))-1]) //åpner døren valgt over (-1 fordi dette teller 1-3, mens arrayet er 0-2)
        typeWriter(string);
        buttonContainerEl.innerHTML = "";
        fullFør();
      }
        function beholdFunc() {
            if (valgtDør.style.backgroundImage === "url(\"bil.jpg\")") {
                string = "Du vant! ";
                helperHeaderEl.innerHTML = "Gratulerer!";
            } else {
                string = "Du tapte. ";
                helperHeaderEl.innerHTML = "Bedre lykke neste gang.";
            }
            åpneDør(dører[(valgtDør.id.replace(/[^0-9]/g, ""))-1]) //åpner døren valgt over (-1 fordi dette teller 1-3, mens arrayet er 0-2)
            typeWriter(string);
            buttonContainerEl.innerHTML = "";
            fullFør();
        }
      function createButton(text, func) {
        if ((buttonContainerEl.querySelector("button")) && (text === "Bekreft")) {
            return;
        }
        let divEl = document.createElement("div");
        let buttonEl = document.createElement("button");
        buttonEl.textContent = text;


        buttonEl.addEventListener("click", func);


        buttonEl.style.backgroundColor = "teal";
        buttonEl.style.border = "none";
        buttonEl.style.borderRadius = "0.5em";
        buttonEl.style.color = "white";
        buttonEl.style.padding = "0.6em 1.25em";
        buttonEl.style.fontSize = "1em";
        buttonEl.style.cursor = "pointer";


        divEl.appendChild(buttonEl);


        divEl.style.display = "flex";
        divEl.style.justifyContent = "center";
        divEl.style.alignItems = "center";
        divEl.style.marginTop = "0";

        if (text === "Ja") {
            divEl.style.position = "relative";
            divEl.style.top = "-1vh";
        }
        if (text === "Nei") {
            divEl.style.position = "relative";
            divEl.style.top = "1vh";
        }

        buttonContainerEl.appendChild(divEl);
      }

        function fullFør() {
            for (let dor of dorer) { //fjerner eventlisteners
                dor.removeEventListener("click", velgDør);
                dor.removeEventListener("click", fjernValgt);
            }

            createButton("Spill igjen", spillIgjen);
        }


}

spillIgjen()