/** Visible to all */
export default class {
    constructor() {
        this.gameAnimations = [];
    }

    updateAndDraw() {
        let i = 0;
        while (i < this.gameAnimations.length) {
            let animation = this.gameAnimations[i];
            
            if (animation.ended()) {
                this.gameAnimations.splice(i,1);
            } else {
                animation.update();
                i++;
            }
        }
    }

    newAnimation(animation) {
        this.gameAnimations.push(animation);
    }

    clearAnimations(forceEnd=false) {
        while (this.gameAnimations.length) {
            let animation = this.gameAnimations.pop();
            if (forceEnd) 
                animation.forceEnd();
        }
    }

    isAnimating() {
        return this.gameAnimations.length > 0;
    }
}