const enMessages = { 
    en: {
        translations: {
            menu: {
                continue: "Continue Game",
                new: "Start New Game",
                challenge: "Daily Challenge",
                create: "Create a Level",
                load: "Load a Level",
                color: "Background Color"
            },
            messages: {
                tutorial: [
                    "Hi!;Welcome to Joid\xF4!;Rules here are simple: you simply have to draw the given pattern.;Give it a try :)",
                    "Pretty easy right?;Try this one.",
                    "Great work! I see you got it.; How about this other pattern?",
                    "Amazing work!;Keep going...;And if you feel stuck, you can use a hint, which you'll earn for every 3 patterns completed",
                    "Wow, congratulations! I'm very impressed!; OK, so here's a catch: you can reconnect dots by clicking on them in case you have some extra clicks available!; The number of extra clicks can be seen up there;Go ahead and give it a shot :D",
                    "OK! I can feel you got the spirit of it!; Can you do this one?!",
                    "That's amazing!;I mean... You are amazing!; So let's see if we can do some drawing!; What do you think about my boat?",
                    "Yes, i'm so happy!; Let's draw a star to celebrate!",
                    "And now, i hope that this looks like a kite!; Can you do it with the 3 extra clicks?",
                    "Really great, you've completed the tutorial!;There are 90 levels at total, that tends to increase in difficulty as you move on.;I hope you enjoy the rest of the game and good luck!",
                ],
                continue: "Click/Tap anywhere near to continue",
                clipboard: {
                    success: "!Copied to clipboard",
                    error: ".Error copying to clip",
                },
                loadLevel: {
                    info: "Paste the pattern code here and hit Enter!",
                    error: "This code is incorrect. Check it's correctness and try again.",
                }
            },
            info: {
                extra: "Extra",
                tips: "Hints",
                free: "Free",
            },
            endScreen: {
                congratulationsText: "Congratulations!",
                congratulations1: "You've made it! Thanks a lot for playing the game! Fortunately, things don't end just here... You can create levels and share it with your friends, or load some of their created levels! Also, there are daily challenges available for you, and you can replay the entire game if you wish too, by accessing 'Start New Game' on menu.",
                congratulations2: "We are open to receive feedback or suggestions to improve the game, so send us an e-mail if you want to, we will be happy to hear from you! Also, you can create levels and share it with us to so we can put it on the daily challenges :D",
                congratulations3: "Down here you can see the results of your game compared to others that are playing too. And some curiosities and stories about us and the creation of this game. Thank you again and have a great day!",

                resultsText: "Results",
                youOthersText: " (You / Others)",
                betterThan: "You performed better than ",
                ofPeople: " of people",
                totalTimeText: "Total time taken: ",
                totalRetriesText: "Total retries: ",
                totalHintsText: "Total hints: ",
                theLevel: "The level ",
                maxTimeText: " was the one that took you the longest: ",
                maxRetriesText: " was the one you retried the most: ",
                maxHintsText: " was the one you used the most hints: ",

                curiositiesText: "Curiosities",
                curiositiesInfo: "Ok, for those who stuck around, here are some curiosities about this game: ",
                curiosities1: "The name Joido actually come from cutting and concatenating the words 'Join' and 'Dots'. It just sounded cool!",
                curiosities2: "This game was inspired by some of our friends who wanted to see what cool patterns he could draw on smartphones about 5 years ago; Well, he eventually started drawing some very challenging patterns and the idea started growing from there.",
                curiosities3: "Initially, this game was to be released as a native Android app, but we didn't know how to do some crazy good animations back there. Then we learned some javascript over the years and the thing kinda grew!",
                curiosities4: "There's no algorithm to check the minimum amount of clicks possible to perform a given pattern, we just had to brute force trial and error until we guessed what would be the optimal solution. (Wish you good luck if you are going to try to implement it :D)",
            }
        }
    }
}

export { enMessages }