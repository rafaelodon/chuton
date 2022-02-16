// Initial empty word dictionary
var words = {
    selected : [],
    index : {}
}

// Random letters on the loading animation cubes
var loadAnimation = () => {
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let cubes = document.getElementsByClassName("cube");
    for(let c in cubes){
        let char = letters.charAt(Math.floor(Math.random()*letters.length));
        cubes[c].innerText = char;
        letters.replace(char,'');
    }
    setTimeout(loadAnimation, 270);
}

// The game only starts after the 5 letters dictionary JSON is loaded
var loadGame = () => {    
    console.log("Aguardando o dicionário de palavras ser carregado..");
    loadAnimation();
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if(xhr.status == 200){
                words = JSON.parse(xhr.responseText);
                var chuton = new ChutOn(words);
                console.log("Pronto!");
            }else{
                notification.show("Erro tentando carregar o dicionário de palavras.", -1)
            }
        }
    }
    xhr.open("GET", "js/words.json");
    xhr.send();
}

window.onload = () => {
    loadGame();
}