import { secureStorage } from '../index'

export default class {
    constructor() {
        this.playerId = secureStorage.getItem('player-id');
        
        if (!this.playerId)
            this.requestId()
    }

    #get(slug) {
        return new Promise((resolve, reject) => {
            fetch('http://localhost:4100'+slug, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                if (!response.ok)
                    return response.json().then(response => {reject(response.message)})
                return response.json();
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            })
        });
    }

    #post(slug, obj) {
        return new Promise((resolve, reject) => {
            fetch('http://localhost:4100'+slug, {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                if (!response.ok)
                    return response.json().then(response => {reject(response.message)})
                return response.json();
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            })
        });
    }

    requestId() {
        return new Promise((resolve, reject) => {
            this.playerId ? resolve(this.playerId) :
            this.#post('/players', {}).then((player) => {
                this.playerId = player._id;
                secureStorage.setItem('player-id', player._id);
                resolve(player._id);
            }).catch((error) => {
                reject(error)
            })
        });
    }

    requestDailyChallenge() {
        return new Promise((resolve, reject) => {
            this.#get('/levels/daily-challenge').then((level) => {
                resolve(level);
            }).catch((error) => {
                reject(error)
            })
        });
    }

    sendGamePerformances(performances) {
        let id = this.playerId; // always guaranteed
        return new Promise((resolve, reject) => {
            this.#post('/performances/game', {
                playerId: id,
                performances: performances
            }).then(performances => {
                resolve(performances);
            }).catch((err) => {
                reject(err);
            })
        })
    }

    sendChallengePerformance(performance) {
        let id = this.playerId; // always guaranteed
        return new Promise((resolve, reject) => {
            this.#post('/performances/challenge', {
                playerId: id,
                performance: performance
            }).then(performance => {
                resolve(performance);
            }).catch((err) => {
                reject(err);
            })
        })
    }

    requestResults(type) {
        let id = this.playerId; // always guaranteed
        return new Promise((resolve, reject) => {
            let url = '/performances/' + type + '-results/' + id;
            this.#get(url).then(results => {
                resolve(results);
            }).catch((err) => {
                reject(err);
            })
        })
    }
}