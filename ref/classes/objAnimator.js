import {P5} from '../index';

export default class {
    #hasEnded;
    #totalDistance;

    // obj[hey], value_limit and boundaries expected to be numbers
    constructor (obj, key, limitValue, lerpValue, min_error=0.005) {
        this.obj = obj;
        this.key = key;
        this.limitValue = limitValue;
        this.lerpValue = lerpValue; 
        this.min_error = min_error; // By Default
        
        this.#totalDistance = Math.abs(this.obj[this.key] - this.limitValue);
        this.#hasEnded = false;
    }

    update() {
        this.obj[this.key] = P5.lerp(this.obj[this.key], this.limitValue, this.lerpValue);
        let remainingDistance = Math.abs(this.obj[this.key] - this.limitValue);

        if (remainingDistance <= this.min_error*this.#totalDistance) {
            this.obj[this.key] = this.limitValue;
            this.#hasEnded = true;
        }
    }

    forceEnd() {
        this.obj[this.key] = this.limitValue;
        this.#hasEnded = true;
    }

    ended() {
        return this.#hasEnded;
    }
}