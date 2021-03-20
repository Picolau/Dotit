/** Visible to all */
export default class {
    constructor() {
        this.game_animations = [];
    }

    update_and_draw() {
        let i = 0;
        while (i < this.game_animations.length) {
            let animation = this.game_animations[i];
            
            if (animation.ended()) {
                this.game_animations.splice(i,1);
            } else {
                animation.update();
                i++;
            }
        }
    }

    new_animation(animation) {
        this.game_animations.push(animation);
    }

    clear_animations(force_end=false) {
        while (this.game_animations.length) {
            let animation = this.game_animations.pop();
            if (force_end) 
                animation.force_end();
        }
    }

    is_animating() {
        return this.game_animations.length > 0;
    }
}