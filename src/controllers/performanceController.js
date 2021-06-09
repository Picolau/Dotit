import levels from '../levels';

export default class {
    constructor() {
        if (!localStorage.getItem('game'))
            this.#init('game');
        if (!localStorage.getItem('challenge'))
            this.#init('challenge');
        if (!localStorage.getItem('stored-performances'))
            this.#initStored();
    }

    #init(type) {
        let performance = {
            level: {
                id: undefined,
                code: undefined
            },
            start: undefined,
            end: undefined,
            retries: 0,
            hints: 0,
        };

        localStorage.setItem(type, JSON.stringify(performance));
    }

    #initStored() {
        localStorage.setItem('stored-performances', JSON.stringify({
            'game': [], 
            'challenge': []
        }));
    }

    store(type) {
        let storedPerformances = this.get('stored-performances');
        let performance = this.get(type);
        storedPerformances[type].push(performance);
        localStorage.setItem('stored-performances', JSON.stringify(storedPerformances));
    }

    resetStored(type) {
        let storedPerformances = this.get('stored-performances');
        storedPerformances[type] = [];
        localStorage.setItem('stored-performances', JSON.stringify(storedPerformances));
    }

    getStored(type) {
        let storedPerformances = JSON.parse(localStorage.getItem('stored-performances'));
        return storedPerformances[type];
    }

    get(type) {
        return JSON.parse(localStorage.getItem(type))
    }

    set(type, level) {
        let performance = this.get(type);
        let reset = level.id != performance.level.id;
        
        if (reset) {
            performance.level = {
                id: level.id,
                code: level.code,
            };
            performance.retries = 0;
            performance.hints = 0;
            performance.start = undefined;
            performance.end = undefined;
            localStorage.setItem(type, JSON.stringify(performance));
        }
    }

    incRetries(type) {
        let performance = this.get(type);
        performance.retries += 1;
        localStorage.setItem(type, JSON.stringify(performance));
    }

    incHints(type) {
        let performance = this.get(type);
        performance.hints += 1;
        localStorage.setItem(type, JSON.stringify(performance));
    }

    startClock(type) {
        let performance = this.get(type);
        performance.start = Date.now();
        localStorage.setItem(type, JSON.stringify(performance));
    }

    endClock(type) {
        let performance = this.get(type);
        performance.end = Date.now();
        localStorage.setItem(type, JSON.stringify(performance));
    }
}