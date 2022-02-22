class Modal {    
    constructor(elementId, visibleClass="visible", hiddenClass="hidden"){
        this.modal = document.getElementById(elementId);    
        this.modalButton = this.modal.getElementsByClassName("modal-button")[0];
        this.modalTitle = this.modal.getElementsByClassName("modal-title")[0];
        this.modalText = this.modal.getElementsByClassName("modal-text")[0];
        this.modalButtonCallback = undefined;    
        this.visibleClass = visibleClass;
        this.hiddenClass = hiddenClass;
    }    

    show(title,text,buttonText,callback){
        this.modal.style.display = 'block';        
        this.modal.setAttribute('class',this.visibleClass);    
        if(this.modalTitle){
            this.modalTitle.innerText = title;
        }
        if(this.modalText){
            this.modalText.innerHTML = text;    
        }
        if(this.modalButton){
            this.modalButton.innerText = buttonText;    
            if(this.modalButtonCallback){
                this.modalButton.removeEventListener('click', this.modalButtonCallback)
            }
            this.modalButtonCallback = callback;
            this.modalButton.addEventListener('click', this.modalButtonCallback);
        }
    }

    hide() {
        this.modal.setAttribute('class',this.hiddenClass);
        let that = this;
        setTimeout(function() {
            that.modal.style.display = 'none';
        }, 500);
    }
}


class Notification{
    
    constructor(elementId, visibleClass="visible", hiddenClass="hidden") {
        this.elementId=elementId;
        this.visibleClass=visibleClass;
        this.hiddenClass=hiddenClass;
    }
    
    show(text,duration=3000) {    
        let notification = document.getElementById(this.elementId);
        notification.innerText=text;
        //show
        notification.style.display = 'block';
        notification.setAttribute('class',this.visibleClass);  
        if(duration > 0){      
            setTimeout(function() {
                //wait then hide
                notification.setAttribute('class',this.hiddenClass);
                setTimeout(function() {                          
                    notification.style.display = 'none';
                }, 500);
            }, duration);    
        }
    }
}