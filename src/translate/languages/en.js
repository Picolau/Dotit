const enMessages = { 
    en: {
        translations: {
            menu: {
                continue: "Continue Game",
                tutorial: "Replay Tutorial",
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
                tapContinue: "Click/Tap anywhere near to continue",
                tapTryAgain: "Click/Tap anywhere near to try again.",
                dailyChallenge: {
                    fetching: "Syncing...",
                    successFetching: "New challenge available! Enjoy!",
                    errorFetching: "Oops! Something went wrong."
                },
                clipboard: {
                    success: "!Copied to clipboard",
                    error: ".Error copying to clip",
                },
                loadLevel: {
                    info: "Paste the pattern code here and hit Enter!",
                    error: "This code is incorrect. Check it's correctness and try again.",
                },
                api: {
                    syncingPerformances: "Trying to communicate with my master... Just a sec!",
                    fetchingResults: "Ok, i was told he's preparing your results, let's see...",
                    resultsSuccess: "Finally!! Enjoy your results...",
                    resultsError: "Oh no! It seems master is off right now... Please, consider trying again later.",
                    performCaptcha: "I need you to perform this captcha. It won't take long, i promise.",
                    errorCaptcha: "Ouch, it seems something went wrong with captcha, please try again."
                }
            },
            info: {
                extra: "Extra",
                tips: "Hints",
                free: "Free",
            },
            infoScreen: {
                congratulationsText: "Congratulations!",
                congratulations1: "You've made it! Thanks a lot for playing the game! Fortunately, things don't end just here... You can create levels and share it with your friends, or load some of their created levels! Also, there are daily challenges available for you, and you can replay the entire game if you wish too, by accessing 'Start New Game' on menu.",
                congratulations2: "We are open to receive feedback or suggestions to improve the game, so send us an e-mail if you want to, we will be happy to hear from you! Also, you can create levels and share it with us to so we can put it on the daily challenges :D",
                congratulations3: "Down here you can see the results of your game compared to others that are playing too. And some curiosities and stories about us and the creation of this game. Thank you again and have a great day!",

                backText: {
                    game: "Back to levels",
                    challenge: "Back to challenge"
                },
                refreshText: "Refresh results",
                resultsText: "Results",
                resultsErrorMessage: "Oops, sorry! Something went wrong with the server communication. Please try again later, by reloading this page!",
                youOthersText: " (You / Others)",
                betterThan: "You performed equal to or better than ",
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
                curiosities2: "No need to say, this game was inspired by password patterns on modern smartphones. Some of our friends wanted to see what cool patterns he could draw and eventually started drawing some very challenging ones. The idea started growing from there.",
                curiosities3: "Initially, this game was to be released as a native Android app, but we wanted to see as many people as possible playing the game, so we decided to launch it as a website",
                curiosities4: "There's no algorithm to check the minimum amount of clicks possible to perform a given pattern, we just had to brute force trial and error until we guessed what would be the optimal solution.",
            }
        }
    }
}

export { enMessages }