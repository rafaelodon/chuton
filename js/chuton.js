class ChutOn {    

    constructor() {
        console.log("Iniciando ChutOn...")
        this.data = ChutOnData.loadGameData();
        this.game = this.createOrContinueGame();
        this.hideLoading();
        this.preRender();
        this.bindEvents();
        this.doUpdateGuess(this.data.guess);
        this.practiceMode = false;
    }

    createOrContinueGame() {
        let dayIndex = calculateDayIndex();
        if (this.data.index != dayIndex) {
            notification.show("Começando um novo jogo!");
            ChutOnData.clearData();
            this.data = ChutOnData.loadGameData();
            this.data.index = dayIndex;
            ChutOnData.saveGameData(this.data);
        }

        let game = new ChutOnCore(words.selected[dayIndex]);
        game.guesses = this.data.guesses;
        game.gameState = this.data.state;
        game.charsState = this.data.keys;
        return game;
    }

    doUpdateGuess(value) {
        if (this.game.gameState == ChutOnCore.STATE_PLAYING) {
            if (value == undefined) {
                value = "";
            }
            preSanitize(value);
            this.data.guess = value;
            guessInput.value = value;
            if(!this.practiceMode){
                ChutOnData.saveGameData(this.data);
            }
            this.render();
        }
    }

    preRender() {
        this.renderGuesses("display");
        this.renderResult("message");
        this.renderKeys("keys");
        this.render();
    }

    renderGuesses(elementId) {
        let display = document.getElementById(elementId);
        for (let i = 0; i < 6; i++) {

            let line = document.createElement("div");
            line.setAttribute('class', 'line');
            line.setAttribute('id', 'line_' + i);
            display.appendChild(line);

            for (let j = 0; j < 5; j++) {
                let cell = document.createElement("div");
                cell.setAttribute('id', 'cell_' + i + "_" + j);
                cell.setAttribute('class', 'cell');
                cell.innerHTML = "&nbsp;";
                line.appendChild(cell);
            }
        }
    }

    renderKeys(elementId) {
        let keys = document.getElementById(elementId);
        let lines = ["QWERTYUIOP", "ASDFGHJKL", "+ZXCVBNM-"]
        for (let l in lines) {
            let keyline = document.createElement("div");
            keyline.setAttribute('class', 'line');
            keyline.setAttribute('id', 'keyline_' + l);
            keys.appendChild(keyline);
            for (let k in lines[l]) {
                let lc = lines[l][k];
                let key = document.createElement("div");
                if (lc == "-") {
                    key.innerText = "⌫";
                    key.setAttribute('class', 'key backspace');
                    key.setAttribute('id', 'key_backspace');
                } else if (lc == "+") {
                    key.innerText = "Enter";
                    key.setAttribute('class', 'key enter');
                    key.setAttribute('id', 'key_enter');

                } else {
                    key.setAttribute('id', 'key_' + lc);
                    key.setAttribute('class', 'key');
                    key.innerText = lc;
                }
                keyline.appendChild(key);
            }
        }
    }

    render() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                let cell = document.getElementById('cell_' + i + '_' + j);
                cell.setAttribute('class', 'cell');
                cell.innerHTML = "&nbsp;";
                if (i < this.data.guesses.length) {
                    let character = this.data.guesses[i].guess[j];
                    let cellState = this.data.guesses[i].feedback[j];
                    let keyState = this.data.keys[sanitize(character)];
                    cell.innerText = character;
                    cell.setAttribute('class', 'cell ' + cellState);
                    document.getElementById("key_" + sanitize(character).toUpperCase()).setAttribute('class', 'key ' + keyState);
                } else if (i == this.data.guesses.length && this.game.gameState == ChutOnCore.STATE_PLAYING) {
                    if (j < this.data.guess.length) {
                        cell.innerText = this.data.guess[j];
                    }
                } else {
                    cell.setAttribute('class', 'cell disabled');
                }
            }
        }
        this.renderResult("message");
    }

    renderResult(elementId) {
        if(!this.practiceMode){
            if (this.game.gameState != ChutOnCore.STATE_PLAYING) {
                let result = document.getElementById(elementId);
                result.className = "visible";
                result.style.opacity = 1.0;

                let answer = result.getElementsByClassName("answer")[0];
                answer.innerHTML = "<a target='_blank' href='https://www.dicio.com.br/" + this.game.answer + "'>" + this.game.answer + "</a>"
            }
        }
    }

    bindEvents() {
        this.bindGuessInput("guessInput");
        this.bindHelpButton("helpButton");
        this.bindScoreButton("scoreButton");
        this.bindResetButton("resetButton");
        this.bindShareButton("share");
        this.bindKeys();
    }

    bindGuessInput(elementId) {

        let guessInput = document.getElementById(elementId);

        let that = this;

        let onBlurGuessInput = function (e) {
            setTimeout(function () {
                guessInput.focus();
            }, 10);
        }

        let onKeyUpGuessInput = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                that.onClickEnter();
            } else {
                that.doUpdateGuess(guessInput.value);
            }
        }

        if (!isMobile()) {
            guessInput.onblur = onBlurGuessInput;
            guessInput.onkeyup = onKeyUpGuessInput;
            guessInput.focus();
        }
    }

    bindHelpButton(elementId) {

        let helpButton = document.getElementById(elementId);

        let onClickHelpButton = function () {
            let helpContent = document.getElementById("help").innerHTML;
            modal.show("Ajuda", helpContent, "Ok", function () {
                modal.hide();
            });
        }

        helpButton.onclick = onClickHelpButton;
    }

    bindScoreButton(elementId) {

        let scoreButton = document.getElementById(elementId);

        let onClickScoreButton = function () {
            let stats = ChutOnData.loadGameStats();

            let total = stats.count.total;
            let lost = stats.count.lost;
            let lost_perc = Math.floor(lost / total * 100);
            let wins = stats.count.win1 + stats.count.win2 + stats.count.win3 +
                stats.count.win4 + stats.count.win5 + stats.count.win6;
            let win_perc = Math.floor(wins / total * 100);

            document.getElementById("score-total").innerText = "" + total + " jogos";
            document.getElementById("score-wins").innerText = "" + wins + " vitórias (" + win_perc + "%)";

            for (let c = 1; c <= 6; c++) {
                let num = stats.count["win" + c];
                let perc = Math.floor(num / total * 100);
                let el = document.getElementById("score-win" + c).getElementsByClassName("bar")[0];
                el.style.height = "" + (100 - perc) + "%";
            }

            let el = document.getElementById("score-lost").getElementsByClassName("bar")[0];
            el.style.height = "" + (100 - lost_perc) + "%";

            let scoreContent = document.getElementById("score").innerHTML;
            modal.show("Placar", scoreContent, "Ok", function () {
                modal.hide();
            })
        }

        scoreButton.onclick = onClickScoreButton;
    }

    bindResetButton(elementId) {

        let resetButton = document.getElementById(elementId);

        resetButton.onclick = () => {
            console.log("uai")
            //Hard reset
            //ChutOnData.clearData();            
            //window.location.href = window.location.href;
            //window.location.reload();

            //Soft reset (practice with a sample word)
            modal.show("Praticar","Você vai praticar com uma nova palavra aleatória.<br/><br/>"+
                "Ao fechar a janela o treino será perdido e será retomado o jogo do dia.","Ok", () => {
                modal.hide();
                this.practiceMode = true;
                let index = Math.floor(Math.random() * words.selected.length);
                this.game = new ChutOnCore(words.selected[index]);
                this.data.guesses = [];
                this.data.index = index;
                this.data.keys = {};                
                this.data.state = this.game.gameState;
                this.doUpdateGuess("");
                this.render();
                document.getElementById("result").style.display = "none";
                document.getElementById("practice").style.display = "block";
            })                        
        }
    }

    bindShareButton(elementId) {
        let shareButton = document.getElementById(elementId);
        let stats = ChutOnData.loadGameStats();        
        shareButton.onclick = () => {
            let text = "";
            if(!this.practiceMode && this.gameState != ChutOnCore.STATE_PLAYING){
                let text = "Joguei ChutOn #" + stats.count.total + "\n\n";
                for (let i = 0; i < 6; i++) {
                    text += this.data.guesses[i].feedback
                        .replaceAll('X', '🟥 ')
                        .replaceAll("V", '🟩 ')
                        .replaceAll("P", '🟨 ')
                        + "\n";
                }
            }else{
                text = "Jogue ChuTon!";
            }
            text += "\nhttp://rafaelodon.github.io/chuton";
            navigator.clipboard.writeText(text);
            notification.show("Copiado! Compartilhe com CTRL+V (Colar).")            
        }
    }

    bindKeys() {
        let keyEnter = document.getElementById("key_enter")
        keyEnter.addEventListener('click', () => this.onClickEnter());

        let keyBackspace = document.getElementById("key_backspace")
        keyBackspace.addEventListener('click', () => this.onClickBackSpace());

        let keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let k in keys) {
            let key = document.getElementById("key_" + keys[k]);
            key.addEventListener('click', () => this.emulateTyping(keys[k]));
        }
    }

    emulateTyping(t) {
        if (this.data.guess.length < 5) {
            this.doUpdateGuess(this.data.guess + t);
        }
    }

    onClickBackSpace = function (t) {
        let gv = this.data.guess;
        if (gv.length > 0) {
            gv = gv.substr(0, gv.length - 1);
        }
        this.doUpdateGuess(gv);
    }

    onClickEnter() {
        try {
            this.game.try2guess(this.data.guess,
                (success) => {
                    this.endGame(success);
                    this.congratulate(this.data.guesses.length);
                    this.render();
                },
                (fail) => {
                    this.data.guesses = fail.guesses;
                    this.data.state = fail.state;
                    this.doUpdateGuess("");
                    this.render();
                },
                (gameOver) => {
                    this.endGame(gameOver);
                    modal.show(
                        "Você perdeu!",
                        "A palavra é <span class='answer'>" + this.data.answer + "</span>.<br/>Tente novamente mais tarde...",
                        "Ok",
                        function () {
                            modal.hide();
                        }
                    );
                    this.render();
                }
            );
        } catch (e) {
            notification.show(e.message);
            console.log(e);
        }
    }

    endGame(gameData) {        
        this.data.guesses = gameData.guesses;
        this.data.answer = gameData.answer;
        this.data.state = gameData.state;
        this.doUpdateGuess("");
        if(!this.practiceMode){
            ChutOnData.saveGameData(this.data);
            this.updateStats();
        }
    }

    updateStats() {
        let stats = ChutOnData.loadGameStats();
        stats.count.total += 1;
        console.log(this.data.state);
        if (this.data.state == ChutOnCore.STATE_WIN) {
            stats.count["win" + this.data.guesses.length] += 1;
        } else {
            stats.count["lost"] += 1;
        }
        stats.history.push(this.data);
        console.log(stats);
        ChutOnData.saveGameStats(stats);
    }

    congratulate(count) {
        switch (count) {
            case 1: notification.show("Que sorte!"); break;
            case 2: notification.show("Sua inteligência é acima da média!"); break;
            case 3: notification.show("Você é muito inteligente!"); break;
            case 4: notification.show("Você é esperto!"); break;
            case 5: notification.show("Parabéns!"); break;
            case 6: notification.show("Ufa!"); break;
        }
    }

    hideLoading = function () {
        document.getElementById("loading").style.display = "none";
        document.getElementById("content").style.display = "block";
    }
}

// Initial empty word dictionary
var words = {
    selected : [],
    index : {}
}

var loadGame = () => {
    console.log("Aguardando o dicionário de palavras ser carregado..");
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
