function CountDown(elementId, finishCallback) {        

    this.timeIt = function (endDate) {        
        let now = new Date();
        let then = endDate;
        var dif = then.getTime() - now.getTime();
        return Math.floor(dif / 1000);
    }

    this.refresh = function (startDate) {
        let secs = timeIt(startDate);
        if (secs < 0) {
            setTimeout(finishCallback, 1000);
        } else {
            let element = document.getElementById(elementId);
            if (element != undefined) {
                let seconds = Math.ceil(secs % 60) + 1;
                let minutes = Math.floor(secs / 60 % 60);
                let hours = Math.floor(secs / 60 / 60);
                let text = "";
                if (seconds)
                    if (hours > 0) {
                        if (hours == 1) {
                            text += hours + " hora, ";
                        } else {
                            text += hours + " horas, ";
                        }
                    }
                if (minutes > 0) {
                    text += minutes + " min, ";
                }
                if (seconds > 0) {
                    text += seconds + " seg";               
                }

                if (text.endsWith(", ")) {
                    text = substr(text.length - 2)
                }

                element.innerText = text + ".";
            }
            setTimeout(() => refresh(endDate), 1000);
        }
    }
    
    let today = new Date();
    let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    this.refresh(endDate);
}

var countDown = CountDown("time2midnight", () => {
    window.location.href = window.location.href;
    window.location.reload();
})
