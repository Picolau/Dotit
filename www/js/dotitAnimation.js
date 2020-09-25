class DotitAnimation {
    #hasEnded;
    #totalDistance;

    // obj[hey], value_limit and boundaries expected to be numbers
    constructor (obj, key, limit_value, lerp_value, min_error=0.001) {
        this.obj = obj;
        this.key = key;
        this.limit_value = limit_value;
        this.lerp_value = lerp_value; 
        this.min_error = min_error; // By Default
        
        this.#totalDistance = Math.abs(this.obj[this.key] - this.limit_value);
        this.#hasEnded = false;
    }

    update() {
        this.obj[this.key] = lerp(this.obj[this.key], this.limit_value, this.lerp_value);
        let remainingDistance = Math.abs(this.obj[this.key] - this.limit_value);

        if ((remainingDistance / this.#totalDistance) < this.min_error) {
            this.obj[this.key] = this.limit_value;
            this.#hasEnded = true;
            console.log("cabou");
        }
    }

    ended() {
        return this.#hasEnded;
    }
}