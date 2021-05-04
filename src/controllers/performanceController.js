import levels from '../levels';

export default class {
    constructor() {
        this.levelsPerformance = localStorage.getItem("levels-performance");
        
        if (!this.levelsPerformance)
            localStorage.setItem("levels-performance", JSON.stringify({}));       
    }

    #init(level) {
        let levelPerfObj = {
            retries: 0,
            hints: 0,
            start: Date.now(),
            end: 0
        };

        this.levelsPerformance[level] = levelPerfObj;
    }

    #get(level) {
        this.levelsPerformance = localStorage.getItem("levels-performance");
        this.levelsPerformance = JSON.parse(this.levelsPerformance);

        if (!(level in this.levelsPerformance))
            this.#init(level)

        return this.levelsPerformance[level];
    }

    #set() {
        localStorage.setItem("levels-performance", JSON.stringify(this.levelsPerformance))
    }

    reset() {
        localStorage.setItem("levels-performance", JSON.stringify({}))
    }

    incRetries(level) {
        let levelPerf = this.#get(level);
        levelPerf.retries += 1;
        this.#set();
    }

    incHints(level) {
        let levelPerf = this.#get(level);
        levelPerf.hints += 1;
        this.#set();
    }

    setClockStart(level) {
        let levelPerf = this.#get(level);
        levelPerf.start = Date.now();
        this.#set();
    }

    setClockEnd(level) {
        let levelPerf = this.#get(level);
        levelPerf.end = Date.now();
        this.#set();
    }

    results() {
        this.levelsPerformance = localStorage.getItem("levels-performance");
        return this.levelsPerformance;
    }

    resultsMax() {
        function idxLevel(lvlCode) {
            for (let i = 0;i < levels.length;i++) {
                if (levels[i][0] == lvlCode)
                    return i;
            }

            return -1;
        }

        let resultsMax = {
            time: {
                value: 0,
                level: 0
            },
            hints: {
                value: 0,
                level: 0
            },
            retries: {
                value: 0,
                level: 0
            }
        }

        this.levelsPerformance = localStorage.getItem("levels-performance");
        this.levelsPerformance = JSON.parse(this.levelsPerformance);
        
        for (let levelCode in this.levelsPerformance) {
            let level = idxLevel(levelCode);
            let perf = this.levelsPerformance[levelCode];
            perf.time = perf.end - perf.start;

            if (perf.retries > resultsMax.retries.value) {
                resultsMax.retries.value = perf.retries;
                resultsMax.retries.level = level;
            }

            if (perf.hints > resultsMax.hints.value) {
                resultsMax.hints.value = perf.hints;
                resultsMax.hints.level = level;
            }

            if (perf.time > resultsMax.time.value) {
                resultsMax.time.value = perf.time;
                resultsMax.time.level = level;
            }
        }

        return resultsMax;
    }
}