class ChutOnData {
    static CHUTON_VERSION = "1.0.0";
    static STORAGE_DATA = "chuton.data";
    static STORAGE_STATS = "chuton.stats";    
    static INITIAL_DATA = {
        "guesses": [],
        "guess": "",
        "answer": "",
        "keys": {},
        "index": 0,
        "state": 0,
        "version": ChutOnData.CHUTON_VERSION,
        "timestamp": new Date().getTime()
    }
    static INITIAL_STATS = {
        "count": {
            "total": 0,
            "lost": 0,
            "win1": 0,
            "win2": 0,
            "win3": 0,
            "win4": 0,
            "win5": 0,
            "win6": 0
        },
        "history": [],
        "version": ChutOnData.CHUTON_VERSION
    }

    static loadGameData() {
        let data = window.localStorage.getItem(ChutOnData.STORAGE_DATA);
        let obj = undefined;
        if (data) {
            obj = JSON.parse(data);
        } else {
            obj = { ...ChutOnData.INITIAL_DATA };
        }
        return obj;
    }

    static saveGameData(data) {
        window.localStorage.setItem(ChutOnData.STORAGE_DATA, JSON.stringify(data));
    }

    static loadGameStats = function () {
        let data = window.localStorage.getItem(ChutOnData.STORAGE_STATS);
        if (data) {
            return JSON.parse(data);
        } else {
            return ChutOnData.INITIAL_STATS;
        }
    }

    static saveGameStats = function (stats) {
        window.localStorage.setItem(ChutOnData.STORAGE_STATS, JSON.stringify(stats));
    }

    static clearData() {
        window.localStorage.setItem(ChutOnData.STORAGE_DATA, "");
    }

    static clearStats() {
        window.localStorage.setItem(ChutOnData.STORAGE_STATS, "");
    }
}