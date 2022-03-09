
class ChutOnCore {

    static ERR_NOT_FOUND = "A palavra não existe no dicionário utilizado.";    
    static ERR_WRONG_LENGTH = "A palavra deve ter 5 letras.";
    static ERR_GAME_IS_OVER = "O jogo já está encerrado.";
    static RESP_WIN = "VVVVV";
    static CH_RIGHT = "V";
    static CH_MISPLACED = "P";
    static CH_MISS = "X";
    static STATE_PLAYING = 0;
    static STATE_WIN = 1;
    static STATE_LOST = -1;

    constructor(words, answer){        
        this.words = words;
        this.answer = answer;           
        this.guesses = [];        
        this.charsState = {};        
        this.gameState = ChutOnCore.STATE_PLAYING;        
    }

    checkChars(word) {        
        let result=["","","","",""];    
        let answer=Utils.sanitize(this.answer).split('');
        let guess=Utils.sanitize(word).split('');                        

        for(let c=0; c<5; c++){
            let gc=guess[c];
            if(gc==answer[c]){
                result[c]=ChutOnCore.CH_RIGHT;
                this.charsState[gc]=ChutOnCore.CH_RIGHT;                
                answer[c] = "_";
                guess[c] = "_";
            }
        }        
        
        for(let c=0; c<5; c++){
            let gc=guess[c];
            if(gc != "_"){
                if (answer.includes(gc)){                    
                    if(guess.slice(0,c+1).filter(e=>e==gc).length <= answer.filter(e=>e==gc).length){
                        result[c]=ChutOnCore.CH_MISPLACED;                            
                    }else{                    
                        result[c]=ChutOnCore.CH_MISS;                            
                    }                
                    if(this.charsState[gc] != ChutOnCore.CH_RIGHT){
                        this.charsState[gc] = ChutOnCore.CH_MISPLACED;
                    }
                }else{
                    result[c]=ChutOnCore.CH_MISS;
                    this.charsState[gc]=ChutOnCore.CH_MISS;
                }
            }
        }

        return result.join('');            
    }

    checkWord(word) {        
        if(word){        
            let guess=Utils.sanitize(word);
            if(guess.length != 5) {
                throw new Error(ChutOnCore.ERR_WRONG_LENGTH);
            }else{
                if(guess in this.words.index) {
                    console.log("Palavra encontrada:", guess, this.words.index[guess]);
                    return this.checkChars(guess);
                }else{
                    throw new Error(ChutOnCore.ERR_NOT_FOUND);                
                }
            }
        }else{
            throw new Error(ChutOnCore.ERR_WRONG_LENGTH);
        }
    }    

    try2guess(guess, sucessCallback, failCallback, gameOverCallback){
        if(this.gameState != ChutOnCore.STATE_PLAYING){
            throw new Error(ChutOnCore.ERR_GAME_IS_OVER);
        }else{
            let resp = this.checkWord(guess);
            this.guesses.push({
                'guess':guess,
                'feedback':resp
            });            
            if(resp == ChutOnCore.RESP_WIN){
                console.log("Você ganhou!");
                this.gameState=ChutOnCore.STATE_WIN;
                sucessCallback({
                    'guesses':this.guesses,
                    'state':this.gameState
                });
            }else if(this.guesses.length == 6){
                console.log("Você perdeu!",this.answer);
                this.gameState=ChutOnCore.STATE_LOST;
                gameOverCallback({
                    'guesses':this.guesses,
                    'state':this.gameState,
                    'answer':this.answer
                });
            }else {
                console.log(resp,"Tente novamente");
                failCallback({
                    'guesses':this.guesses,
                    'state':this.gameState
                })
            }
        }
    }    
}
