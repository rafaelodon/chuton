
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

    constructor(answer){
        this.answer = answer;           
        this.guesses = [];        
        this.charsState = {};        
        this.gameState = ChutOnCore.STATE_PLAYING;        
    }

    checkChars = function (word) {        
        let result="";    
        let answer=sanitize(this.answer);
        let guess=sanitize(word);           
        for(let c=0; c<5; c++){
            let gc=guess[c];
            if(gc==answer[c]){
                result+=ChutOnCore.CH_RIGHT;
                this.charsState[gc]=ChutOnCore.CH_RIGHT;
            }else if (answer.includes(gc)){                                                
                let re = new RegExp(""+gc, 'g');                
                if((answer.match(re) || []).length >= (guess.match(re) || []).length){
                    result+=ChutOnCore.CH_MISPLACED;                            
                }else{
                    result+=ChutOnCore.CH_MISS;                            
                }
                if(this.charsState[gc] != ChutOnCore.CH_RIGHT){
                    this.charsState[gc] = ChutOnCore.CH_MISPLACED;
                }
            }else{
                result+=ChutOnCore.CH_MISS;
                this.charsState[gc]=ChutOnCore.CH_MISS;
            }
        }    
        return result;            
    }

    checkWord = function (word) {        
        if(word){        
            let guess=sanitize(word);
            if(guess.length != 5) {
                throw new Error(ChutOnCore.ERR_WRONG_LENGTH);
            }else{
                if(guess in words.index) {
                    console.log("Palavra encontrada:",guess,words.index[guess]);
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
