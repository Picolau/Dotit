const LEVEL_MAX_ROWS = 5;
const LEVEL_MAX_COLS = 8;

class LevelController {
    constructor() {
        this.level = -1;
        this.dots_controller;
        this.messages_controller = new MessagesController();

        this.next_level();
        this.next_level_waiting = false;
    }

    update_and_draw() {
        this.dots_controller?.update_and_draw();
        this.messages_controller.update_and_draw();

        if (this.dots_controller?.connections_ended_success && !this.next_level_waiting) {
            setTimeout(this.next_level.bind(this), 2000);
            this.next_level_waiting = true;
        }
    }

    load_level(level) {
        let dots_code = level[0];
        let messages_code = level[1];
        if (level.length == 2) {
            if (messages_code != "") { // when encounter "", simply let the same message
                this.load_messages(messages_code);
                setTimeout(this.load_dots.bind(this, dots_code), 
                this.messages_controller.messages.length * TIME_BETWEEN_MESSAGES);
            } else {
                this.load_dots(dots_code);
            }
        } else { // if theres no messages_code we show the level number
            this.load_messages((this.level+1)+"");
            setTimeout(this.load_dots.bind(this, dots_code), 250);
        }
    }

    load_dots(code) {
        if (!this.dots_controller)
            this.dots_controller = new DotsController()

        this.dots_controller.load(code);
        this.dots_controller.animate_start();
        this.next_level_waiting = false;
    }

    load_messages(message_code) {
        this.messages_controller.load(message_code);
        this.messages_controller.animate_start();
    }

    next_level() {
        if (this.level < levels.length - 1) {
            this.level++;
            this.load_level(levels[this.level]);
        }
    }

    prev_level() {
        if (this.level > 0) { 
            this.level--;
            this.load_level(levels[this.level]);
        } else if (this.level <= 0) {
            this.level = -1;
            this.load_dots();
            this.load_messages("");
        }
    }

    reload_dots() {
        this.dots_controller.reload();
    }

    print_level_created() {
        this.dots_controller.handleFinish();
    }

    handle_resize() {
        animations_controller.clear_animations();
        this.dots_controller.reposition_dots();
    }
}

const levels = [
    ["013000102","Hi!;Welcome to Joidô!;Rules here are simple: you simply have to draw the given pattern.;Give it a try :)"],
    ["02210000111", "Great work! I see you got it.; How about this other pattern?"],
    ["0231101000102", "Pretty easy right?;Try this one."],
    ["0331020211101000102", "Amazing work!;Keep going..."],
    ["032111020100001", ""],
    ["0321110201000011121", ""],
    ["03321111000010212222120", ""],
    ["023100102010011", ""],
    ["0331011212221201000", ""],
    ["1221000011110", "Wow, congratulations! I'm very impressed!; OK, so here's a catch: you can reconnect dots by clicking on them in case you have some extra clicks available!; The number of extra clicks can be seen down there ↓;Go ahead and give it a shot :D"],
    ["13312112111011110", "OK! I can feel you got the spirit of it!; Can you do this one?!"],
    ["14512130212222324333231202122", "That's amazing!;I mean... You are amazing!; So let's see if we can do some drawing!; What do you think about my boat?"],
    ["133200122100221001220", "Yes, i'm so happy!; Let's draw a star to celebrate!"],
    ["3550010011110010011223344", "And now, i hope that this looks like a kite!; Can you do it with the 3 extra clicks?"],
    ["1321011212010000111", "Really great!; I hope you enjoy the rest of the game!;Good Luck!"],
    ["033121121110100010212222120"],
    ["033101112221202011121201000"],
    ["033121121110102010010202122"],
    ["23321100112212010000102122221"],
    ["23311001011122211202111010211"],
    ["255112122233322110010202122232434443322131222323122130403021222324241403122"],

    ["333100102010010201102122120212212"],
	["3441001021120302112031322313223333231302010000102031323"],
    ["355100102112030211203041322314041322314243342433444434241403020100001020304142434"],

    ["6553122131211223332312111121323332223242322212021221202122232423222314031221304132211001122334434241404030201001020304041424344"],
	["35512112131323323131222120201001122334443423222232414041322314030202122"],
	
    ["15311211011122111011121313021323141"],
    ["45512132333323121111222130413223140312221202122232423223344332211001122324232221202"],
    ["65522131211223332312232423222120212222333231323242322211121312120"],
    
    ["2441112222111010212132322323121201011"],
    ["355233221122333323121111213231403122130413243342312011021"],
	
    ["13312112122212011021222"],
    ["13521111213232212021324232221201102"],
    ["35521222333231312223233323121111202122232423222232423222120"],
    ["5550211202111122221221202121323223231213132332333242333423242312011021324"],

    ["123011110011211"],
    ["23513021112021222232413122322211211202111121323"],
    ["347332332333423132435343332312213222324343332221221302112031425363534333231302131212213031314242535241312"], 	
    
    ["024110102121110111213"],
    ["036202111120203131424252423131222232221"],
    ["048303121223231323323221213231303041413232414243433343525241415252636353637"],
    
    ["1331211100001112122120201"],
    ["1441312111000011121221202010203132322323323"],
    ["155100001111011120201112122122232332322121303020313233343443433232434241413140403"],

    ["23310011110201102010010"],
    ["24410011110201102010010203021202111122112030212"],
    ["355112021110110111202112030211203020100102030403122130403131222213130"],

    ["144111213030212223233232221203031211101001011"],
    ["2451101001011121303021222323121222333342423222120101112131424"],
    ["43310011121121110211201"],
    ["1551112132231323322110011223344434241403122130403020100"],
	["3351011011121111213231303131424140413221100102011021324"],
    ["05210112120303141312111010010203040"],

    ["23310111202011121201000010212222120"],
    ["23410111213232212020111212010000102031323222120"],
    ["244101112132322212030312111010212223233231303020100102030313233"],
	["255101112131424232221203031323334444333231303021222324241312111010010203040414243443424140403020100"],
	["2551122334233241322312011021221322312223242"],
    
    ["0543132222111122232423222120201112131414041424333323130202122231312111000010203"],
	["237100112231405162514031221102010001122130415261606152413021120"],
	["3572011223324152635241322312010203021122334251626362514233221100010203040312213040302132435463626160615243342434433221100"],
    
    ["2552122232232221211011121313031323343332313121314"],
	["25521222333322212112131413031323334433323130314131211100111"],
	["2552122233332221211213141403031323334444333231303041413121110000111"],
    
    ["25722232434332313122232424131303132333435454645443424140405151615141312110100010212"],
    
    ["1584031221304031425364746373635262524151413122322213231304140"],
	["158403031212212130304141525263637473727262524343525150504030212223233232221203040"],
];