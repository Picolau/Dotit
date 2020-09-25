class DotitAnimation {
    // obj[hey], value_limit and boundaries expected to be numbers
    constructor (obj, key, limit_value, lerp_value, min_error=0.01) {
        this.obj = obj;
        this.key = key;
        this.limit_value = limit_value;
        this.lerp_value = lerp_value; 
        this.min_error = min_error; // By Default

        this.hasEnded = false;
    }

    update() {
        this.obj[this.key] = lerp(this.obj[this.key], this.limit_value, this.lerp_value);

        if ((Math.abs(this.obj[this.key] - this.value_limit) / this.value_limit) < this.min_error) {
            this.obj[this.key] = this.limit_value;
            this.hasEnded = true;
        }
    }

    ended() {
        return this.hasEnded;
    }
}