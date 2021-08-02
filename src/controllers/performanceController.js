import levels from '../levels';
import { secureStorage } from '../index'

export default class {
    constructor() {
        if (!secureStorage.getItem('game'))
            this.#init('game');
        if (!secureStorage.getItem('challenge'))
            this.#init('challenge');
        if (!secureStorage.getItem('stored-performances'))
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

        secureStorage.setItem(type, JSON.stringify(performance));
    }

    #initStored() {
        secureStorage.setItem('stored-performances', JSON.stringify({
            'game': [], 
            'challenge': []
        }));
    }

    store(type) {
        let storedPerformances = this.get('stored-performances');
        let performance = this.get(type);
        storedPerformances[type].push(performance);
        secureStorage.setItem('stored-performances', JSON.stringify(storedPerformances));
    }

    resetStored(type) {
        let storedPerformances = this.get('stored-performances');
        storedPerformances[type] = [];
        secureStorage.setItem('stored-performances', JSON.stringify(storedPerformances));
    }

    getStored(type) {
        let storedPerformances = JSON.parse(secureStorage.getItem('stored-performances'));
        return storedPerformances[type];
    }

    get(type) {
        return JSON.parse(secureStorage.getItem(type))
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
            secureStorage.setItem(type, JSON.stringify(performance));
        }
    }

    incRetries(type) {
        let performance = this.get(type);
        performance.retries += 1;
        secureStorage.setItem(type, JSON.stringify(performance));
    }

    incHints(type) {
        let performance = this.get(type);
        performance.hints += 1;
        secureStorage.setItem(type, JSON.stringify(performance));
    }

    startClock(type, add_time=0) {
        let performance = this.get(type);
        performance.start = Date.now() + add_time;
        secureStorage.setItem(type, JSON.stringify(performance));
    }

    endClock(type) {
        let performance = this.get(type);
        performance.end = Date.now();
        secureStorage.setItem(type, JSON.stringify(performance));
    }
}