function CountDown(elementId, finishCallback) {

    this.timeIt = function () {
        let t1 = new Date();
        let t2 = new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 23, 59, 59, 999);
        var dif = t2.getTime() - t1.getTime();
        return Math.floor(dif / 1000);
    }

    this.refresh = function () {
        let secs = timeIt();
        if (secs < 0) {
            setTimeout(function () {
                finishCallback();
            }, 1000);
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
                    //if(minutes == 1.0){
                    //    text += minutes+" min ";
                    //}else{
                    text += minutes + " min, ";
                    //}
                }
                if (seconds > 0) {
                    // if(seconds == 1){
                    //     text += seconds+" seg";
                    // }else{
                    text += seconds + " seg";
                    //}                
                }

                if (text.endsWith(", ")) {
                    text = substr(text.length - 2)
                }

                element.innerText = text + ".";
            }
            setTimeout(refresh, 1000);
        }
    }

    this.refresh();
}

var countDown = CountDown("time2midnight", function () {
    window.location.href = window.location.href;
    window.location.reload();
})