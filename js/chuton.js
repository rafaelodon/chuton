class ChutOn {    

    constructor() {
        console.log("Iniciando ChutOn...")
        this.modal = new Modal("modal");
        this.notification = new Notification("notification");
        this.data = ChutOnData.loadGameData();
        this.game = this.createOrContinueGame();
        this.hideLoading();
        this.preRender();
        this.bindEvents();
        this.doUpdateGuess(this.data.guess);
        this.practiceMode = false;
    }

    createOrContinueGame() {
        let dayIndex = Utils.calculateDayIndex();
        if (this.data.index != dayIndex) {
            this.notification.show("Começando um novo jogo!");
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
            Utils.preSanitize(value);
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
        this.renderResult("result");
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

    render(drama=false) {        
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                
                let cell = document.getElementById('cell_' + i + '_' + j);
                cell.setAttribute('class', 'cell');
                cell.innerHTML = "&nbsp;";     

                if (i < this.data.guesses.length) {                    
                    let character = this.data.guesses[i].guess[j];
                    let cellState = this.data.guesses[i].feedback[j];                    
                    cell.innerText = character;                    
                    if(drama && i == this.data.guesses.length - 1){
                        setTimeout(() => cell.setAttribute('class', 'cell ' + cellState), 125*j);
                    }else{
                        cell.setAttribute('class', 'cell ' + cellState);
                    }                
                } else if (i == this.data.guesses.length && this.game.gameState == ChutOnCore.STATE_PLAYING) {
                    if (j < this.data.guess.length) {
                        cell.innerText = this.data.guess[j];
                    }
                } else {
                    cell.setAttribute('class', 'cell disabled');
                }
            }
        }

        let keys = "abcdefghijklmnopqrstuvwxyz";
        for(let i in keys){
            let key = document.getElementById("key_" + keys[i].toUpperCase());
            key.setAttribute('class', 'key');
            if(keys[i] in this.data.keys){                
                key.setAttribute('class', 'key ' + this.data.keys[keys[i]]);
            }
        }

        this.renderResult("result");
    }

    renderResult(elementId) {
        if(!this.practiceMode){
            if (this.game.gameState != ChutOnCore.STATE_PLAYING) {
                let result = document.getElementById(elementId);
                result.style.display = "block";
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
        this.bindEndPracticeButton("endPractice");
        this.bindKeys();
    }

    bindGuessInput(elementId) {

        let guessInput = document.getElementById(elementId);        

        let onBlurGuessInput = (event) => {
            setTimeout(() => guessInput.focus(), 10);
        }

        let onKeyUpGuessInput = (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                this.onClickEnter();
            } else {
                this.doUpdateGuess(guessInput.value);
            }
        }

        if (!Utils.isMobile()) {
            guessInput.onblur = onBlurGuessInput;
            guessInput.onkeyup = onKeyUpGuessInput;
            guessInput.focus();
        }
    }

    bindHelpButton(elementId) {

        let helpButton = document.getElementById(elementId);

        helpButton.onclick = () => {
            let helpContent = document.getElementById("help").innerHTML;
            this.modal.show("Ajuda", helpContent, "Ok", () => this.modal.hide());
        };
    }

    bindScoreButton(elementId) {

        let scoreButton = document.getElementById(elementId);

        scoreButton.onclick = () => {
            let stats = ChutOnData.loadGameStats();

            let total = stats.count.total;
            let lost = stats.count.lost;
            let lost_perc = total > 0 ? Math.floor(lost / total * 100) : 0;
            let wins = stats.count.win1 + stats.count.win2 + stats.count.win3 +
                stats.count.win4 + stats.count.win5 + stats.count.win6;
            let win_perc = total > 0 ? Math.floor(wins / total * 100): 0;

            document.getElementById("score-total").innerText = "" + total + " jogos";
            document.getElementById("score-wins").innerText = "" + wins + " vitórias (" + win_perc + "%)";

            for (let c = 1; c <= 6; c++) {
                let num = stats.count["win" + c];
                let perc = total > 0 ? Math.floor(num / total * 100) : 0;                
                
                let el = document.getElementById("score-win" + c).getElementsByClassName("bar")[0];
                el.style.height = "" + (100 - perc) + "%";                
                
                let el2 = document.getElementById("score-win" + c).getElementsByClassName("perc")[0];
                el2.innerText = perc >= 10 ? ""+perc+"%" : "";                
            }

            let el = document.getElementById("score-lost").getElementsByClassName("bar")[0];
            el.style.height = "" + (100 - lost_perc) + "%";
            
            let el2 = document.getElementById("score-lost").getElementsByClassName("perc")[0];
            el2.innerText = lost_perc >= 10 ? ""+lost_perc+"%" : "";                

            let scoreContent = document.getElementById("score").innerHTML;
            this.modal.show("Placar", scoreContent, "Ok", () => this.modal.hide());
        }
    }

    bindResetButton(elementId) {

        let resetButton = document.getElementById(elementId);

        resetButton.onclick = () => {            
            //Hard reset
            //ChutOnData.clearData();            
            //window.location.href = window.location.href;
            //window.location.reload();

            //Soft reset (practice with a sample word)
            this.modal.show("Praticar","Você vai praticar com uma nova palavra aleatória.<br/><br/>"+
                "O treino não entra para suas estatísticas.<br/><br/>"+
                "O jogo do dia continua preservado.","Ok", () => {
                this.modal.hide();
                this.practiceMode = true;
                let index = Math.floor(Math.random() * words.selected.length);
                this.game = new ChutOnCore(words.selected[index]);                
                this.data.guesses = [];
                this.data.guesses.length = 0;
                this.data.index = index;
                this.data.keys = this.game.charsState;                
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
                text = "Acertei o ChutOn #" + Utils.calculateDayIndex() + "\n\n";
                for (let i = 0; i < this.data.guesses.length; i++) {
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
            this.notification.show("Copiado! Compartilhe com CTRL+V (Colar).")            
        }
    }

    bindEndPracticeButton(elementId) {
        let endPraticeButton = document.getElementById(elementId);
        endPraticeButton.onclick = () => {
            window.location.href = window.location.href;
            window.location.reload();
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

    onClickBackSpace = (t) => {
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
                    this.render(true);
                },
                (fail) => {
                    this.data.guesses = fail.guesses;
                    this.data.state = fail.state;
                    this.doUpdateGuess("");
                    this.render(true);
                },
                (gameOver) => {
                    this.endGame(gameOver);                    
                    let texto = "A palavra é:<br/><span class='answer'>" + this.data.answer + "</span>.<br/><br/>Tente novamente mais tarde ou treine com uma palavra aleatória...";
                    if(this.practiceMode){
                        texto = "A palavra é:<br/><span class='answer'>" + this.data.answer + "</span>.<br/><br/>Você pode continuar treinando com outras palavras!";
                    }
                    setTimeout(() => this.modal.show("Você perdeu!",texto,"Ok", () => this.modal.hide()),1000);
                    this.render(true);
                }
            );
        } catch (e) {
            this.notification.show(e.message);
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
        if (this.data.state == ChutOnCore.STATE_WIN) {
            stats.count["win" + this.data.guesses.length] += 1;
        } else {
            stats.count["lost"] += 1;
        }
        stats.history.push(this.data);        
        ChutOnData.saveGameStats(stats);
        ChutOnData.loadGameStats();
    }

    congratulate(count) {
        switch (count) {
            case 1: this.notification.show("Que sorte!"); break;
            case 2: this.notification.show("Sua inteligência é acima da média!"); break;
            case 3: this.notification.show("Você é muito inteligente!"); break;
            case 4: this.notification.show("Você é esperto!"); break;
            case 5: this.notification.show("Parabéns!"); break;
            case 6: this.notification.show("Ufa!"); break;
        }
    }

    hideLoading = () => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("content").style.display = "block";
    }
}
